import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export default buildModule("CampaignFactoryModule", (m) => {
  // Deploy the CampaignFactory contract
  const campaignFactory = m.contract("CampaignFactory");

  return { 
    campaignFactory
  };
});