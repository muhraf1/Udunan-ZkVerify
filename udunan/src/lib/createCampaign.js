import { ethers } from "ethers";

// Connect to Ethereum network using browser provider
async function getProvider() {
  if (!window.ethereum) {
    throw new Error("Please install a wallet extension (e.g., MetaMask)");
  }
  return new ethers.BrowserProvider(window.ethereum);
}

// Address of the deployed CampaignFactory contract
const campaignFactoryAddress = "0x9d24Dca37527Fbc79991cA223B8634b754CED911";

// ABI of the CampaignFactory contract
const campaignFactoryABI = [
  // Add the ABI of the CampaignFactory contract here
  {"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"campaignAddress","type":"address"},{"indexed":true,"internalType":"address","name":"owner","type":"address"}],"name":"CampaignCreated","type":"event"},{"inputs":[{"internalType":"uint256","name":"","type":"uint256"}],"name":"campaigns","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"string","name":"_title","type":"string"},{"internalType":"string","name":"_description","type":"string"},{"internalType":"uint256","name":"_goal","type":"uint256"}],"name":"createCampaign","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"getAllCampaigns","outputs":[{"internalType":"address[]","name":"","type":"address[]"}],"stateMutability":"view","type":"function"}
];

// Function to create a new campaign
export async function createCampaign(title, description, goal) {
  try {
    const provider = await getProvider();
    const signer = await provider.getSigner();
    const campaignFactory = new ethers.Contract(campaignFactoryAddress, campaignFactoryABI, signer);

    const tx = await campaignFactory.createCampaign(title, description, ethers.parseEther(goal.toString()));
    const receipt = await tx.wait();
    
    // Get the CampaignCreated event from the receipt
    const event = receipt.logs[0];
    const campaignAddress = event.args[0];
    
    console.log("Campaign created successfully!");
    console.log("Campaign Address:", campaignAddress);
    
    return campaignAddress; // Return the campaign address
  } catch (error) {
    console.error("Error creating campaign:", error);
    throw error; // Throw the error to be handled by the caller
  }
}

// Example usage
// createCampaign("Save Palaside", "California ", "400");