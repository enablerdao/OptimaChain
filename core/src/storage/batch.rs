use std::collections::VecDeque;

/// Operation in a batch
#[derive(Debug, Clone)]
pub enum BatchOperation {
    /// Put operation
    Put {
        /// Column family
        cf: String,
        /// Key
        key: Vec<u8>,
        /// Value
        value: Vec<u8>,
    },
    /// Delete operation
    Delete {
        /// Column family
        cf: String,
        /// Key
        key: Vec<u8>,
    },
}

/// Batch of operations to apply atomically
#[derive(Debug, Clone, Default)]
pub struct Batch {
    /// Operations in the batch
    pub operations: VecDeque<BatchOperation>,
}

impl Batch {
    /// Create a new empty batch
    pub fn new() -> Self {
        Batch {
            operations: VecDeque::new(),
        }
    }
    
    /// Add a put operation to the batch
    pub fn put(&mut self, cf: String, key: Vec<u8>, value: Vec<u8>) -> &mut Self {
        self.operations.push_back(BatchOperation::Put { cf, key, value });
        self
    }
    
    /// Add a delete operation to the batch
    pub fn delete(&mut self, cf: String, key: Vec<u8>) -> &mut Self {
        self.operations.push_back(BatchOperation::Delete { cf, key });
        self
    }
    
    /// Check if the batch is empty
    pub fn is_empty(&self) -> bool {
        self.operations.is_empty()
    }
    
    /// Get the number of operations in the batch
    pub fn len(&self) -> usize {
        self.operations.len()
    }
    
    /// Clear the batch
    pub fn clear(&mut self) {
        self.operations.clear();
    }
    
    /// Merge another batch into this one
    pub fn merge(&mut self, other: Batch) -> &mut Self {
        self.operations.extend(other.operations);
        self
    }
}
