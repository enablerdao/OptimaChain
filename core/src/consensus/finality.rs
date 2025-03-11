use crate::types::{Block, BlockId};
use ed25519_dalek::VerifyingKey;
use crate::utils::crypto::Signature;
use serde::{Serialize, Deserialize, Deserializer};
use std::collections::{HashMap, HashSet};

/// Proof of finality for a block
#[derive(Debug, Clone)]
pub struct FinalityProof {
    /// Block ID that is finalized
    pub block_id: BlockId,
    /// Height of the finalized block
    pub height: u64,
    /// Signatures from validators confirming finality
    pub signatures: Vec<(VerifyingKey, Signature)>,
    /// Timestamp when finality was achieved
   pub timestamp: u64,
}
// Implement custom serialization for FinalityProof
impl Serialize for FinalityProof {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: serde::Serializer,
    {
        use serde::ser::SerializeStruct;
        let mut state = serializer.serialize_struct("FinalityProof", 4)?;
        state.serialize_field("block_id", &self.block_id)?;
        state.serialize_field("height", &self.height)?;
        
        // Serialize signatures as arrays of bytes
        let signatures: Vec<(Vec<u8>, Vec<u8>)> = self.signatures
            .iter()
            .map(|(key, sig)| (key.to_bytes().to_vec(), sig.bytes.to_vec()))
            .collect();
        state.serialize_field("signatures", &signatures)?;
        
        state.serialize_field("timestamp", &self.timestamp)?;
        state.end()
    }
}

// Implement custom deserialization for FinalityProof
impl<'de> Deserialize<'de> for FinalityProof {
    fn deserialize<D>(deserializer: D) -> Result<Self, D::Error>
    where
        D: Deserializer<'de>,
    {
        #[derive(Deserialize)]
        struct FinalityProofHelper {
            block_id: BlockId,
            height: u64,
            signatures: Vec<(Vec<u8>, Vec<u8>)>,
            timestamp: u64,
        }

        let helper = FinalityProofHelper::deserialize(deserializer)?;
        
        // Convert signatures from bytes back to VerifyingKey and Signature
        let mut signatures = Vec::new();
        for (key_bytes, sig_bytes) in helper.signatures {
            if key_bytes.len() != 32 || sig_bytes.len() != 64 {
                return Err(serde::de::Error::custom("Invalid key or signature length"));
            }
            
            let mut key_array = [0u8; 32];
            key_array.copy_from_slice(&key_bytes);
            
            let mut sig_array = [0u8; 64];
            sig_array.copy_from_slice(&sig_bytes);
            
            let key = VerifyingKey::from_bytes(&key_array)
                .map_err(|e| serde::de::Error::custom(format!("Invalid key: {}", e)))?;
            
            let signature = Signature { bytes: sig_array };
            
            signatures.push((key, signature));
        }
        
        Ok(FinalityProof {
            block_id: helper.block_id,
            height: helper.height,
            signatures,
            timestamp: helper.timestamp,
        })
    }
}

impl FinalityProof {
    /// Create a new finality proof
    pub fn new(block_id: BlockId, height: u64) -> Self {
        let timestamp = std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)
            .expect("Time went backwards")
            .as_secs();
        
        FinalityProof {
            block_id,
            height,
            signatures: Vec::new(),
            timestamp,
        }
    }
    
    /// Add a validator signature to the finality proof
    pub fn add_signature(&mut self, validator: VerifyingKey, signature: Signature) {
        // Check if this validator has already signed
        if !self.signatures.iter().any(|(v, _)| *v == validator) {
            self.signatures.push((validator, signature));
        }
    }
    
    /// Get the number of signatures
    pub fn signature_count(&self) -> usize {
        self.signatures.len()
    }
    
    /// Check if a validator has signed
    pub fn has_signature_from(&self, validator: &VerifyingKey) -> bool {
        self.signatures.iter().any(|(v, _)| v == validator)
    }
}

