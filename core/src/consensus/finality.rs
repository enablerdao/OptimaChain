use crate::types::{Block, BlockId};
use ed25519_dalek::{Signature, VerifyingKey};
use serde::{Serialize, Deserialize};
use std::collections::{HashMap, HashSet};

/// Proof of finality for a block
#[derive(Debug, Clone, Serialize, Deserialize)]
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
                    let signature = Signature::from_bytes(&[0; 64]).unwrap();
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
