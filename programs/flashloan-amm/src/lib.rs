use anchor_lang::prelude::*;
pub use anchor_lang::solana_program;
pub use anchor_lang::solana_program::pubkey::Pubkey;
pub mod errors;
pub mod instructions;
pub mod state;

use instructions::*;

declare_id!("Hexfz6ziQfSp6gzGRyNf2RAc7akNykz8ggeLqXrKj82s");

#[program]
pub mod flashloan_amm {
    use super::*;

    pub fn initialize_pool(
        ctx: Context<InitializePool>,
        fee_bps: u64,
        max_deviation_bps: u64,
        update_interval: i64,
        max_staleness: i64
    ) -> Result<()> {
        instructions::initialize_pool(ctx, fee_bps, max_deviation_bps, update_interval, max_staleness)
    }

    pub fn update_oracle(ctx: Context<UpdateOracle>) -> Result<()> {
        instructions::update_oracle(ctx)
    }

    pub fn swap(
        ctx: Context<Swap>,
        amount_in: u64,
        min_amount_out: u64
    ) -> Result<()> {
        instructions::swap(ctx, amount_in, min_amount_out)
    }
}
