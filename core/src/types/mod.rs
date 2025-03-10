//! Core data structures for the OptimaChain blockchain

mod block;
mod transaction;
mod account;
mod state;

pub use block::{Block, BlockHeader, BlockId};
pub use transaction::{Transaction, TransactionType, TransactionId, TransactionStatus};
pub use account::{Account, AccountId, Balance};
pub use state::{State, StateUpdate, StateRoot};
