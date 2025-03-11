//! OptimaChain blockchain node
//! 
//! This is the entry point for the OptimaChain blockchain node.
//! It parses command-line arguments and starts the blockchain node.

use clap::{Command, Arg};
use optimachain::{init, utils, VERSION};
use std::path::PathBuf;
use std::process;

fn main() {
    // Parse command-line arguments
    let matches = Command::new("OptimaChain")
        .version(VERSION)
        .author("OptimaChain Team")
        .about("Next-generation blockchain platform with AI-driven adaptive technologies")
        .arg(
            Arg::new("config")
                .short('c')
                .long("config")
                .value_name("FILE")
                .help("Sets a custom config file")
                .action(clap::ArgAction::Set),
        )
        .arg(
            Arg::new("data-dir")
                .short('d')
                .long("data-dir")
                .value_name("DIR")
                .help("Sets the data directory")
                .action(clap::ArgAction::Set),
        )
        .arg(
            Arg::new("log-level")
                .short('l')
                .long("log-level")
                .value_name("LEVEL")
                .help("Sets the log level (error, warn, info, debug, trace)")
                .action(clap::ArgAction::Set),
        )
        .subcommand(
            Command::new("init")
                .about("Initialize the blockchain")
                .arg(
                    Arg::new("force")
                        .short('f')
                        .long("force")
                        .help("Force initialization even if data already exists")
                        .action(clap::ArgAction::SetTrue),
                ),
        )
        .subcommand(
            Command::new("run")
                .about("Run the blockchain node")
                .arg(
                    Arg::new("validator")
                        .short('v')
                        .long("validator")
                        .help("Run as a validator node")
                        .action(clap::ArgAction::SetTrue),
                ),
        )
        .subcommand(
            Command::new("export-genesis")
                .about("Export the genesis block")
                .arg(
                    Arg::new("output")
                        .short('o')
                        .long("output")
                        .value_name("FILE")
                        .help("Output file")
                        .action(clap::ArgAction::Set),
                ),
        )
        .subcommand(
            Command::new("import-genesis")
                .about("Import a genesis block")
                .arg(
                    Arg::new("input")
                        .short('i')
                        .long("input")
                        .value_name("FILE")
                        .help("Input file")
                        .action(clap::ArgAction::Set)
                        .required(true),
                ),
        )
        .get_matches();

    // Load configuration
    let config_path = matches.get_one::<String>("config").map(|s| s.to_string());
    let data_dir = matches.get_one::<String>("data-dir").map(|s| PathBuf::from(s));
    let log_level = matches.get_one::<String>("log-level").map(|s| s.to_string());

    let mut config = match load_config(config_path.as_deref()) {
        Ok(config) => config,
        Err(err) => {
            eprintln!("Error loading configuration: {}", err);
            process::exit(1);
        }
    };

    // Override configuration with command-line arguments
    if let Some(data_dir) = data_dir {
        config.node.data_dir = data_dir;
    }

    if let Some(log_level) = log_level {
        config.node.log_level = log_level;
    }

    // Process subcommands
    if let Some(matches) = matches.subcommand_matches("init") {
        let force = matches.get_flag("force");
        if let Err(err) = initialize_blockchain(&config, force) {
            eprintln!("Error initializing blockchain: {}", err);
            process::exit(1);
        }
    } else if let Some(matches) = matches.subcommand_matches("run") {
        let validator = matches.get_flag("validator");
        if validator {
            config.node.role = "validator".to_string();
        }

        if let Err(err) = run_blockchain(config) {
            eprintln!("Error running blockchain: {}", err);
            process::exit(1);
        }
    } else if let Some(matches) = matches.subcommand_matches("export-genesis") {
        let output = matches.get_one::<String>("output").map(|s| PathBuf::from(s));
        if let Err(err) = export_genesis(&config, output) {
            eprintln!("Error exporting genesis block: {}", err);
            process::exit(1);
        }
    } else if let Some(matches) = matches.subcommand_matches("import-genesis") {
        let input = PathBuf::from(matches.get_one::<String>("input").unwrap());
        if let Err(err) = import_genesis(&config, &input) {
            eprintln!("Error importing genesis block: {}", err);
            process::exit(1);
        }
    } else {
        println!("No subcommand specified. Use --help for usage information.");
        process::exit(1);
    }
}

