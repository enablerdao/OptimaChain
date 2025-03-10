//! Sharding module for OptimaChain
//! 
//! This module implements dynamic sharding functionality to improve scalability.

mod shard;
mod allocation;
mod cross_shard;
mod resharding;

pub use shard::{Shard, ShardId, ShardConfig, ShardState};
pub use allocation::{ShardAllocation, ShardAllocator, AllocationStrategy};
pub use cross_shard::{CrossShardTransaction, CrossShardCommunicator};
pub use resharding::{ReshardingManager, ReshardingEvent, ReshardingStrategy};
