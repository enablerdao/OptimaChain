use crate::types::{TransactionId, StateRoot};
use crate::utils::crypto::Signature;
use ed25519_dalek::VerifyingKey;
use serde::{Serialize, Deserialize, Serializer, Deserializer};
use serde::de::{Visitor, Error as DeError};
use sha3::{Sha3_256, Digest};
use std::time::{SystemTime, UNIX_EPOCH};

/// Unique identifier for a block
#[derive(Debug, Clone, PartialEq, Eq, Hash, Serialize, Deserialize)]
pub struct BlockId(pub [u8; 32]);

/// Header of a block containing metadata
#[derive(Debug, Clone)]
pub struct BlockHeader {
    /// Version of the block format
    pub version: u32,
    /// Height of the block in the chain
    pub height: u64,
    /// Timestamp when the block was created
    pub timestamp: u64,
    /// Hash of the previous block
    pub prev_block: BlockId,
    /// Merkle root of transactions
    pub transactions_root: [u8; 32],
    /// Root hash of the state after applying this block
    pub state_root: StateRoot,
    /// Public key of the validator that produced this block
    pub validator: VerifyingKey,
    /// Signature of the validator
    pub signature: Signature,
}

// Implement custom serialization for BlockHeader
impl Serialize for BlockHeader {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: Serializer,
    {
        use serde::ser::SerializeStruct;
        let mut state = serializer.serialize_struct("BlockHeader", 8)?;
        state.serialize_field("version", &self.version)?;
        state.serialize_field("height", &self.height)?;
        state.serialize_field("timestamp", &self.timestamp)?;
        state.serialize_field("prev_block", &self.prev_block)?;
        state.serialize_field("transactions_root", &self.transactions_root)?;
        state.serialize_field("state_root", &self.state_root)?;
        state.serialize_field("validator", &self.validator.to_bytes())?;
        state.serialize_field("signature", &self.signature)?;
        state.end()
    }
}

// Implement custom deserialization for BlockHeader
impl<'de> Deserialize<'de> for BlockHeader {
    fn deserialize<D>(deserializer: D) -> Result<Self, D::Error>
    where
        D: Deserializer<'de>,
    {
        #[derive(Deserialize)]
        struct BlockHeaderHelper {
            version: u32,
            height: u64,
            timestamp: u64,
            prev_block: BlockId,
            transactions_root: [u8; 32],
            state_root: StateRoot,
            validator: [u8; 32],
            signature: Signature,
        }

        let helper = BlockHeaderHelper::deserialize(deserializer)?;
        
        let validator = VerifyingKey::from_bytes(&helper.validator)
            .map_err(|e| DeError::custom(format!("Invalid validator key: {}", e)))?;
        
        Ok(BlockHeader {
            version: helper.version,
            height: helper.height,
            timestamp: helper.timestamp,
            prev_block: helper.prev_block,
            transactions_root: helper.transactions_root,
            state_root: helper.state_root,
            validator,
            signature: helper.signature,
        })
    }
}

/// A block in the blockchain
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Block {
    /// Block header
    pub header: BlockHeader,
    /// List of transaction IDs included in this block
    pub transactions: Vec<TransactionId>,
    /// Shard ID this block belongs to (for sharded chains)
    pub shard_id: u32,
    /// Cross-shard transaction references
    pub cross_shard_txs: Vec<(u32, TransactionId)>,
}

impl Block {
    /// Create a new block
    pub fn new(
        height: u64,
        prev_block: BlockId,
        transactions: Vec<TransactionId>,
        state_root: StateRoot,
        validator: VerifyingKey,
        shard_id: u32,
    ) -> Self {
        let timestamp = SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .expect("Time went backwards")
            .as_secs();
        
        let transactions_root = compute_merkle_root(&transactions);
        
        let header = BlockHeader {
            version: 1,
            height,
            timestamp,
            prev_block,
            transactions_root,
            state_root,
            validator,
            signature: Signature::from_bytes([0; 64]), // Placeholder, to be signed
        };
        
        Block {
            header,
            transactions,
            shard_id,
            cross_shard_txs: Vec::new(),
        }
    }
    
    /// Get the ID of this block
    pub fn id(&self) -> BlockId {
        let serialized = bincode::serialize(&self.header).unwrap();
        let mut hasher = Sha3_256::new();
        hasher.update(&serialized);
        let result = hasher.finalize();
        
        let mut id = [0u8; 32];
        id.copy_from_slice(&result);
        BlockId(id)
    }
}

/// Compute the Merkle root of a list of transaction IDs
fn compute_merkle_root(transactions: &[TransactionId]) -> [u8; 32] {
    if transactions.is_empty() {
        return [0; 32];
    }
    
    // Simple implementation for now
    let mut hasher = Sha3_256::new();
    for tx_id in transactions {
        hasher.update(tx_id.0);
    }
    let result = hasher.finalize();
    
    let mut root = [0u8; 32];
    root.copy_from_slice(&result);
    root
}
