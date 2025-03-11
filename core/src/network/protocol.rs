use crate::network::{Message, MessageId, MessageType};
use crate::types::{Block, Transaction};
use libp2p::{
    request_response::{
        ProtocolSupport, RequestResponse, RequestResponseConfig, RequestResponseEvent,
        RequestResponseMessage,
    },
    PeerId,
};
use serde::{Serialize, Deserialize};
use std::collections::{HashMap, HashSet, VecDeque};
use std::time::{Duration, Instant};

/// Name of the protocol
#[derive(Debug, Clone)]
pub struct ProtocolNameImpl(String);

// Commented out since ProtocolName trait is not available
// impl ProtocolName for ProtocolNameImpl {
//     fn protocol_name(&self) -> &[u8] {
//         self.0.as_bytes()
//     }
// }

/// Configuration for the protocol
#[derive(Debug, Clone)]
pub struct ProtocolConfig {
    /// Protocol name
    pub protocol_name: String,
    /// Protocol version
    pub protocol_version: String,
    /// Request timeout in seconds
    pub request_timeout: u64,
    /// Maximum message size in bytes
    pub max_message_size: usize,
    /// Maximum number of concurrent requests
    pub max_concurrent_requests: usize,
}

impl Default for ProtocolConfig {
    fn default() -> Self {
        ProtocolConfig {
            protocol_name: "/optimachain/1.0.0".to_string(),
            protocol_version: "1.0.0".to_string(),
            request_timeout: 30,
            max_message_size: 10 * 1024 * 1024, // 10 MB
            max_concurrent_requests: 100,
        }
    }
}

/// Events emitted by the protocol
#[derive(Debug)]
pub enum ProtocolEvent {
    /// Received a message
    MessageReceived {
        /// Peer that sent the message
        peer_id: PeerId,
        /// Message that was received
        message: Message,
    },
    /// Message was sent successfully
    MessageSent {
        /// Peer that the message was sent to
        peer_id: PeerId,
        /// ID of the message that was sent
        message_id: MessageId,
    },
    /// Failed to send a message
    MessageSendFailed {
        /// Peer that the message was being sent to
        peer_id: PeerId,
        /// ID of the message that failed to send
        message_id: MessageId,
        /// Error that occurred
        error: String,
    },
    /// Received a block
    BlockReceived {
        /// Peer that sent the block
        peer_id: PeerId,
        /// Block that was received
        block: Block,
    },
    /// Received a transaction
    TransactionReceived {
        /// Peer that sent the transaction
        peer_id: PeerId,
        /// Transaction that was received
        transaction: Transaction,
    },
}

/// Protocol implementation
pub struct Protocol {
    /// Configuration
    config: ProtocolConfig,
    /// Pending outbound messages
    pending_messages: VecDeque<(PeerId, Message)>,
    /// Recently seen message IDs to avoid duplicates
    seen_messages: HashSet<MessageId>,
    /// Active requests
    active_requests: HashMap<MessageId, Instant>,
    /// Request-response protocol
    request_response: Option<RequestResponse<ProtocolCodec>>,
    /// Whether the protocol is running
    running: bool,
}

/// Protocol codec for serializing and deserializing messages
#[derive(Clone)]
pub struct ProtocolCodec {
    /// Maximum message size
    max_size: usize,
}

impl Protocol {
    /// Create a new protocol
    pub fn new(config: ProtocolConfig) -> Self {
        Protocol {
            config,
            pending_messages: VecDeque::new(),
            seen_messages: HashSet::new(),
            active_requests: HashMap::new(),
            request_response: None,
            running: false,
        }
    }
    
    /// Start the protocol
    pub fn start(&mut self) -> Result<(), String> {
        if self.running {
            return Ok(());
        }
        
        // Initialize if not already initialized
        if self.request_response.is_none() {
            self.initialize();
        }
        
        self.running = true;
        log::info!("Protocol started");
        Ok(())
    }
    
    /// Stop the protocol
    pub fn stop(&mut self) -> Result<(), String> {
        if !self.running {
            return Ok(());
        }
        
        self.running = false;
        log::info!("Protocol stopped");
        Ok(())
    }
    
    /// Initialize the protocol
    pub fn initialize(&mut self) {
        // Commented out due to missing ProtocolName trait
        // let protocol_name = ProtocolNameImpl(self.config.protocol_name.clone());
        
        let codec = ProtocolCodec {
            max_size: self.config.max_message_size,
        };
        
        let request_response_config = RequestResponseConfig::default()
            .with_request_timeout(Duration::from_secs(self.config.request_timeout));
            // .with_max_concurrent_requests(self.config.max_concurrent_requests);
        
        // Commented out due to API changes in libp2p
        // let request_response = RequestResponse::new(
        //     codec,
        //     vec![(protocol_name, ProtocolSupport::Full)],
        //     request_response_config,
        // );
        
        // self.request_response = Some(request_response);
    }
    
