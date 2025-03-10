use crate::types::{Transaction, TransactionId, Block, BlockId};
use crate::sharding::ShardId;
use serde::{Serialize, Deserialize};
use std::collections::{HashMap, HashSet, VecDeque};
use std::sync::{Arc, Mutex};

/// A cross-shard transaction
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CrossShardTransaction {
    /// Original transaction ID
    pub transaction_id: TransactionId,
    /// Source shard ID
    pub source_shard: ShardId,
    /// Destination shard ID
    pub destination_shard: ShardId,
    /// Transaction data
    pub data: Vec<u8>,
    /// Status of the cross-shard transaction
    pub status: CrossShardTransactionStatus,
    /// Block ID in the source shard
    pub source_block_id: Option<BlockId>,
    /// Block ID in the destination shard
    pub destination_block_id: Option<BlockId>,
}

/// Status of a cross-shard transaction
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub enum CrossShardTransactionStatus {
    /// Transaction is pending in the source shard
    PendingSource,
    /// Transaction is committed in the source shard
    CommittedSource,
    /// Transaction is pending in the destination shard
    PendingDestination,
    /// Transaction is committed in the destination shard
    CommittedDestination,
    /// Transaction has been finalized in both shards
    Finalized,
    /// Transaction has failed
    Failed {
        /// Reason for failure
        reason: String,
    },
}

/// Communicator for cross-shard transactions
pub struct CrossShardCommunicator {
    /// Pending cross-shard transactions by source shard
    pending_by_source: HashMap<ShardId, VecDeque<CrossShardTransaction>>,
    /// Pending cross-shard transactions by destination shard
    pending_by_destination: HashMap<ShardId, VecDeque<CrossShardTransaction>>,
    /// Completed cross-shard transactions
    completed: HashMap<TransactionId, CrossShardTransaction>,
    /// Transactions waiting for finality
    waiting_for_finality: HashMap<TransactionId, CrossShardTransaction>,
    /// Callback for when a transaction is ready for the destination shard
    ready_for_destination_callback: Option<Box<dyn Fn(CrossShardTransaction) + Send + Sync>>,
    /// Callback for when a transaction is finalized
    finalized_callback: Option<Box<dyn Fn(CrossShardTransaction) + Send + Sync>>,
}

impl CrossShardCommunicator {
    /// Create a new cross-shard communicator
    pub fn new() -> Self {
        CrossShardCommunicator {
            pending_by_source: HashMap::new(),
            pending_by_destination: HashMap::new(),
            completed: HashMap::new(),
            waiting_for_finality: HashMap::new(),
            ready_for_destination_callback: None,
            finalized_callback: None,
        }
    }
    
    /// Submit a cross-shard transaction
    pub fn submit_transaction(
        &mut self,
        transaction_id: TransactionId,
        source_shard: ShardId,
        destination_shard: ShardId,
        data: Vec<u8>,
    ) -> CrossShardTransaction {
        let transaction = CrossShardTransaction {
            transaction_id: transaction_id.clone(),
            source_shard,
            destination_shard,
            data,
            status: CrossShardTransactionStatus::PendingSource,
            source_block_id: None,
            destination_block_id: None,
        };
        
        // Add to pending by source
        self.pending_by_source
            .entry(source_shard)
            .or_insert_with(VecDeque::new)
            .push_back(transaction.clone());
        
        transaction
    }
    
    /// Get pending transactions for a source shard
    pub fn get_pending_for_source(&self, shard_id: &ShardId) -> Vec<CrossShardTransaction> {
        self.pending_by_source
            .get(shard_id)
            .map(|queue| queue.iter().cloned().collect())
            .unwrap_or_default()
    }
    
    /// Get pending transactions for a destination shard
    pub fn get_pending_for_destination(&self, shard_id: &ShardId) -> Vec<CrossShardTransaction> {
        self.pending_by_destination
            .get(shard_id)
            .map(|queue| queue.iter().cloned().collect())
            .unwrap_or_default()
    }
    
    /// Mark a transaction as committed in the source shard
    pub fn commit_in_source(
        &mut self,
        transaction_id: &TransactionId,
        block_id: BlockId,
    ) -> Result<CrossShardTransaction, String> {
        // Find the transaction
        for (shard_id, queue) in &mut self.pending_by_source {
            if let Some(pos) = queue.iter().position(|tx| tx.transaction_id == *transaction_id) {
                let mut transaction = queue.remove(pos).unwrap();
                
                // Update status
                transaction.status = CrossShardTransactionStatus::CommittedSource;
                transaction.source_block_id = Some(block_id);
                
                // Add to pending by destination
                self.pending_by_destination
                    .entry(transaction.destination_shard)
                    .or_insert_with(VecDeque::new)
                    .push_back(transaction.clone());
                
                // Call the callback if set
                if let Some(callback) = &self.ready_for_destination_callback {
                    callback(transaction.clone());
                }
                
                return Ok(transaction);
            }
        }
        
        Err(format!("Transaction {:?} not found", transaction_id))
    }
    