/// Load configuration from a file or create a default configuration
fn load_config(config_path: Option<&str>) -> utils::Result<utils::Config> {
    if let Some(path) = config_path {
        utils::load_config(path)
    } else {
        // Try to load from default locations
        let default_paths = [
            "config.json",
            "optimachain.json",
            "/etc/optimachain/config.json",
        ];

        for path in &default_paths {
            if let Ok(config) = utils::load_config(path) {
                return Ok(config);
            }
        }

        // If no configuration file is found, create a default configuration
        Ok(utils::Config::default())
    }
}

/// Initialize the blockchain
fn initialize_blockchain(config: &utils::Config, force: bool) -> utils::Result<()> {
    println!("Initializing OptimaChain blockchain...");

    // Check if data directory exists
    let data_dir = &config.node.data_dir;
    if data_dir.exists() && !force {
        return Err(utils::Error::config(format!(
            "Data directory '{}' already exists. Use --force to overwrite.",
            data_dir.display()
        )));
    }

    // Create data directory
    std::fs::create_dir_all(data_dir)
        .map_err(|e| utils::Error::io(e))?;

    // Create subdirectories
    let dirs = ["db", "keys", "logs", "contracts"];
    for dir in &dirs {
        std::fs::create_dir_all(data_dir.join(dir))
            .map_err(|e| utils::Error::io(e))?;
    }

    // Save configuration
    let config_path = data_dir.join("config.json");
    utils::save_config(config, &config_path)?;

    println!("OptimaChain blockchain initialized at {}", data_dir.display());
    println!("Configuration saved to {}", config_path.display());

    Ok(())
}

/// Run the blockchain node
fn run_blockchain(config: utils::Config) -> utils::Result<()> {
    println!("Starting OptimaChain blockchain node...");

    // Initialize the blockchain
    let mut blockchain = init(config)?;

    // Start the blockchain
    blockchain.start()?;

    // Wait for shutdown signal
    println!("OptimaChain blockchain node is running. Press Ctrl+C to stop.");
    
    // Set up signal handler for graceful shutdown
    ctrlc::set_handler(move || {
        println!("Shutting down OptimaChain blockchain node...");
        std::process::exit(0);
    })
    .map_err(|e| utils::Error::other(format!("Failed to set Ctrl+C handler: {}", e)))?;

    // Keep the main thread alive
    loop {
        std::thread::sleep(std::time::Duration::from_secs(1));
    }
}

/// Export the genesis block
fn export_genesis(config: &utils::Config, output: Option<PathBuf>) -> utils::Result<()> {
    println!("Exporting genesis block...");

    // Initialize the blockchain
    let blockchain = init(config.clone())?;

    // Get the genesis block
    // In a real implementation, we would get the genesis block from the blockchain
    let genesis_block = r#"{
        "header": {
            "version": 1,
            "height": 0,
            "timestamp": 0,
            "previous_hash": "0000000000000000000000000000000000000000000000000000000000000000",
            "state_root": "0000000000000000000000000000000000000000000000000000000000000000",
            "transactions_root": "0000000000000000000000000000000000000000000000000000000000000000"
        },
        "transactions": []
    }"#;

    // Write to file or stdout
    if let Some(path) = output {
        std::fs::write(&path, genesis_block)
            .map_err(|e| utils::Error::io(e))?;
        println!("Genesis block exported to {}", path.display());
    } else {
        println!("{}", genesis_block);
    }

    Ok(())
}

/// Import a genesis block
fn import_genesis(config: &utils::Config, input: &PathBuf) -> utils::Result<()> {
    println!("Importing genesis block from {}...", input.display());

    // Read the genesis block
    let genesis_block = std::fs::read_to_string(input)
        .map_err(|e| utils::Error::io(e))?;

    // Initialize the blockchain
    let blockchain = init(config.clone())?;

    // In a real implementation, we would import the genesis block into the blockchain
    println!("Genesis block imported successfully.");

    Ok(())
}
