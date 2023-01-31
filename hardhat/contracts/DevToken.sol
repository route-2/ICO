// SPDX-License-Identifier: MIT
  pragma solidity ^0.8.0;

  import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
  import "@openzeppelin/contracts/access/Ownable.sol";
  import "./IDevs.sol";

  abstract contract DevToken is ERC20, Ownable {
    IDevs DevsNFT;
     uint256 public constant tokenPrice = 0.001 ether;
     uint256 public constant tokensPerNFT = 10 * 10 ** 18;
     uint256 public constant maxTotalSupply = 10000 * 10 ** 18;

mapping(uint256 => bool) public tokenIdsClaimed;

constructor(address _DevNFTContract ) ERC20 ("Dev Token", "D"){
    DevsNFT = IDevs(_DevNFTContract);
}

function mint(uint256 amount) public payable
{
    uint256 _requiredAmount = tokenPrice * amount;
    require(msg.value >= _requiredAmount, "Not enough ether sent");
     uint256 amountWithDecimals = amount * 10**18;
    require(totalSupply() + amountWithDecimals <= maxTotalSupply, "Max supply reached");
    _mint(msg.sender, amountWithDecimals);
}
     

  }