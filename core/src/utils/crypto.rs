use ed25519_dalek::{Keypair as Ed25519Keypair, PublicKey, SecretKey, Signature as Ed25519Signature, Signer, Verifier};
use rand::rngs::OsRng;
use sha3::{Sha3_256, Digest};
use hex;
use serde::{Serialize, Deserialize};
use std::fmt;

/// A cryptographic keypair
#[derive(Clone)]
pub struct KeyPair {
    /// Ed25519 keypair
    keypair: Ed25519Keypair,
}

impl KeyPair {
    /// Generate a new random keypair
    pub fn generate() -> Self {
        let mut csprng = OsRng;
        let keypair = Ed25519Keypair::generate(&mut csprng);
        
        KeyPair {
            keypair,
        }
    }
    
    /// Create a keypair from secret key bytes
    pub fn from_secret_key(secret_key_bytes: &[u8]) -> Result<Self, String> {
        if secret_key_bytes.len() != 32 {
            return Err("Invalid secret key length".to_string());
        }
        
        let secret_key = SecretKey::from_bytes(secret_key_bytes)
            .map_err(|e| format!("Invalid secret key: {}", e))?;
        
        let public_key = PublicKey::from(&secret_key);
        
        let keypair = Ed25519Keypair {
            secret: secret_key,
            public: public_key,
        };
        
        Ok(KeyPair {
            keypair,
        })
    }
    
    /// Get the public key
    pub fn public_key(&self) -> [u8; 32] {
        self.keypair.public.to_bytes()
    }
    
    /// Get the secret key
    pub fn secret_key(&self) -> [u8; 32] {
        self.keypair.secret.to_bytes()
    }
    
    /// Sign a message
    pub fn sign(&self, message: &[u8]) -> Signature {
        let signature = self.keypair.sign(message);
        
        Signature {
            bytes: signature.to_bytes(),
        }
    }
    
    /// Verify a signature
    pub fn verify(&self, message: &[u8], signature: &Signature) -> bool {
        let ed_signature = match Ed25519Signature::from_bytes(&signature.bytes) {
            Ok(sig) => sig,
            Err(_) => return false,
        };
        
        self.keypair.public.verify(message, &ed_signature).is_ok()
    }
}

impl fmt::Debug for KeyPair {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        f.debug_struct("KeyPair")
            .field("public_key", &hex::encode(self.public_key()))
            .finish()
    }
}

/// A cryptographic signature
#[derive(Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct Signature {
    /// Signature bytes
    pub bytes: [u8; 64],
}

impl Signature {
    /// Create a signature from bytes
    pub fn from_bytes(bytes: [u8; 64]) -> Self {
        Signature {
            bytes,
        }
    }
    
    /// Get the signature bytes
    pub fn as_bytes(&self) -> &[u8; 64] {
        &self.bytes
    }
}

impl fmt::Debug for Signature {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        f.debug_struct("Signature")
            .field("bytes", &hex::encode(self.bytes))
            .finish()
    }
}

/// Hash a message using SHA3-256
pub fn hash(data: &[u8]) -> [u8; 32] {
    let mut hasher = Sha3_256::new();
    hasher.update(data);
    let result = hasher.finalize();
    
    let mut hash = [0u8; 32];
    hash.copy_from_slice(&result);
    hash
}

/// Generate a new keypair
pub fn generate_keypair() -> KeyPair {
    KeyPair::generate()
}

/// Sign a message with a keypair
pub fn sign_message(keypair: &KeyPair, message: &[u8]) -> Signature {
    keypair.sign(message)
}

/// Verify a signature
pub fn verify_signature(public_key: &[u8], message: &[u8], signature: &Signature) -> bool {
    if public_key.len() != 32 {
        return false;
    }
    
    let public_key = match PublicKey::from_bytes(public_key) {
        Ok(pk) => pk,
        Err(_) => return false,
    };
    
    let ed_signature = match Ed25519Signature::from_bytes(&signature.bytes) {
        Ok(sig) => sig,
        Err(_) => return false,
    };
    
    public_key.verify(message, &ed_signature).is_ok()
}
