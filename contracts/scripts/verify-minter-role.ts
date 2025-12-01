import hre from "hardhat";
const { ethers } = hre;

async function main() {
    const [deployer, account1] = await ethers.getSigners();
    
    console.log("🔍 Verifying MINTER_ROLE setup...\n");
    console.log("Deployer address:", deployer.address);
    console.log("Account1 address:", account1.address);
    
    // Load contract
    const ticketNFTAddress = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";
    const TicketNFT = await ethers.getContractAt("TicketNFT", ticketNFTAddress);
    
    // Get MINTER_ROLE hash
    const MINTER_ROLE = await TicketNFT.MINTER_ROLE();
    console.log("\n📋 MINTER_ROLE:", MINTER_ROLE);
    
    // Check who has the role
    const deployerHasRole = await TicketNFT.hasRole(MINTER_ROLE, deployer.address);
    const account1HasRole = await TicketNFT.hasRole(MINTER_ROLE, account1.address);
    
    console.log("\n✅ Deployer has MINTER_ROLE:", deployerHasRole);
    console.log("✅ Account1 has MINTER_ROLE:", account1HasRole);
    
    // Try to mint with deployer
    console.log("\n🧪 Testing mint with deployer...");
    try {
        const tx = await TicketNFT.connect(deployer).mintTicket(
            account1.address,
            596994981, // Event ID
            1,
            "",
            false
        );
        await tx.wait();
        console.log("✅ Mint successful with deployer!");
    } catch (error: any) {
        console.error("❌ Mint failed with deployer:", error.message);
    }
    
    // Try to mint with account1 (should fail unless role is granted)
    console.log("\n🧪 Testing mint with account1 (expecting failure)...");
    try {
        const tx = await TicketNFT.connect(account1).mintTicket(
            account1.address,
            596994981,
            1,
            "",
            false
        );
        await tx.wait();
        console.log("✅ Mint successful with account1!");
    } catch (error: any) {
        console.error("❌ Mint failed with account1 (expected):", error.message.split('\n')[0]);
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
