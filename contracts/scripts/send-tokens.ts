import { ethers } from "hardhat";

async function main() {
    const [deployer] = await ethers.getSigners();
    
    // Load deployed addresses
    const deployments = require("../deployments.json");
    const systemTokenAddress = deployments.contracts.SystemToken;
    
    // Connect to SystemToken
    const SystemToken = await ethers.getContractAt("SystemToken", systemTokenAddress);
    
    // Test accounts to fund
    const recipients = [
        "0x70997970C51812dc3A010C7d01b50e0d17dc79C8", // Account #1
        "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC", // Account #2
        "0x90F79bf6EB2c4f870365E785982E1f101E93b906", // Account #3
    ];
    
    const amountPerAccount = ethers.parseEther("1000"); // 1000 tokens each
    
    console.log("💰 Sending tokens to test accounts...\n");
    console.log(`Sender: ${deployer.address}`);
    console.log(`Token: ${systemTokenAddress}`);
    console.log(`Amount per account: ${ethers.formatEther(amountPerAccount)} TKT\n`);
    
    for (const recipient of recipients) {
        try {
            const tx = await SystemToken.transfer(recipient, amountPerAccount);
            await tx.wait();
            console.log(`✅ Sent to ${recipient}`);
            console.log(`   Tx: ${tx.hash}`);
            
            const balance = await SystemToken.balanceOf(recipient);
            console.log(`   Balance: ${ethers.formatEther(balance)} TKT\n`);
        } catch (error: any) {
            console.error(`❌ Failed to send to ${recipient}:`, error.message);
        }
    }
    
    console.log("✅ Done!");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
