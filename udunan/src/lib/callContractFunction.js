import { ethers } from "ethers";

// Define the ABI of your CampaignFactory contract
const contractABI = [{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"campaignAddress","type":"address"},{"indexed":true,"internalType":"address","name":"owner","type":"address"}],"name":"CampaignCreated","type":"event"},{"inputs":[{"internalType":"uint256","name":"","type":"uint256"}],"name":"campaigns","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"string","name":"_title","type":"string"},{"internalType":"string","name":"_description","type":"string"},{"internalType":"uint256","name":"_goal","type":"uint256"}],"name":"createCampaign","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"getAllCampaigns","outputs":[{"internalType":"address[]","name":"","type":"address[]"}],"stateMutability":"view","type":"function"}];

// Define the address of your deployed CampaignFactory contract
const contractAddress = "0x9d24Dca37527Fbc79991cA223B8634b754CED911";

// Function to call the getAllCampaigns method
async function callGetAllCampaigns() {
  // Check if ethereum object exists
  if (typeof window.ethereum === "undefined") {
    throw new Error("Please install MetaMask!");
  }

  try {
    // Connect to the Ethereum network using ethers v6 syntax
    const provider = new ethers.BrowserProvider(window.ethereum);

    // Request access to the user's Ethereum account
    await provider.send("eth_requestAccounts", []);

    // Get the signer
    const signer = await provider.getSigner();

    // Create a contract instance
    const contract = new ethers.Contract(contractAddress, contractABI, signer);

    // Call the getAllCampaigns function
    const campaigns = await contract.getAllCampaigns();
    console.log("Successfully retrieved all campaigns:", campaigns);
    return campaigns;
  } catch (error) {
    console.error("Error calling getAllCampaigns:", error);
    throw error;
  }
}

export default callGetAllCampaigns;