    /// Mark a transaction as committed in the destination shard
    pub fn commit_in_destination(
        &mut self,
        transaction_id: &TransactionId,
        block_id: BlockId,
    ) -> Result<CrossShardTransaction, String> {
        // Find the transaction
        for (shard_id, queue) in &mut self.pending_by_destination {
            if let Some(pos) = queue.iter().position(|tx| tx.transaction_id == *transaction_id) {
                let mut transaction = queue.remove(pos).unwrap();
                
                // Update status
                transaction.status = CrossShardTransactionStatus::CommittedDestination;
                transaction.destination_block_id = Some(block_id);
                
                // Add to waiting for finality
                self.waiting_for_finality.insert(transaction_id.clone(), transaction.clone());
                
                return Ok(transaction);
            }
        }
        
        Err(format!("Transaction {:?} not found", transaction_id))
    }
    
    /// Mark a transaction as finalized
    pub fn finalize_transaction(
        &mut self,
        transaction_id: &TransactionId,
    ) -> Result<CrossShardTransaction, String> {
        if let Some(mut transaction) = self.waiting_for_finality.remove(transaction_id) {
            // Update status
            transaction.status = CrossShardTransactionStatus::Finalized;
            
            // Add to completed
            self.completed.insert(transaction_id.clone(), transaction.clone());
            
            // Call the callback if set
            if let Some(callback) = &self.finalized_callback {
                callback(transaction.clone());
            }
            
            Ok(transaction)
        } else {
            Err(format!("Transaction {:?} not found or not ready for finalization", transaction_id))
        }
    }
    
    /// Mark a transaction as failed
    pub fn fail_transaction(
        &mut self,
        transaction_id: &TransactionId,
        reason: String,
    ) -> Result<CrossShardTransaction, String> {
        // Check pending by source
        for (shard_id, queue) in &mut self.pending_by_source {
            if let Some(pos) = queue.iter().position(|tx| tx.transaction_id == *transaction_id) {
                let mut transaction = queue.remove(pos).unwrap();
                
                // Update status
                transaction.status = CrossShardTransactionStatus::Failed { reason: reason.clone() };
                
                // Add to completed
                self.completed.insert(transaction_id.clone(), transaction.clone());
                
                return Ok(transaction);
            }
        }
        
        // Check pending by destination
        for (shard_id, queue) in &mut self.pending_by_destination {
            if let Some(pos) = queue.iter().position(|tx| tx.transaction_id == *transaction_id) {
                let mut transaction = queue.remove(pos).unwrap();
                
                // Update status
                transaction.status = CrossShardTransactionStatus::Failed { reason: reason.clone() };
                
                // Add to completed
                self.completed.insert(transaction_id.clone(), transaction.clone());
                
                return Ok(transaction);
            }
        }
        
        // Check waiting for finality
        if let Some(mut transaction) = self.waiting_for_finality.remove(transaction_id) {
            // Update status
            transaction.status = CrossShardTransactionStatus::Failed { reason };
            
            // Add to completed
            self.completed.insert(transaction_id.clone(), transaction.clone());
            
            return Ok(transaction);
        }
        
        Err(format!("Transaction {:?} not found", transaction_id))
    }
    
    /// Get a transaction by ID
    pub fn get_transaction(&self, transaction_id: &TransactionId) -> Option<CrossShardTransaction> {
        // Check completed
        if let Some(transaction) = self.completed.get(transaction_id) {
            return Some(transaction.clone());
        }
        
        // Check waiting for finality
        if let Some(transaction) = self.waiting_for_finality.get(transaction_id) {
            return Some(transaction.clone());
        }
        
        // Check pending by source
        for (shard_id, queue) in &self.pending_by_source {
            if let Some(transaction) = queue.iter().find(|tx| tx.transaction_id == *transaction_id) {
                return Some(transaction.clone());
            }
        }
        
        // Check pending by destination
        for (shard_id, queue) in &self.pending_by_destination {
            if let Some(transaction) = queue.iter().find(|tx| tx.transaction_id == *transaction_id) {
                return Some(transaction.clone());
            }
        }
        
        None
    }
    
    /// Set the callback for when a transaction is ready for the destination shard
    pub fn set_ready_for_destination_callback<F>(&mut self, callback: F)
    where
        F: Fn(CrossShardTransaction) + Send + Sync + 'static,
    {
        self.ready_for_destination_callback = Some(Box::new(callback));
    }
    
    /// Set the callback for when a transaction is finalized
    pub fn set_finalized_callback<F>(&mut self, callback: F)
    where
        F: Fn(CrossShardTransaction) + Send + Sync + 'static,
    {
        self.finalized_callback = Some(Box::new(callback));
    }
}
