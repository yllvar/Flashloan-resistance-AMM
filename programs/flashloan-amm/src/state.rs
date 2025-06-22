use anchor_lang::prelude::*;
use crate::errors::AmmError;

#[account]
pub struct AmmState {
    pub bump: u8,
    pub authority: Pubkey,
    pub twap_oracle: Pubkey,
    pub token_a: Pubkey,
    pub token_b: Pubkey,
    pub reserve_a: u64,
    pub reserve_b: u64,
    pub fee_bps: u64,
    pub max_price_deviation: u64  // Percentage (e.g., 10 for 10%)
}

impl AmmState {
    pub const LEN: usize = 8 + 1 + 32 + 32 + 32 + 32 + 8 + 8 + 8 + 8;

    pub fn calculate_swap(&self, amount_in: u64) -> Result<u64> {
        const PRECISION: u128 = 1_000_000_000; // 9 decimal places
        
        // Calculate current price ratio in BPS (basis points)
        let current_price_bps = (self.reserve_b as u128)
            .checked_mul(10_000)
            .and_then(|v| v.checked_div(self.reserve_a as u128))
            .ok_or(AmmError::MathOverflow)?;
            
        // Apply fee with fixed-point precision
        let amount_in_after_fee = (amount_in as u128)
            .checked_mul(10_000 - self.fee_bps as u128)
            .and_then(|v| v.checked_div(10_000))
            .ok_or(AmmError::MathOverflow)?;

        // Verify price deviation is within allowed range
        let new_reserve_a = (self.reserve_a as u128).checked_add(amount_in_after_fee)
            .ok_or(AmmError::MathOverflow)?;
        let new_reserve_b = (self.reserve_b as u128)
            .checked_mul(self.reserve_a as u128)
            .and_then(|v| v.checked_div(new_reserve_a))
            .ok_or(AmmError::MathOverflow)?;
            
        let new_price_bps = new_reserve_b
            .checked_mul(10_000)
            .and_then(|v| v.checked_div(new_reserve_a))
            .ok_or(AmmError::MathOverflow)?;
            
        let price_deviation = new_price_bps.abs_diff(current_price_bps);
        if price_deviation > self.max_price_deviation as u128 {
            return Err(AmmError::PriceManipulation.into());
        }

        // Calculate new reserves with fixed-point
        let reserve_a = self.reserve_a as u128 * PRECISION;
        let reserve_b = self.reserve_b as u128 * PRECISION;
        
        let new_reserve_a = reserve_a.checked_add(amount_in_after_fee)
            .ok_or(AmmError::MathOverflow)?;
        let new_reserve_b = reserve_b
            .checked_mul(reserve_a)
            .and_then(|v| v.checked_div(new_reserve_a))
            .ok_or(AmmError::MathOverflow)?;

        // Convert back to token units
        let amount_out = (reserve_b - new_reserve_b)
            .checked_div(PRECISION)
            .ok_or(AmmError::MathOverflow)?;

        Ok(amount_out as u64)
    }
}

#[account]
pub struct TwapOracle {
    pub bump: u8,
    pub amm: Pubkey,
    pub price_history: [u64; 24],  // Circular buffer of last 24 prices
    pub last_updated: i64,         // Unix timestamp
    pub update_interval: i64,      // Seconds between updates
    pub current_index: usize,      // Pointer to current position in buffer
    pub decimals: u8,              // Price precision
    pub max_staleness: i64         // Maximum allowed staleness in seconds
}

impl TwapOracle {
    pub const LEN: usize = 8 + 1 + 32 + 24*8 + 8 + 8 + 8 + 1;

    /// Updates oracle with new price if update interval has elapsed
    pub fn update(&mut self, new_price: u64, clock: &Clock) -> Result<()> {
        // Reject stale updates using configurable threshold
        if clock.unix_timestamp - self.last_updated > self.max_staleness {
            return Err(AmmError::StaleOracleData.into());
        }
        
        // Update circular buffer
        self.price_history[self.current_index] = new_price;
        self.current_index = (self.current_index + 1) % 24;
        self.last_updated = clock.unix_timestamp;
        Ok(())
    }

    /// Calculates time-weighted average price using arithmetic mean
    pub fn calculate_twap(&self) -> Result<u64> {
        let mut sum: u128 = 0;
        let mut count: u128 = 0;
        
        for price in self.price_history.iter().filter(|&&p| p > 0) {
            sum = sum.checked_add(*price as u128)
                .ok_or(AmmError::MathOverflow)?;
            count += 1;
        }
        
        if count == 0 {
            return Err(AmmError::StaleOracleData.into());
        }
        
        let avg = sum.checked_div(count)
            .ok_or(AmmError::MathOverflow)?;
        
        Ok(avg as u64)
    }
}
