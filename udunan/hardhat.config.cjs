require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

module.exports = {
  solidity: "0.8.20",
  networks: {
      sepolia: {
      url: "https://arb-sepolia.g.alchemy.com/v2/fIXrkXUidprdr-G3VTuaqZ2jCcWnYDwm",
      accounts:[`5b7026675dad5599c76c20b273c6b8f9df8209dfbeeee661294805cd4b572915`],
      gas: 550000000,
      gasPrice: 80000000000,  // 8 gwei
      timeout: 60000
    },
  },
  solidity: {
    version: "0.8.28",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts"
  },
  mocha: {
    timeout: 40000
  }
};
