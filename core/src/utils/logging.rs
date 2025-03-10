use log::{Level, LevelFilter, Metadata, Record, SetLoggerError};
use chrono::Local;
use std::io::Write;
use std::sync::Mutex;
use colored::*;

/// Log levels for the logger
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum LogLevel {
    /// Error level
    Error,
    /// Warning level
    Warn,
    /// Info level
    Info,
    /// Debug level
    Debug,
    /// Trace level
    Trace,
}

impl From<LogLevel> for LevelFilter {
    fn from(level: LogLevel) -> Self {
        match level {
            LogLevel::Error => LevelFilter::Error,
            LogLevel::Warn => LevelFilter::Warn,
            LogLevel::Info => LevelFilter::Info,
            LogLevel::Debug => LevelFilter::Debug,
            LogLevel::Trace => LevelFilter::Trace,
        }
    }
}

impl From<LogLevel> for Level {
    fn from(level: LogLevel) -> Self {
        match level {
            LogLevel::Error => Level::Error,
            LogLevel::Warn => Level::Warn,
            LogLevel::Info => Level::Info,
            LogLevel::Debug => Level::Debug,
            LogLevel::Trace => Level::Trace,
        }
    }
}

/// Logger for the blockchain
pub struct Logger {
    /// Log level
    level: LogLevel,
    /// Output file
    output: Option<Mutex<Box<dyn Write + Send>>>,
}

impl Logger {
    /// Create a new logger
    pub fn new(level: LogLevel) -> Self {
        Logger {
            level,
            output: None,
        }
    }
    
    /// Set the output file
    pub fn with_output<W: Write + Send + 'static>(mut self, output: W) -> Self {
        self.output = Some(Mutex::new(Box::new(output)));
        self
    }
}

impl log::Log for Logger {
    fn enabled(&self, metadata: &Metadata) -> bool {
        metadata.level() <= Level::from(self.level)
    }
    
    fn log(&self, record: &Record) {
        if self.enabled(record.metadata()) {
            let now = Local::now();
            let timestamp = now.format("%Y-%m-%d %H:%M:%S%.3f").to_string();
            
            let level_str = match record.level() {
                Level::Error => "ERROR".red().bold(),
                Level::Warn => "WARN ".yellow().bold(),
                Level::Info => "INFO ".green().bold(),
                Level::Debug => "DEBUG".blue().bold(),
                Level::Trace => "TRACE".magenta().bold(),
            };
            
            let target = if !record.target().is_empty() {
                record.target()
            } else {
                record.module_path().unwrap_or("unknown")
            };
            
            let log_line = format!(
                "[{}] {} [{}] {}\n",
                timestamp,
                level_str,
                target,
                record.args()
            );
            
            // Print to stdout
            print!("{}", log_line);
            
            // Write to file if configured
            if let Some(ref output) = self.output {
                if let Ok(mut guard) = output.lock() {
                    let _ = write!(guard, "{}", log_line);
                    let _ = guard.flush();
                }
            }
        }
    }
    
    fn flush(&self) {
        if let Some(ref output) = self.output {
            if let Ok(mut guard) = output.lock() {
                let _ = guard.flush();
            }
        }
    }
}

/// Initialize the logger
pub fn init_logger(level: LogLevel) -> Result<(), SetLoggerError> {
    let logger = Logger::new(level);
    log::set_boxed_logger(Box::new(logger))?;
    log::set_max_level(level.into());
    Ok(())
}
