import hre from "hardhat";
const ethers = hre.ethers;

async function main() {
  const args = process.argv.slice(2);
  const recipientArg = args.find(a => a.startsWith('--to='));
  const tokenArg = args.find(a => a.startsWith('--token='));

  const recipient = recipientArg ? recipientArg.replace('--to=', '') : process.env.RECIPIENT;
  const tokenAddress = tokenArg ? tokenArg.replace('--token=', '') : process.env.TOKEN_ADDRESS;

  if (!recipient) {
    console.error('Recipient address is required. Use --to=0xYourAddress or set RECIPIENT env var');
    process.exit(1);
  }

  const [deployer] = await ethers.getSigners();
  console.log('Using deployer:', deployer.address);

  let tokenContract;

  if (tokenAddress) {
    console.log('Using existing token at', tokenAddress);
    tokenContract = await ethers.getContractAt('SystemToken', tokenAddress);
  } else {
    console.log('No token address provided — deploying new SystemToken locally');
    const trustedForwarder = ethers.constants.AddressZero;
    const SystemToken = await ethers.getContractFactory('SystemToken');
    tokenContract = await SystemToken.deploy('System Token', 'SYS', trustedForwarder);
    await tokenContract.deployed();
    console.log('Deployed SystemToken at', tokenContract.address);
    console.log('Deployer balance (initial mint):', (await tokenContract.balanceOf(deployer.address)).toString());
  }

  // Determine decimals (assume 18 but read from contract)
  let decimals = 18;
  try {
    decimals = await tokenContract.decimals();
    console.log('Token decimals:', decimals.toString());
  } catch (e) {
    console.log('Could not read decimals, defaulting to 18');
  }

  const amount = ethers.utils.parseUnits('1000000', decimals);

  console.log(`Transferring 1,000,000 tokens (${amount.toString()}) to ${recipient}...`);

  const tx = await tokenContract.transfer(recipient, amount);
  console.log('Transfer tx hash:', tx.hash);
  const receipt = await tx.wait();
  console.log('Transfer confirmed in block', receipt.blockNumber);

  const newBalance = await tokenContract.balanceOf(recipient);
  console.log(`Recipient balance: ${ethers.utils.formatUnits(newBalance, decimals)} tokens`);

  console.log('Done');
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});