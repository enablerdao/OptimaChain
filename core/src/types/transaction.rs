use ed25519_dalek::VerifyingKey;
use crate::utils::crypto::Signature;
use serde::{Serialize, Deserialize, Deserializer};
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
#[derive(Debug, Clone)]
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

// Implement custom serialization for Transaction
impl Serialize for Transaction {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: serde::Serializer,
    {
        use serde::ser::SerializeStruct;
        let mut state = serializer.serialize_struct("Transaction", 6)?;
        state.serialize_field("transaction_type", &self.transaction_type)?;
        state.serialize_field("sender", &self.sender.to_bytes())?;
        state.serialize_field("nonce", &self.nonce)?;
        state.serialize_field("gas_limit", &self.gas_limit)?;
        state.serialize_field("gas_price", &self.gas_price)?;
        state.serialize_field("signature", &hex::encode(&self.signature.bytes))?;
        state.end()
    }
}

// Implement custom deserialization for Transaction
impl<'de> Deserialize<'de> for Transaction {
    fn deserialize<D>(deserializer: D) -> Result<Self, D::Error>
    where
        D: Deserializer<'de>,
    {
        struct TransactionHelper {
            transaction_type: TransactionType,
            sender: [u8; 32],
            nonce: u64,
            gas_limit: u64,
            gas_price: u64,
            signature: Vec<u8>,
        }
        
        impl<'de> Deserialize<'de> for TransactionHelper {
            fn deserialize<D>(deserializer: D) -> Result<Self, D::Error>
            where
                D: Deserializer<'de>,
            {
                #[derive(Deserialize)]
                struct Helper {
                    transaction_type: TransactionType,
                    sender: [u8; 32],
                    nonce: u64,
                    gas_limit: u64,
                    gas_price: u64,
                    signature: Vec<u8>,
                }
                
                let helper = Helper::deserialize(deserializer)?;
                
                if helper.signature.len() != 64 {
                    return Err(serde::de::Error::custom(format!(
                        "Expected signature of length 64, got {}",
                        helper.signature.len()
                    )));
                }
                
                Ok(TransactionHelper {
                    transaction_type: helper.transaction_type,
                    sender: helper.sender,
                    nonce: helper.nonce,
                    gas_limit: helper.gas_limit,
                    gas_price: helper.gas_price,
                    signature: helper.signature,
                })
            }
        }

        let helper = TransactionHelper::deserialize(deserializer)?;
        
        let sender = VerifyingKey::from_bytes(&helper.sender)
            .map_err(|e| serde::de::Error::custom(format!("Invalid sender key: {}", e)))?;
        
        let mut signature_bytes = [0u8; 64];
        signature_bytes.copy_from_slice(&helper.signature);
        let signature = Signature { bytes: signature_bytes };
        
        Ok(Transaction {
            transaction_type: helper.transaction_type,
            sender,
            nonce: helper.nonce,
            gas_limit: helper.gas_limit,
            gas_price: helper.gas_price,
            signature,
        })
    }
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
            signature: Signature { bytes: [0; 64] }, // Placeholder, to be signed
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
