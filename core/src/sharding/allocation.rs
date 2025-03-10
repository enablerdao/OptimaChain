use crate::sharding::{Shard, ShardId, ShardConfig};
use crate::types::AccountId;
use serde::{Serialize, Deserialize};
use std::collections::{HashMap, HashSet};

/// Strategy for allocating accounts to shards
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum AllocationStrategy {
    /// Allocate based on account ID hash
    Hash,
    /// Allocate based on account balance
    Balance,
    /// Allocate based on account activity
    Activity,
    /// Allocate based on geographic location
    Geographic,
    /// Allocate based on smart contract dependencies
    ContractDependency,
}

impl Default for AllocationStrategy {
    fn default() -> Self {
        AllocationStrategy::Hash
    }
}

/// Allocation of an account to a shard
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ShardAllocation {
    /// Account ID
    pub account_id: AccountId,
    /// Shard ID
    pub shard_id: ShardId,
    /// When the allocation was made
    pub timestamp: u64,
    /// Allocation strategy used
    pub strategy: AllocationStrategy,
}

/// Allocator for assigning accounts to shards
pub struct ShardAllocator {
    /// Current allocation strategy
    strategy: AllocationStrategy,
    /// Mapping of account IDs to shard IDs
    allocations: HashMap<AccountId, ShardId>,
    /// Mapping of shard IDs to sets of account IDs
    shard_accounts: HashMap<ShardId, HashSet<AccountId>>,
    /// Available shards
    shards: HashMap<ShardId, ShardConfig>,
}

impl ShardAllocator {
    /// Create a new shard allocator
    pub fn new(strategy: AllocationStrategy) -> Self {
        ShardAllocator {
            strategy,
            allocations: HashMap::new(),
            shard_accounts: HashMap::new(),
            shards: HashMap::new(),
        }
    }
    
    /// Add a shard to the allocator
    pub fn add_shard(&mut self, shard_id: ShardId, config: ShardConfig) {
        self.shards.insert(shard_id, config);
        self.shard_accounts.entry(shard_id).or_insert_with(HashSet::new);
    }
    
    /// Remove a shard from the allocator
    pub fn remove_shard(&mut self, shard_id: &ShardId) -> Vec<AccountId> {
        // Get accounts in the shard
        let accounts = self.shard_accounts.remove(shard_id).unwrap_or_default();
        
        // Remove allocations for these accounts
        for account_id in &accounts {
            self.allocations.remove(account_id);
        }
        
        // Remove shard config
        self.shards.remove(shard_id);
        
        accounts.into_iter().collect()
    }
    
    /// Allocate an account to a shard
    pub fn allocate_account(&mut self, account_id: AccountId) -> Result<ShardAllocation, String> {
        // Check if account is already allocated
        if let Some(shard_id) = self.allocations.get(&account_id) {
            return Err(format!("Account already allocated to shard {:?}", shard_id));
        }
        
        // Find the best shard for this account
        let shard_id = self.find_best_shard(&account_id)?;
        
        // Create allocation
        let timestamp = std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)
            .expect("Time went backwards")
            .as_secs();
        
        let allocation = ShardAllocation {
            account_id: account_id.clone(),
            shard_id,
            timestamp,
            strategy: self.strategy,
        };
        
        // Update allocations
        self.allocations.insert(account_id.clone(), shard_id);
        self.shard_accounts.entry(shard_id).or_default().insert(account_id);
        
