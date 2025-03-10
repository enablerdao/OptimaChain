use ed25519_dalek::{Signature, VerifyingKey};
use serde::{Serialize, Deserialize};
use sha3::{Sha3_256, Digest};

/// Unique identifier for a transaction
#[derive(Debug, Clone, PartialEq, Eq, Hash, Serialize, Deserialize)]
pub struct TransactionId(pub [u8; 32]);

/// Types of transactions supported by the blockchain
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum TransactionType {
    /// Transfer tokens between accounts
    Transfer {
        recipient: [u8; 32],
        amount: u64,
    },
    /// Deploy a smart contract
    DeployContract {
        code: Vec<u8>,
        init_args: Vec<u8>,
    },
    /// Call a smart contract
    CallContract {
        contract_id: [u8; 32],
        method: String,
        args: Vec<u8>,
    },
    /// Stake tokens for validation
    Stake {
        amount: u64,
    },
    /// Unstake tokens
    Unstake {
        amount: u64,
    },
}

/// Status of a transaction
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub enum TransactionStatus {
    /// Transaction is pending inclusion in a block
    Pending,
    /// Transaction is included in a block
    Included {
        block_id: [u8; 32],
        index: usize,
    },
    /// Transaction has been confirmed
    Confirmed,
    /// Transaction has failed
    Failed {
        reason: String,
    },
}

/// A transaction in the blockchain
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Transaction {
    /// Type of transaction
    pub transaction_type: TransactionType,
    /// Sender's public key
    pub sender: VerifyingKey,
    /// Nonce to prevent replay attacks
    pub nonce: u64,
    /// Gas limit for execution
    pub gas_limit: u64,
    /// Gas price in smallest token unit
    pub gas_price: u64,
    /// Transaction signature
    pub signature: Signature,
}

impl Transaction {
    /// Create a new transaction
    pub fn new(
        transaction_type: TransactionType,
        sender: VerifyingKey,
        nonce: u64,
        gas_limit: u64,
        gas_price: u64,
    ) -> Self {
        Transaction {
            transaction_type,
            sender,
            nonce,
            gas_limit,
            gas_price,
            signature: Signature::from_bytes(&[0; 64]).unwrap(), // Placeholder, to be signed
        }
    }
    
    /// Get the ID of this transaction
    pub fn id(&self) -> TransactionId {
        let serialized = bincode::serialize(self).unwrap();
        let mut hasher = Sha3_256::new();
        hasher.update(&serialized);
        let result = hasher.finalize();
        
        let mut id = [0u8; 32];
        id.copy_from_slice(&result);
        TransactionId(id)
    }
}
