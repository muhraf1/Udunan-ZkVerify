// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "./Campaign.sol"; // Import Campaign contract

contract CampaignFactory {
    address[] public campaigns; // Stores all deployed campaign addresses

    event CampaignCreated(address indexed campaignAddress, address indexed owner);

    function createCampaign(
        string memory _title,
        string memory _description,
        uint256 _goal
    ) public {
        // Deploy a new campaign contract
        Campaign newCampaign = new Campaign(msg.sender, _title, _description, _goal);
        
        // Store deployed campaign address
        campaigns.push(address(newCampaign));

        // Emit event
        emit CampaignCreated(address(newCampaign), msg.sender);
    }

    function getAllCampaigns() public view returns (address[] memory) {
        return campaigns;
    }
}