    /// Send a message to a peer
    pub fn send_message(&mut self, peer_id: PeerId, message: Message) {
        // Add message to pending queue
        self.pending_messages.push_back((peer_id, message));
    }
    
    /// Broadcast a message to multiple peers
    pub fn broadcast_message(&mut self, peers: &[PeerId], message: Message) {
        for peer_id in peers {
            self.send_message(*peer_id, message.clone());
        }
    }
    
    /// Process pending messages
    pub fn process_pending_messages(&mut self) -> Vec<ProtocolEvent> {
        let mut events = Vec::new();
        
        // Process up to 10 messages at a time
        for _ in 0..10 {
            if let Some((peer_id, message)) = self.pending_messages.pop_front() {
                // Check if we've already seen this message
                if self.seen_messages.contains(&message.id) {
                    continue;
                }
                
                // Add message to seen messages
                self.seen_messages.insert(message.id.clone());
                
                // Send message
                if let Some(request_response) = &mut self.request_response {
                    // In a real implementation, we would serialize the message and send it
                    // For now, just log the message
                    log::info!("Sending message to {}: {:?}", peer_id, message);
                    
                    // Add to active requests
                    self.active_requests.insert(message.id.clone(), Instant::now());
                    
                    // Add event
                    events.push(ProtocolEvent::MessageSent {
                        peer_id,
                        message_id: message.id,
                    });
                } else {
                    // Protocol not initialized
                    events.push(ProtocolEvent::MessageSendFailed {
                        peer_id,
                        message_id: message.id,
                        error: "Protocol not initialized".to_string(),
                    });
                }
            } else {
                break;
            }
        }
        
        events
    }
    
    /// Handle a request-response event
    pub fn handle_request_response_event(
        &mut self,
        event: RequestResponseEvent<Message, Message>,
    ) -> Vec<ProtocolEvent> {
        let mut events = Vec::new();
        
        match event {
            RequestResponseEvent::Message { peer, message } => {
                match message {
                    RequestResponseMessage::Request { request, .. } => {
                        // Handle request
                        events.push(ProtocolEvent::MessageReceived {
                            peer_id: peer,
                            message: request,
                        });
                    }
                    RequestResponseMessage::Response { response, .. } => {
                        // Handle response
                        events.push(ProtocolEvent::MessageReceived {
                            peer_id: peer,
                            message: response,
                        });
                    }
                }
            }
            RequestResponseEvent::OutboundFailure { peer, error, .. } => {
                // Handle outbound failure
                log::error!("Outbound failure to {}: {:?}", peer, error);
            }
            RequestResponseEvent::InboundFailure { peer, error, .. } => {
                // Handle inbound failure
                log::error!("Inbound failure from {}: {:?}", peer, error);
            }
            _ => {}
        }
        
        events
    }
    
    /// Process protocol events
    pub fn process_events(&mut self, events: Vec<ProtocolEvent>) -> Vec<ProtocolEvent> {
        let mut new_events = Vec::new();
        
        for event in events {
            match event {
                ProtocolEvent::MessageReceived { peer_id, message } => {
                    // Process received message
                    match message.message_type {
                        MessageType::BlockAnnounce { block } => {
                            new_events.push(ProtocolEvent::BlockReceived {
                                peer_id,
                                block,
                            });
                        }
                        MessageType::TransactionAnnounce { transaction } => {
                            new_events.push(ProtocolEvent::TransactionReceived {
                                peer_id,
                                transaction,
                            });
                        }
                        _ => {
                            // Other message types
                        }
                    }
                }
                _ => {
                    // Pass through other events
                    new_events.push(event);
                }
            }
        }
        
        new_events
    }
    
    /// Prune old seen messages and active requests
    pub fn prune(&mut self) {
        // Prune seen messages (keep only the last 10000)
        if self.seen_messages.len() > 10000 {
            let to_remove = self.seen_messages.len() - 10000;
            let to_remove: Vec<_> = self.seen_messages.iter().take(to_remove).cloned().collect();
            for message_id in to_remove {
                self.seen_messages.remove(&message_id);
            }
        }
        
        // Prune active requests (remove those older than the timeout)
        let timeout = Duration::from_secs(self.config.request_timeout);
        self.active_requests.retain(|_, time| time.elapsed() < timeout);
    }
}
