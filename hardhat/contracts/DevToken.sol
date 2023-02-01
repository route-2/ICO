// SPDX-License-Identifier: MIT
  pragma solidity ^0.8.0;

  import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
  import "@openzeppelin/contracts/access/Ownable.sol";
  import "./IDevs.sol";

   contract DevToken is ERC20, Ownable {
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

function claim() public {
    address sender = msg.sender;
    uint256 balance = DevsNFT.balanceOf(sender);
    require(balance>0,"you dont own any nft");
    uint256 amount = 0;

    for(uint256 i = 0; i < balance; i++){
        uint256 tokenId = DevsNFT.tokenOfOwnerByIndex(sender, i);
        // if nft not claimed then increment amount
        if(!tokenIdsClaimed[tokenId]){
            amount += 1;
            tokenIdsClaimed[tokenId] = true;
        }
    }

    require(amount > 0, "You have already claimed your tokens");
    _mint(msg.sender, amount * tokensPerNFT);

}

function withdraw() public onlyOwner {

    uint256 amount = address(this).balance;
   require(amount > 0, "Nothing to withdraw, contract balance empty");
    address _owner = owner();
    (bool sent, ) = _owner.call{value: amount}(""); // , is for calldata i.e converting params to hex data but here no params and "" if there's no other function being called
        require(sent, "Failed to send Ether");

}
 receive() external payable{} // no msg.data
 fallback() external payable{} // has msg.data 
     

  }