use ed25519_dalek::{SigningKey, VerifyingKey, Signature as Ed25519Signature, Signer, Verifier};
use rand::rngs::OsRng;
use sha3::{Sha3_256, Digest};
use hex;
use serde::{Serialize, Deserialize};
use std::fmt;

/// A cryptographic keypair
#[derive(Clone)]
pub struct KeyPair {
    /// Ed25519 signing key
    keypair: SigningKey,
    /// Ed25519 verifying key
    public_key: VerifyingKey,
}

impl KeyPair {
    /// Generate a new random keypair
    pub fn generate() -> Self {
        let mut csprng = OsRng;
        let keypair = SigningKey::generate(&mut csprng);
        let public_key = VerifyingKey::from(&keypair);
        
        KeyPair {
            keypair,
            public_key,
        }
    }
    
    /// Create a keypair from secret key bytes
    pub fn from_secret_key(secret_key_bytes: &[u8]) -> Result<Self, String> {
        if secret_key_bytes.len() != 32 {
            return Err("Invalid secret key length".to_string());
        }
        
        let keypair = SigningKey::from_bytes(secret_key_bytes.try_into().map_err(|_| "Invalid secret key bytes".to_string())?)
            .map_err(|e| format!("Invalid secret key: {}", e))?;
        
        let public_key = VerifyingKey::from(&keypair);
        
        Ok(KeyPair {
            keypair,
            public_key,
        })
    }
    
    /// Get the public key
    pub fn public_key(&self) -> [u8; 32] {
        self.public_key.to_bytes()
    }
    
    /// Get the secret key
    pub fn secret_key(&self) -> [u8; 32] {
        self.keypair.to_bytes()
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
        let ed_signature = match Ed25519Signature::try_from(&signature.bytes[..]) {
            Ok(sig) => sig,
            Err(_) => return false,
        };
        
        self.public_key.verify(message, &ed_signature).is_ok()
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
#[derive(Clone, PartialEq, Eq)]
pub struct Signature {
    /// Signature bytes
    pub bytes: [u8; 64],
}

// Implement custom serialization for Signature
impl Serialize for Signature {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: serde::Serializer,
    {
        // Serialize as a byte array
        serializer.serialize_bytes(&self.bytes)
    }
}

// Implement custom deserialization for Signature
impl<'de> Deserialize<'de> for Signature {
    fn deserialize<D>(deserializer: D) -> Result<Self, D::Error>
    where
        D: serde::Deserializer<'de>,
    {
        struct SignatureVisitor;

        impl<'de> serde::de::Visitor<'de> for SignatureVisitor {
            type Value = Signature;

            fn expecting(&self, formatter: &mut std::fmt::Formatter) -> std::fmt::Result {
                formatter.write_str("a byte array of length 64")
            }

            fn visit_bytes<E>(self, v: &[u8]) -> Result<Self::Value, E>
            where
                E: serde::de::Error,
            {
                if v.len() != 64 {
                    return Err(E::custom(format!("expected 64 bytes, got {}", v.len())));
                }
                
                let mut bytes = [0u8; 64];
                bytes.copy_from_slice(v);
                Ok(Signature { bytes })
            }
        }

        deserializer.deserialize_bytes(SignatureVisitor)
    }
}</old_str>


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
    
    let public_key = match VerifyingKey::from_bytes(public_key.try_into().unwrap_or(&[0; 32])) {
        Ok(pk) => pk,
        Err(_) => return false,
    };
    
    let ed_signature = match Ed25519Signature::try_from(&signature.bytes[..]) {
        Ok(sig) => sig,
        Err(_) => return false,
    };
    
    public_key.verify(message, &ed_signature).is_ok()
}
