import { ethers } from "hardhat";

async function main() {
  console.log("🔑 Granting MINTER_ROLE to admin wallet...\n");

  const [deployer] = await ethers.getSigners();
  console.log("Deployer address:", deployer.address);

  // Get contract addresses from deployments.json
  const fs = require("fs");
  const deployments = JSON.parse(fs.readFileSync("./deployments.json", "utf-8"));
  const ticketNFTAddress = deployments.contracts.TicketNFT;

  if (!ticketNFTAddress) {
    throw new Error("TicketNFT address not found in deployments.json");
  }

  console.log("TicketNFT address:", ticketNFTAddress);

  // Connect to TicketNFT contract
  const ticketNFT = await ethers.getContractAt("TicketNFT", ticketNFTAddress);

  // Admin wallet address from REST API .env (first Hardhat account)
  const adminWalletAddress = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266";
  console.log("Admin wallet address:", adminWalletAddress);

  // Get MINTER_ROLE
  const MINTER_ROLE = await ticketNFT.MINTER_ROLE();
  console.log("MINTER_ROLE:", MINTER_ROLE);

  // Check if already has role
  const hasRole = await ticketNFT.hasRole(MINTER_ROLE, adminWalletAddress);
  
  if (hasRole) {
    console.log("✅ Admin wallet already has MINTER_ROLE");
  } else {
    console.log("⏳ Granting MINTER_ROLE to admin wallet...");
    const tx = await ticketNFT.grantRole(MINTER_ROLE, adminWalletAddress);
    await tx.wait();
    console.log("✅ MINTER_ROLE granted successfully!");
    console.log("Transaction hash:", tx.hash);
  }

  // Verify
  const hasRoleNow = await ticketNFT.hasRole(MINTER_ROLE, adminWalletAddress);
  console.log("\nFinal verification:");
  console.log(`Admin wallet has MINTER_ROLE: ${hasRoleNow ? "✅ YES" : "❌ NO"}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
