import { ethers } from "ethers";

// Connect to Ethereum network using browser provider
async function getProvider() {
  if (!window.ethereum) {
    throw new Error("Please install a wallet extension (e.g., MetaMask)");
  }
  return new ethers.BrowserProvider(window.ethereum);
}

// ABI of the Campaign contract
const campaignABI = [
  {"inputs":[{"internalType":"address","name":"_owner","type":"address"},{"internalType":"string","name":"_title","type":"string"},{"internalType":"string","name":"_description","type":"string"},{"internalType":"uint256","name":"_goal","type":"uint256"}],"stateMutability":"nonpayable","type":"constructor"},
  {"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"donor","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"}],"name":"DonationReceived","type":"event"},
  {"inputs":[],"name":"donate","outputs":[],"stateMutability":"payable","type":"function"}
];

// Function to donate to a campaign
export async function donateToCampaign(campaignAddress, amount) {
  try {
    const provider = await getProvider();
    const signer = await provider.getSigner();
    const campaign = new ethers.Contract(campaignAddress, campaignABI, signer);

    // Convert amount from ether to wei and send the transaction
    const tx = await campaign.donate({
      value: ethers.parseEther(amount.toString())
    });
    const receipt = await tx.wait();

    // Get the DonationReceived event from the receipt
    const event = receipt.logs[0];
    const donationAmount = ethers.formatEther(event.args[1]);

    console.log("Donation successful!");
    console.log("Amount donated:", donationAmount, "ETH");

    return receipt; // Return the transaction receipt
  } catch (error) {
    console.error("Error donating to campaign:", error);
    throw error; // Throw the error to be handled by the caller
  }
}

// Example usage
// donateToCampaign("0xbe02088c70a3d6dbbb6880aa875618d7739aed70", "0.001");