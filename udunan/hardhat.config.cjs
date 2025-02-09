require("@nomicfoundation/hardhat-ignition");
require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

module.exports = {
  solidity: {
    version: "0.8.28",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  },
  networks: {
    sepolia: {
      url: "https://arb-sepolia.g.alchemy.com/v2/fIXrkXUidprdr-G3VTuaqZ2jCcWnYDwm",
      accounts: [process.env.PRIVATE_KEY],
      gas: 550000000,
      gasPrice: 80000000000,  // 8 gwei
      timeout: 60000
    },
  },
  etherscan: {
    apiKey: {
      arbitrumSepolia: "M3N4ZZECXVAZYWTQX1D7DDMVAYZF4BM9AF"
    },
    customChains: [
      {
        network: "arbitrumSepolia",
        chainId: 421614,
        urls: {
          apiURL: "https://api-sepolia.arbiscan.io/api",
          browserURL: "https://sepolia.arbiscan.io"
        }
      }
    ]
  }
};