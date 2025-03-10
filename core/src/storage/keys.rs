use std::fmt::Debug;

/// Trait for key prefixes in the database
pub trait KeyPrefix: Debug {
    /// Get the column family for this key prefix
    fn column_family() -> String;
    
    /// Encode the key prefix
    fn encode(&self) -> Vec<u8>;
}

/// Trait for storage keys
pub trait StorageKey: Debug {
    /// Get the column family for this key
    fn column_family() -> String;
    
    /// Encode the key
    fn encode(&self) -> Vec<u8>;
}

/// Trait for encoding and decoding keys
pub trait KeyCodec<T>: Sized {
    /// Encode a value to bytes
    fn encode(value: &T) -> Vec<u8>;
    
    /// Decode bytes to a value
    fn decode(bytes: &[u8]) -> Result<T, String>;
}

/// Block key prefix
#[derive(Debug, Clone, Copy)]
pub struct BlockKeyPrefix;

impl KeyPrefix for BlockKeyPrefix {
    fn column_family() -> String {
        "blocks".to_string()
    }
    
    fn encode(&self) -> Vec<u8> {
        vec![0x01]
    }
}

/// Block key
#[derive(Debug, Clone)]
pub struct BlockKey {
    /// Block ID
    pub block_id: [u8; 32],
}

impl StorageKey for BlockKey {
    fn column_family() -> String {
        "blocks".to_string()
    }
    
    fn encode(&self) -> Vec<u8> {
        let mut key = vec![0x01]; // Prefix for blocks
        key.extend_from_slice(&self.block_id);
        key
    }
}

/// Transaction key prefix
#[derive(Debug, Clone, Copy)]
pub struct TransactionKeyPrefix;

impl KeyPrefix for TransactionKeyPrefix {
    fn column_family() -> String {
        "transactions".to_string()
    }
    
    fn encode(&self) -> Vec<u8> {
        vec![0x02]
    }
}

/// Transaction key
#[derive(Debug, Clone)]
pub struct TransactionKey {
    /// Transaction ID
    pub transaction_id: [u8; 32],
}

impl StorageKey for TransactionKey {
    fn column_family() -> String {
        "transactions".to_string()
    }
    
    fn encode(&self) -> Vec<u8> {
        let mut key = vec![0x02]; // Prefix for transactions
        key.extend_from_slice(&self.transaction_id);
        key
    }
}

/// Account key prefix
#[derive(Debug, Clone, Copy)]
pub struct AccountKeyPrefix;

impl KeyPrefix for AccountKeyPrefix {
    fn column_family() -> String {
        "accounts".to_string()
    }
    
    fn encode(&self) -> Vec<u8> {
        vec![0x03]
    }
}

/// Account key
#[derive(Debug, Clone)]
pub struct AccountKey {
    /// Account ID
    pub account_id: [u8; 32],
}

impl StorageKey for AccountKey {
    fn column_family() -> String {
        "accounts".to_string()
    }
    
    fn encode(&self) -> Vec<u8> {
        let mut key = vec![0x03]; // Prefix for accounts
        key.extend_from_slice(&self.account_id);
        key
    }
}

/// State key prefix
#[derive(Debug, Clone, Copy)]
pub struct StateKeyPrefix;

impl KeyPrefix for StateKeyPrefix {
    fn column_family() -> String {
        "state".to_string()
    }
    
    fn encode(&self) -> Vec<u8> {
        vec![0x04]
    }
}

/// State key
#[derive(Debug, Clone)]
pub struct StateKey {
    /// State key
    pub key: Vec<u8>,
}

impl StorageKey for StateKey {
    fn column_family() -> String {
        "state".to_string()
    }
    
    fn encode(&self) -> Vec<u8> {
        let mut key = vec![0x04]; // Prefix for state
        key.extend_from_slice(&self.key);
        key
    }
}

/// Metadata key prefix
#[derive(Debug, Clone, Copy)]
pub struct MetadataKeyPrefix;

impl KeyPrefix for MetadataKeyPrefix {
    fn column_family() -> String {
        "metadata".to_string()
    }
    
    fn encode(&self) -> Vec<u8> {
        vec![0x05]
    }
}

/// Metadata key
#[derive(Debug, Clone)]
pub struct MetadataKey {
    /// Metadata key
    pub key: String,
}

impl StorageKey for MetadataKey {
    fn column_family() -> String {
        "metadata".to_string()
    }
    
    fn encode(&self) -> Vec<u8> {
        let mut key = vec![0x05]; // Prefix for metadata
        key.extend_from_slice(self.key.as_bytes());
        key
    }
}
