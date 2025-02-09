import { ethers } from "ethers";

// Connect to Ethereum network using browser provider
async function getProvider() {
  if (!window.ethereum) {
    throw new Error("Please install a wallet extension (e.g., MetaMask)");
  }
  return new ethers.BrowserProvider(window.ethereum);
}

// ABI of the Campaign contract (including withdraw function)
const campaignABI = [
  {"inputs":[{"internalType":"address","name":"_owner","type":"address"},{"internalType":"string","name":"_title","type":"string"},{"internalType":"string","name":"_description","type":"string"},{"internalType":"uint256","name":"_goal","type":"uint256"}],"stateMutability":"nonpayable","type":"constructor"},
  {"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"owner","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"}],"name":"CampaignWithdrawn","type":"event"},
  {"inputs":[],"name":"withdraw","outputs":[],"stateMutability":"nonpayable","type":"function"},
  {"inputs":[],"name":"owner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"}
];

export async function withdrawFromCampaign(campaignAddress) {
  try {
    const provider = await getProvider();
    const signer = await provider.getSigner();
    const campaign = new ethers.Contract(campaignAddress, campaignABI, signer);
    
    // Check if the caller is the owner
    const owner = await campaign.owner();
    const signerAddress = await signer.getAddress();
    
    if (owner.toLowerCase() !== signerAddress.toLowerCase()) {
      throw new Error("Only the campaign owner can withdraw funds");
    }

    // Get contract balance before withdrawal
    const balance = await provider.getBalance(campaignAddress);
    const balanceInEther = ethers.formatEther(balance);

    // Estimate gas before sending transaction
    const gasEstimate = await campaign.withdraw.estimateGas();
    
    // Send withdraw transaction with gas estimate
    const tx = await campaign.withdraw({
      gasLimit: Math.ceil(Number(gasEstimate) * 1.2) // Convert BigInt to Number
    });

    // Wait for transaction confirmation
    const receipt = await tx.wait();

    // Find CampaignWithdrawn event
    const withdrawEvent = receipt.logs.find(log => {
      try {
        return log.topics[0] === ethers.id("CampaignWithdrawn(address,uint256)");
      } catch {
        return false;
      }
    });

    if (!withdrawEvent) {
      throw new Error("Withdrawal event not found in transaction receipt");
    }

    return {
      hash: receipt.hash,
      amount: balanceInEther // Return the pre-withdrawal balance in ETH
    };
  } catch (error) {
    console.error("Error withdrawing from campaign:", error);
    throw error;
  }
}

// Example usage
// withdrawFromCampaign("0xbe02088c70a3d6dbbb6880aa875618d7739aed70");