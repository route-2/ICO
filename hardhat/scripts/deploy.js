const { ethers } = require("hardhat");
require("dotenv").config({ path: ".env" });
const { DEVS_NFT_CONTRACT_ADDRESS } = require("../constants");

async function main() {
  const DevsNFTContract = DEVS_NFT_CONTRACT_ADDRESS;
  const DevsTokenContract = await ethers.getContractFactory("DevToken");
  const deployedDevsTokenContract = await DevsTokenContract.deploy(
    DevsNFTContract
  );
  await deployedDevsTokenContract.deployed();
  // print the address of the deployed contract
  console.log(
    " Devs Token Contract Address:",
    deployedDevsTokenContract.address
  );

}
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });