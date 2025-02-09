import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export default buildModule("CampaignModule", (m) => {
 
  const campaignArtifact = m.contract("Campaign");
  
  return { campaignArtifact };
});