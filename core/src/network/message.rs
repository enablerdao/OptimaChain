use crate::types::{Block, BlockId, Transaction, TransactionId};
use serde::{Serialize, Deserialize};
use sha3::{Sha3_256, Digest};

/// Unique identifier for a message
#[derive(Debug, Clone, PartialEq, Eq, Hash, Serialize, Deserialize)]
pub struct MessageId(pub [u8; 32]);

/// Types of messages that can be sent over the network
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum MessageType {
    /// Announce a new block
    BlockAnnounce {
        /// The block being announced
        block: Block,
    },
    /// Request a block by ID
    BlockRequest {
        /// ID of the block being requested
        block_id: BlockId,
    },
    /// Response to a block request
    BlockResponse {
        /// The requested block
        block: Block,
    },
    /// Announce a new transaction
    TransactionAnnounce {
        /// The transaction being announced
        transaction: Transaction,
    },
    /// Request a transaction by ID
    TransactionRequest {
        /// ID of the transaction being requested
        transaction_id: TransactionId,
    },
    /// Response to a transaction request
    TransactionResponse {
        /// The requested transaction
        transaction: Transaction,
    },
    /// Consensus message
    ConsensusMessage {
        /// Round number
        round: u64,
        /// Consensus data
        data: Vec<u8>,
    },
    /// Peer discovery message
    DiscoveryMessage {
        /// Peer addresses
        addresses: Vec<String>,
    },
    /// Status message
    StatusMessage {
        /// Protocol version
        protocol_version: String,
        /// Best block ID
        best_block_id: BlockId,
        /// Best block height
        best_block_height: u64,
        /// Genesis block ID
        genesis_block_id: BlockId,
    },
    /// Ping message
    Ping {
        /// Ping data
        data: u64,
    },
    /// Pong message
    Pong {
        /// Pong data (should match the ping data)
        data: u64,
    },
}

/// A message that can be sent over the network
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Message {
    /// Unique identifier for the message
    pub id: MessageId,
    /// Type of message
    pub message_type: MessageType,
    /// Timestamp when the message was created
    pub timestamp: u64,
    /// TTL (time to live) for the message
    pub ttl: u8,
}

impl Message {
    /// Create a new message
    pub fn new(message_type: MessageType, ttl: u8) -> Self {
        let timestamp = std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)
            .expect("Time went backwards")
            .as_secs();
        
        let mut message = Message {
            id: MessageId([0; 32]), // Placeholder, will be calculated below
            message_type,
            timestamp,
            ttl,
        };
        
        // Calculate message ID
        message.id = message.calculate_id();
        
        message
    }
    
    /// Calculate the ID of this message
    fn calculate_id(&self) -> MessageId {
        // In a real implementation, we would serialize the message and hash it
        // For now, just use a simple hash of the timestamp and message type
        let mut hasher = Sha3_256::new();
        
        // Add timestamp to hash
        hasher.update(self.timestamp.to_be_bytes());
        
        // Add TTL to hash
        hasher.update([self.ttl]);
        
        // Add a type-specific value to the hash
        match &self.message_type {
            MessageType::BlockAnnounce { block } => {
                hasher.update(b"BlockAnnounce");
                hasher.update(block.id().0);
            }
            MessageType::BlockRequest { block_id } => {
                hasher.update(b"BlockRequest");
                hasher.update(block_id.0);
            }
            MessageType::BlockResponse { block } => {
                hasher.update(b"BlockResponse");
                hasher.update(block.id().0);
            }
            MessageType::TransactionAnnounce { transaction } => {
                hasher.update(b"TransactionAnnounce");
                hasher.update(transaction.id().0);
            }
            MessageType::TransactionRequest { transaction_id } => {
                hasher.update(b"TransactionRequest");
                hasher.update(transaction_id.0);
            }
            MessageType::TransactionResponse { transaction } => {
                hasher.update(b"TransactionResponse");
                hasher.update(transaction.id().0);
            }
            MessageType::ConsensusMessage { round, data } => {
                hasher.update(b"ConsensusMessage");
                hasher.update(round.to_be_bytes());
                hasher.update(data);
            }
            MessageType::DiscoveryMessage { addresses } => {
                hasher.update(b"DiscoveryMessage");
                for address in addresses {
                    hasher.update(address.as_bytes());
                }
            }
            MessageType::StatusMessage { protocol_version, best_block_id, best_block_height, genesis_block_id } => {
                hasher.update(b"StatusMessage");
                hasher.update(protocol_version.as_bytes());
                hasher.update(best_block_id.0);
                hasher.update(best_block_height.to_be_bytes());
                hasher.update(genesis_block_id.0);
            }
            MessageType::Ping { data } => {
                hasher.update(b"Ping");
                hasher.update(data.to_be_bytes());
            }
            MessageType::Pong { data } => {
                hasher.update(b"Pong");
                hasher.update(data.to_be_bytes());
            }
        }
        
        let result = hasher.finalize();
        
        let mut id = [0u8; 32];
        id.copy_from_slice(&result);
        MessageId(id)
    }
    
    /// Check if the message has expired
    pub fn is_expired(&self) -> bool {
        if self.ttl == 0 {
            return true;
        }
        
        let now = std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)
            .expect("Time went backwards")
            .as_secs();
        
        // TTL is in seconds
        now > self.timestamp + self.ttl as u64
    }
    
    /// Decrement the TTL of the message
    pub fn decrement_ttl(&mut self) {
        if self.ttl > 0 {
            self.ttl -= 1;
        }
    }
}
