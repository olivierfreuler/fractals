use ethers::prelude::*;
use ethers::providers::{Provider, Http};
use ethers::signers::LocalWallet;
use ethers_middleware::SignerMiddleware;
use ethers::contract::abigen;
use std::convert::TryFrom;
use std::sync::Arc;

// Generiere die Contract-Bindings
abigen!(
    Moonmath,
    "./abi/Moonmath.json",
);

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    // Deine RPC-URL und der private Schlüssel
    let rpc_url = "https://sepolia-rpc.kakarot.org";
    let private_key = "ed8824752e695757b46c5a4a27ece67e406da440feb28c451f419a0718756b17";

    // Verbinde mit dem Provider
    let provider = Provider::<Http>::try_from(rpc_url)?;

    // Initialisiere die Wallet
    let wallet: LocalWallet = private_key.parse()?;
    let wallet = wallet.with_chain_id(1802203764_u64); // Chain-ID für Kakarot

    // Verbinde die Wallet mit dem Provider
    let client = Arc::new(SignerMiddleware::new(provider, wallet));

    // Contract-Adresse
    let contract_address: Address = "0x4c1fF993E16b493aEC456117d1B515567118188e".parse()?;

    // Initialisiere den Contract
    let contract = Moonmath::new(contract_address, client);

    // Beispiel: Berechne das Mandelbrot-Set und sende die Daten an den Smart Contract
    let fractal_value = calculate_mandelbrot(0.5, 0.5, 1000);

    // Beispiel: Aufruf der performInteraction Funktion mit einem fraktalen Wert
    let binding = contract
        .perform_interaction()
        .value(ethers::utils::parse_ether("0.00001").unwrap());
    let tx = binding.send().await?;

    println!("Transaction hash: {:?}", tx);
    println!("Calculated fractal value: {}", fractal_value);
    Ok(())
}

fn calculate_mandelbrot(x: f64, y: f64, max_iterations: u32) -> u32 {
    let mut zx = 0.0;
    let mut zy = 0.0;
    let mut iteration = 0;

    while zx * zx + zy * zy <= 4.0 && iteration < max_iterations {
        let tmp = zx * zx - zy * zy + x;
        zy = 2.0 * zx * zy + y;
        zx = tmp;
        iteration += 1;
    }

    iteration
}

