use anchor_lang::prelude::*;

#[error_code]
pub enum AmmError {
    #[msg("Price deviation exceeds maximum allowed")]
    PriceDeviationExceeded,
    #[msg("TWAP oracle data is stale")]
    StaleOracleData,
    #[msg("Price manipulation detected")]
    PriceManipulation,
    #[msg("Math operation overflow")]
    MathOverflow,
    #[msg("Insufficient output amount")]
    SlippageExceeded,
    #[msg("Oracle update interval not elapsed")]
    OracleNotReady,
    #[msg("Invalid token pair")]
    InvalidTokenPair,
    #[msg("Unauthorized access")]
    Unauthorized,
    #[msg("Invalid account data")]
    InvalidAccountData,
    #[msg("Amount too small")]
    AmountTooSmall
}
