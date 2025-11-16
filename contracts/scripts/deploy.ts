import { ethers } from "hardhat";

async function main() {
  console.log("🚀 Deploying NFT Ticket System contracts...\n");

  // Get deployer
  const [deployer] = await ethers.getSigners();
  console.log("Deploying with account:", deployer.address);
  console.log("Account balance:", (await deployer.provider.getBalance(deployer.address)).toString());

  // 1. Deploy SystemToken
  console.log("\n1️⃣ Deploying SystemToken...");
  const SystemToken = await ethers.getContractFactory("SystemToken");
  const systemToken = await SystemToken.deploy(
    "Ticket Token",
    "TKT",
    1000000 // 1M initial supply
  );
  await systemToken.waitForDeployment();
  const systemTokenAddress = await systemToken.getAddress();
  console.log("✅ SystemToken deployed to:", systemTokenAddress);

  // 2. Deploy TicketNFT
  console.log("\n2️⃣ Deploying TicketNFT...");
  const TicketNFT = await ethers.getContractFactory("TicketNFT");
  const ticketNFT = await TicketNFT.deploy();
  await ticketNFT.waitForDeployment();
  const ticketNFTAddress = await ticketNFT.getAddress();
  console.log("✅ TicketNFT deployed to:", ticketNFTAddress);

  // 3. Deploy Marketplace
  console.log("\n3️⃣ Deploying Marketplace...");
  const Marketplace = await ethers.getContractFactory("Marketplace");
  const marketplace = await Marketplace.deploy(
    ticketNFTAddress,
    systemTokenAddress
  );
  await marketplace.waitForDeployment();
  const marketplaceAddress = await marketplace.getAddress();
  console.log("✅ Marketplace deployed to:", marketplaceAddress);

  // 4. Setup roles
  console.log("\n4️⃣ Setting up roles...");
  const MINTER_ROLE = await ticketNFT.MINTER_ROLE();
  await ticketNFT.grantRole(MINTER_ROLE, deployer.address);
  console.log("✅ Granted MINTER_ROLE to deployer");

  // 5. Summary
  console.log("\n" + "=".repeat(60));
  console.log("📋 DEPLOYMENT SUMMARY");
  console.log("=".repeat(60));
  console.log(`SystemToken:   ${systemTokenAddress}`);
  console.log(`TicketNFT:     ${ticketNFTAddress}`);
  console.log(`Marketplace:   ${marketplaceAddress}`);
  console.log("=".repeat(60));

  // 6. Save to file
  const fs = require("fs");
  const deploymentInfo = {
    network: (await ethers.provider.getNetwork()).name,
    chainId: (await ethers.provider.getNetwork()).chainId,
    deployer: deployer.address,
    timestamp: new Date().toISOString(),
    contracts: {
      SystemToken: systemTokenAddress,
      TicketNFT: ticketNFTAddress,
      Marketplace: marketplaceAddress,
    },
  };

  fs.writeFileSync(
    "./deployments.json",
    JSON.stringify(deploymentInfo, null, 2)
  );
  console.log("\n✅ Deployment info saved to deployments.json");

  // 7. Verification command
  console.log("\n📝 Verify contracts with:");
  console.log(`npx hardhat verify --network <network> ${systemTokenAddress} "Ticket Token" "TKT" 1000000`);
  console.log(`npx hardhat verify --network <network> ${ticketNFTAddress}`);
  console.log(`npx hardhat verify --network <network> ${marketplaceAddress} ${ticketNFTAddress} ${systemTokenAddress}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
