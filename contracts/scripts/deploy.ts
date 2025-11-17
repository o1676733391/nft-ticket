import { ethers } from "hardhat";

async function main() {
  console.log("🚀 Deploying NFT Ticket System contracts with Account Abstraction support...\n");

  // Get deployer
  const [deployer] = await ethers.getSigners();
  console.log("Deploying with account:", deployer.address);
  console.log("Account balance:", (await deployer.provider.getBalance(deployer.address)).toString());

  // Biconomy Trusted Forwarder addresses (ERC-2771)
  // These are standard Biconomy forwarder addresses for different networks
  const TRUSTED_FORWARDERS: { [key: number]: string } = {
    // Testnets
    11155111: "0x69015912AA33720b842dCD6aC059Ed623F28d9f7", // Sepolia
    84532: "0x69015912AA33720b842dCD6aC059Ed623F28d9f7",    // Base Sepolia  
    80001: "0x69015912AA33720b842dCD6aC059Ed623F28d9f7",    // Polygon Mumbai
    // Mainnets
    1: "0x84a0856b038eaAd1cC7E297cF34A7e72685A8693",        // Ethereum
    8453: "0x84a0856b038eaAd1cC7E297cF34A7e72685A8693",      // Base
    137: "0x84a0856b038eaAd1cC7E297cF34A7e72685A8693",       // Polygon
    // Local/Hardhat - use deployer as forwarder
    1337: deployer.address,
    31337: deployer.address,
  };

  const network = await ethers.provider.getNetwork();
  const chainId = Number(network.chainId);
  const trustedForwarder = TRUSTED_FORWARDERS[chainId] || deployer.address;
  
  console.log(`Network: ${network.name} (Chain ID: ${chainId})`);
  console.log(`Trusted Forwarder: ${trustedForwarder}`);
  console.log(`✅ Gasless transactions ${trustedForwarder !== deployer.address ? 'ENABLED' : 'DISABLED (local network)'}\n`);

  // 1. Deploy SystemToken
  console.log("1️⃣ Deploying SystemToken...");
  const SystemToken = await ethers.getContractFactory("SystemToken");
  const systemToken = await SystemToken.deploy(
    "Ticket Token",
    "TKT",
    trustedForwarder
  );
  await systemToken.waitForDeployment();
  const systemTokenAddress = await systemToken.getAddress();
  console.log("✅ SystemToken deployed to:", systemTokenAddress);

  // 2. Deploy TicketNFT
  console.log("\n2️⃣ Deploying TicketNFT...");
  const TicketNFT = await ethers.getContractFactory("TicketNFT");
  const ticketNFT = await TicketNFT.deploy(trustedForwarder);
  await ticketNFT.waitForDeployment();
  const ticketNFTAddress = await ticketNFT.getAddress();
  console.log("✅ TicketNFT deployed to:", ticketNFTAddress);

  // 3. Deploy Marketplace
  console.log("\n3️⃣ Deploying Marketplace...");
  const Marketplace = await ethers.getContractFactory("Marketplace");
  const marketplace = await Marketplace.deploy(
    ticketNFTAddress,
    systemTokenAddress,
    trustedForwarder
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
  console.log("\n" + "=".repeat(70));
  console.log("📋 DEPLOYMENT SUMMARY");
  console.log("=".repeat(70));
  console.log(`Network:           ${network.name} (Chain ID: ${chainId})`);
  console.log(`Trusted Forwarder: ${trustedForwarder}`);
  console.log(`SystemToken:       ${systemTokenAddress}`);
  console.log(`TicketNFT:         ${ticketNFTAddress}`);
  console.log(`Marketplace:       ${marketplaceAddress}`);
  console.log(`Gasless Txs:       ${trustedForwarder !== deployer.address ? '✅ ENABLED' : '❌ DISABLED'}`);
  console.log("=".repeat(70));

  // 6. Save to file
  const fs = require("fs");
  const deploymentInfo = {
    network: network.name,
    chainId: Number(network.chainId),
    deployer: deployer.address,
    trustedForwarder: trustedForwarder,
    gaslessEnabled: trustedForwarder !== deployer.address,
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
  console.log(`npx hardhat verify --network <network> ${systemTokenAddress} "Ticket Token" "TKT" ${trustedForwarder}`);
  console.log(`npx hardhat verify --network <network> ${ticketNFTAddress} ${trustedForwarder}`);
  console.log(`npx hardhat verify --network <network> ${marketplaceAddress} ${ticketNFTAddress} ${systemTokenAddress} ${trustedForwarder}`);
  
  if (trustedForwarder !== deployer.address) {
    console.log("\n🎉 Account Abstraction is ENABLED!");
    console.log("Users can now make gasless transactions!");
    console.log("Next steps:");
    console.log("1. Setup Biconomy Paymaster: https://dashboard.biconomy.io/");
    console.log("2. Add contract addresses to Paymaster");
    console.log("3. Configure frontend with Biconomy SDK");
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
