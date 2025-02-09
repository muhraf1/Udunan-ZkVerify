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

export async function donateToCampaign(campaignAddress, amount) {
  try {
    const provider = await getProvider();
    const signer = await provider.getSigner();
    const campaign = new ethers.Contract(campaignAddress, campaignABI, signer);

    // Convert amount to Wei before sending transaction
    const amountInWei = ethers.parseEther(amount.toString());
    
    // Send transaction with Wei value
    const tx = await campaign.donate({
      value: amountInWei
    });

    // Wait for transaction confirmation
    const receipt = await tx.wait();

    // Find DonationReceived event
    const donationEvent = receipt.logs.find(log => {
      try {
        return log.topics[0] === ethers.id("DonationReceived(address,uint256)");
      } catch {
        return false;
      }
    });

    if (!donationEvent) {
      throw new Error("Donation event not found in transaction receipt");
    }

    return {
      hash: receipt.hash,
      donationEvent
    };
  } catch (error) {
    console.error("Error donating to campaign:", error);
    throw error;
  }
}
// Example usage
// donateToCampaign("0xbe02088c70a3d6dbbb6880aa875618d7739aed70", "0.001");
