// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract Campaign {
    address public owner;
    string public title;
    string public description;
    uint256 public goal;
    uint256 public fundsRaised;

    event DonationReceived(address indexed donor, uint256 amount);
    event CampaignWithdrawn(address indexed owner, uint256 amount);

    constructor(
        address _owner,
        string memory _title,
        string memory _description,
        uint256 _goal
    ) {
        owner = _owner;
        title = _title;
        description = _description;
        goal = _goal;
    }

    function donate() public payable {
        require(msg.value > 0, "Must send some ether");
        fundsRaised += msg.value;
        emit DonationReceived(msg.sender, msg.value);
    }

    function withdraw() public {
        require(msg.sender == owner, "Only owner can withdraw");
        require(fundsRaised > 0, "No funds to withdraw");

        uint256 amount = fundsRaised;
        fundsRaised = 0;
        payable(owner).transfer(amount);

        emit CampaignWithdrawn(owner, amount);
    }
}