/// Provider of finality for the blockchain
pub struct FinalityProvider {
    /// Finalized blocks
    finalized_blocks: HashMap<BlockId, FinalityProof>,
    /// Latest finalized height
    latest_finalized_height: u64,
    /// Blocks waiting for finality
    pending_blocks: HashMap<BlockId, (Block, HashSet<VerifyingKey>)>,
    /// Threshold for finality (percentage of validators required)
    finality_threshold: f64,
}

impl FinalityProvider {
    /// Create a new finality provider
    pub fn new() -> Self {
        FinalityProvider {
            finalized_blocks: HashMap::new(),
            latest_finalized_height: 0,
            pending_blocks: HashMap::new(),
            finality_threshold: 0.67, // 2/3 of validators required for finality
        }
    }
    
    /// Set the finality threshold
    pub fn set_finality_threshold(&mut self, threshold: f64) {
        self.finality_threshold = threshold.max(0.5).min(1.0); // Ensure threshold is between 0.5 and 1.0
    }
    
    /// Process a new block
    pub fn process_block(&mut self, block: Block, total_validators: usize) {
        let block_id = block.id();
        
        // If block is already finalized, ignore
        if self.finalized_blocks.contains_key(&block_id) {
            return;
        }
        
        // Add block to pending blocks
        let mut signatures = HashSet::new();
        signatures.insert(block.header.validator);
        self.pending_blocks.insert(block_id.clone(), (block.clone(), signatures));
        
        // Check if block can be finalized immediately
        self.check_finality(&block_id, total_validators);
    }
    
    /// Add a vote for a block
    pub fn add_vote(&mut self, block_id: &BlockId, validator: VerifyingKey, total_validators: usize) {
        if let Some((_, signatures)) = self.pending_blocks.get_mut(block_id) {
            signatures.insert(validator);
            
            // Check if block can be finalized
            self.check_finality(block_id, total_validators);
        }
    }
    
    /// Check if a block can be finalized
    fn check_finality(&mut self, block_id: &BlockId, total_validators: usize) {
        if let Some((block, signatures)) = self.pending_blocks.get(block_id) {
            let signature_count = signatures.len();
            let threshold = (total_validators as f64 * self.finality_threshold).ceil() as usize;
            
            if signature_count >= threshold {
                // Block has reached finality
                let mut proof = FinalityProof::new(block_id.clone(), block.header.height);
                
                // Add signatures to proof (in a real implementation, we would have actual signatures)
                for validator in signatures {
                    // Create a dummy signature for now
                    let signature = Signature::from_bytes(&[0; 64]);
                    proof.add_signature(*validator, signature);
                }
                
                // Add to finalized blocks
                self.finalized_blocks.insert(block_id.clone(), proof);
                
                // Update latest finalized height if this block is higher
                if block.header.height > self.latest_finalized_height {
                    self.latest_finalized_height = block.header.height;
                }
                
                // Remove from pending blocks
                self.pending_blocks.remove(block_id);
                
                // Prune older pending blocks
                self.prune_pending_blocks();
            }
        }
    }
    
    /// Prune pending blocks that are older than the latest finalized height
    fn prune_pending_blocks(&mut self) {
        let latest_height = self.latest_finalized_height;
        self.pending_blocks.retain(|_, (block, _)| block.header.height > latest_height);
    }
    
    /// Check if a block is finalized
    pub fn is_finalized(&self, block_id: &BlockId) -> bool {
        self.finalized_blocks.contains_key(block_id)
    }
    
    /// Get the finality proof for a block
    pub fn get_finality_proof(&self, block_id: &BlockId) -> Option<&FinalityProof> {
        self.finalized_blocks.get(block_id)
    }
    
    /// Get the latest finalized height
    pub fn latest_finalized_height(&self) -> u64 {
        self.latest_finalized_height
    }
    
    /// Get all finalized blocks
    pub fn finalized_blocks(&self) -> &HashMap<BlockId, FinalityProof> {
        &self.finalized_blocks
    }
}