        Ok(allocation)
    }
    
    /// Reallocate an account to a different shard
    pub fn reallocate_account(&mut self, account_id: &AccountId, new_shard_id: ShardId) -> Result<ShardAllocation, String> {
        // Check if account is allocated
        if let Some(old_shard_id) = self.allocations.get(account_id) {
            // Check if new shard exists
            if !self.shards.contains_key(&new_shard_id) {
                return Err(format!("Shard {:?} does not exist", new_shard_id));
            }
            
            // Remove from old shard
            if let Some(accounts) = self.shard_accounts.get_mut(old_shard_id) {
                accounts.remove(account_id);
            }
            
            // Add to new shard
            self.shard_accounts.entry(new_shard_id).or_default().insert(account_id.clone());
            
            // Update allocation
            self.allocations.insert(account_id.clone(), new_shard_id);
            
            // Create allocation
            let timestamp = std::time::SystemTime::now()
                .duration_since(std::time::UNIX_EPOCH)
                .expect("Time went backwards")
                .as_secs();
            
            let allocation = ShardAllocation {
                account_id: account_id.clone(),
                shard_id: new_shard_id,
                timestamp,
                strategy: self.strategy,
            };
            
            Ok(allocation)
        } else {
            Err(format!("Account {:?} is not allocated to any shard", account_id))
        }
    }
    
    /// Get the shard for an account
    pub fn get_shard(&self, account_id: &AccountId) -> Option<ShardId> {
        self.allocations.get(account_id).copied()
    }
    
    /// Get all accounts in a shard
    pub fn get_shard_accounts(&self, shard_id: &ShardId) -> Option<&HashSet<AccountId>> {
        self.shard_accounts.get(shard_id)
    }
    
    /// Get the number of accounts in a shard
    pub fn shard_account_count(&self, shard_id: &ShardId) -> usize {
        self.shard_accounts.get(shard_id).map_or(0, |accounts| accounts.len())
    }
    
    /// Set the allocation strategy
    pub fn set_strategy(&mut self, strategy: AllocationStrategy) {
        self.strategy = strategy;
    }
    
    /// Find the best shard for an account
    fn find_best_shard(&self, account_id: &AccountId) -> Result<ShardId, String> {
        if self.shards.is_empty() {
            return Err("No shards available".to_string());
        }
        
        match self.strategy {
            AllocationStrategy::Hash => {
                // Simple hash-based allocation
                let hash = self.hash_account_id(account_id);
                let shard_count = self.shards.len() as u32;
                let shard_index = hash % shard_count;
                
                // Find the shard with this index
                let shards: Vec<_> = self.shards.keys().collect();
                if let Some(shard_id) = shards.get(shard_index as usize) {
                    Ok(**shard_id)
                } else {
                    // Fallback to first shard
                    Ok(*shards[0])
                }
            }
            AllocationStrategy::Balance => {
                // Allocate to the shard with the fewest accounts
                let (shard_id, _) = self.shards.keys()
                    .map(|id| (*id, self.shard_account_count(id)))
                    .min_by_key(|(_, count)| *count)
                    .ok_or_else(|| "No shards available".to_string())?;
                
                Ok(shard_id)
            }
            AllocationStrategy::Activity | AllocationStrategy::Geographic | AllocationStrategy::ContractDependency => {
                // These strategies require additional data that we don't have here
                // For now, fall back to hash-based allocation
                self.find_best_shard_hash(account_id)
            }
        }
    }
    
    /// Find the best shard using hash-based allocation
    fn find_best_shard_hash(&self, account_id: &AccountId) -> Result<ShardId, String> {
        let hash = self.hash_account_id(account_id);
        let shard_count = self.shards.len() as u32;
        let shard_index = hash % shard_count;
        
        // Find the shard with this index
        let shards: Vec<_> = self.shards.keys().collect();
        if let Some(shard_id) = shards.get(shard_index as usize) {
            Ok(**shard_id)
        } else {
            // Fallback to first shard
            Ok(*shards[0])
        }
    }
    
    /// Hash an account ID to a u32
    fn hash_account_id(&self, account_id: &AccountId) -> u32 {
        // Simple hash function
        let mut hash: u32 = 0;
        for byte in &account_id.0 {
            hash = hash.wrapping_mul(31).wrapping_add(*byte as u32);
        }
        hash
    }
}
