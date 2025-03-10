//! Consensus module for OptimaChain
//! 
//! This module implements the Adaptive Proof-of-Stake (aPoS) consensus mechanism.

mod apos;
mod validator;
mod block_production;
mod finality;

pub use apos::{APoS, APoSConfig};
pub use validator::{Validator, ValidatorSet, ValidatorInfo, StakeInfo};
pub use block_production::{BlockProducer, BlockProductionSchedule};
pub use finality::{FinalityProvider, FinalityProof};
