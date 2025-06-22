use anchor_lang::prelude::*;
use anchor_lang::solana_program::clock::Clock;
use anchor_lang::solana_program;
use anchor_spl::token_interface::{self, TokenInterface, Mint, TokenAccount};
use crate::state::{AmmState, TwapOracle};
use crate::errors::AmmError;
use anchor_lang::system_program::System;

#[derive(Accounts)]
pub struct InitializePool<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,
    #[account(
        init,
        payer = payer,
        space = 8 + AmmState::LEN,
        seeds = [b"amm", token_a.key().as_ref(), token_b.key().as_ref()],
        bump
    )]
    pub amm: Account<'info, AmmState>,
    #[account(
        init,
        payer = payer,
        space = 8 + TwapOracle::LEN,
        seeds = [b"oracle", amm.key().as_ref()],
        bump
    )]
    pub oracle: Account<'info, TwapOracle>,
    pub token_a: UncheckedAccount<'info>,
    pub token_b: UncheckedAccount<'info>,
    pub system_program: Program<'info, System>
}

#[derive(Accounts)]
pub struct UpdateOracle<'info> {
    #[account(mut)]
    pub twap_oracle: Account<'info, TwapOracle>,
    #[account(
        mut,
        has_one = twap_oracle,
        has_one = authority,
        seeds = [b"amm", amm.token_a.as_ref(), amm.token_b.as_ref()],
        bump = amm.bump
    )]
    pub amm: Account<'info, AmmState>,
    pub authority: Signer<'info>
}

#[derive(Accounts)]
pub struct Swap<'info> {
    #[account(mut)]
    pub user: Signer<'info>,
    #[account(
        mut,
        seeds = [b"amm", amm.token_a.as_ref(), amm.token_b.as_ref()],
        bump = amm.bump
    )]
    pub amm: Account<'info, AmmState>,
    #[account(mut)]
    pub twap_oracle: Account<'info, TwapOracle>,
    #[account(mut)]
    pub user_token_a: InterfaceAccount<'info, TokenAccount>,
    #[account(mut)]
    pub user_token_b: InterfaceAccount<'info, TokenAccount>,
    #[account(mut)]
    pub amm_token_a: InterfaceAccount<'info, TokenAccount>,
    #[account(mut)]
    pub amm_token_b: InterfaceAccount<'info, TokenAccount>,
    pub token_a_mint: InterfaceAccount<'info, Mint>,
    pub token_b_mint: InterfaceAccount<'info, Mint>,
    pub token_program: Interface<'info, TokenInterface>,
}

pub fn initialize_pool(
    ctx: Context<InitializePool>,
    fee_bps: u64,
    max_deviation_bps: u64,
    update_interval: i64,
    max_staleness: i64
) -> Result<()> {
    let amm = &mut ctx.accounts.amm;
    let oracle = &mut ctx.accounts.oracle;
    
    amm.bump = ctx.bumps.amm;
    amm.authority = ctx.accounts.payer.key();
    amm.token_a = ctx.accounts.token_a.key();
    amm.token_b = ctx.accounts.token_b.key();
    amm.twap_oracle = oracle.key();
    amm.fee_bps = fee_bps;
    amm.max_price_deviation = max_deviation_bps;
    
    oracle.bump = ctx.bumps.oracle;
    oracle.amm = amm.key();
    oracle.update_interval = update_interval;
    oracle.decimals = 6;
    
    Ok(())
}

pub fn update_oracle(ctx: Context<UpdateOracle>) -> Result<()> {
    let clock = Clock::get()?;
    let amm = &ctx.accounts.amm;
    let twap_oracle = &mut ctx.accounts.twap_oracle;
    
    let current_price = amm.reserve_b.checked_div(amm.reserve_a)
        .ok_or(AmmError::MathOverflow)?;
    
    twap_oracle.update(current_price, &clock)
}

pub fn swap(
    ctx: Context<Swap>,
    amount_in: u64,
    min_amount_out: u64
) -> Result<()> {
    // Extract all needed values before any mutable operations
    let max_deviation = ctx.accounts.amm.max_price_deviation as u128;
    let reserve_a = ctx.accounts.amm.reserve_a;
    let reserve_b = ctx.accounts.amm.reserve_b;
    let twap = {
        let oracle = &ctx.accounts.twap_oracle;
        oracle.calculate_twap()?
    };
    
    // Perform price checks
    const PRECISION: u128 = 1_000_000_000;
    let current_price = (reserve_b as u128)
        .checked_mul(PRECISION)
        .and_then(|v| v.checked_div(reserve_a as u128))
        .ok_or(AmmError::MathOverflow)?;
    let twap = (twap as u128)
        .checked_mul(PRECISION)
        .ok_or(AmmError::MathOverflow)?;
    let deviation_bps = current_price.abs_diff(twap)
        .checked_mul(10_000)
        .and_then(|v| v.checked_div(twap))
        .ok_or(AmmError::MathOverflow)?;
    require!(deviation_bps <= max_deviation, AmmError::PriceManipulation);

    // Now do mutable operations
    // Calculate swap amount before mutable operations
    let amount_out = {
        let amm = &ctx.accounts.amm;
        amm.calculate_swap(amount_in)?
    };
    require!(amount_out >= min_amount_out, AmmError::SlippageExceeded);
    
    // Transfer token A from user to AMM
    let transfer_a = anchor_spl::token_interface::TransferChecked {
        from: ctx.accounts.user_token_a.to_account_info(),
        to: ctx.accounts.amm_token_a.to_account_info(),
        authority: ctx.accounts.user.to_account_info(),
        mint: ctx.accounts.token_a_mint.to_account_info(),
    };
    let cpi_ctx_a = CpiContext::new(
        ctx.accounts.token_program.to_account_info(),
        transfer_a
    );
    anchor_spl::token_interface::transfer_checked(cpi_ctx_a, amount_in, 6)?;
    
    // Prepare signer seeds
    let token_a_mint_key = ctx.accounts.token_a_mint.key();
    let token_b_mint_key = ctx.accounts.token_b_mint.key();
    let bump = ctx.accounts.amm.bump;
    let signer_seeds = &[
        b"amm",
        token_a_mint_key.as_ref(),
        token_b_mint_key.as_ref(),
        &[bump],
    ];
    
    // Transfer token B from AMM to user
    let transfer_b = anchor_spl::token_interface::TransferChecked {
        from: ctx.accounts.amm_token_b.to_account_info(),
        to: ctx.accounts.user_token_b.to_account_info(),
        authority: ctx.accounts.amm.to_account_info(),
        mint: ctx.accounts.token_b_mint.to_account_info(),
    };
    let signer_seeds = [
        b"amm".as_ref(),
        token_a_mint_key.as_ref(),
        token_b_mint_key.as_ref(),
        &[bump],
    ];
    let signer = &[&signer_seeds];
    let cpi_ctx_b = CpiContext::new_with_signer(
        ctx.accounts.token_program.to_account_info(),
        transfer_b,
        signer
    );
    anchor_spl::token_interface::transfer_checked(cpi_ctx_b, amount_out, 6)?;
    
    // Update reserves
    let amm = &mut ctx.accounts.amm;
    amm.reserve_a = amm.reserve_a.checked_add(amount_in)
        .ok_or(AmmError::MathOverflow)?;
    amm.reserve_b = amm.reserve_b.checked_sub(amount_out)
        .ok_or(AmmError::MathOverflow)?;
    
    Ok(())
}
