const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying contract with address:", deployer.address);

  const EthSender = await hre.ethers.getContractFactory("EthSender");
  const ethSender = await EthSender.deploy(deployer.address);
  await ethSender.deployed();

  console.log("EthSender deployed to:", ethSender.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
