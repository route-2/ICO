import { BigNumber, Contract, providers, utils } from "ethers";
import Head from "next/head";
import React, { useEffect, useRef, useState } from "react";
import Web3Modal from "web3modal";
import {
  NFT_CONTRACT_ABI,
  NFT_CONTRACT_ADDRESS,
  TOKEN_CONTRACT_ABI,
  TOKEN_CONTRACT_ADDRESS,
} from "../constants";
import styles from "../styles/Home.module.css";

export default function Home() {

  const zero = BigNumber.from(0);
  const [walletConnected, setWalletConnected] = useState(false);
  const[loading, setLoading] = useState(false);
  const [tokensToBeClaimed, setTokensToBeClaimed] = useState(zero);
  const [balanceOfCryptoDevTokens, setBalanceOfCryptoDevTokens] =
    useState(zero);
    const [tokenAmount, setTokenAmount] = useState(zero);
    const [tokensMinted, setTokensMinted] = useState(zero);
    const [isOwner, setIsOwner] = useState(false);
    const web3ModalRef = useRef();

    const getTokensToBeClaimed = async () => {

      try {
        // to read from bc
        const provider = new providers.Web3Provider(window.ethereum);
        const nftContract = new Contract(
          NFT_CONTRACT_ADDRESS,
          NFT_CONTRACT_ABI,
          provider
        );
        // Create an instance of tokenContract
        const tokenContract = new Contract(
          TOKEN_CONTRACT_ADDRESS,
          TOKEN_CONTRACT_ABI,
          provider
        );
  
        // to get the addy of current acc connected
        const signer = provider.getSigner();
  
        const address = await signer.getAddress();
        const balance = await nftContract.balanceOf(address);
  
        if(balance == zero)
        {
          setTokensToBeClaimed(zero);
         
        }
        else 
        {
          var amount = 0;
          for(var i = 0; i < balance; i++)
          {
            const tokenId = await nftContract.tokenOfOwnerByIndex(address, i);
           const claimed = await tokenContract.tokenIdsClaimed(tokenId);
           if(!claimed)
           {
              amount++;
           }
          }
          setTokensToBeClaimed(amount);
        }
        
      } catch (error) {
        console.log(error);
        setTokensToBeClaimed(zero);
        
      }
    


     
    }
    const getBalanceOfDevTokens = async() => {
       try {
        const provider = await getProviderOrSigner();
        // Create an instance of tokenContract
        const tokenContract = new Contract(
          TOKEN_CONTRACT_ADDRESS,
          TOKEN_CONTRACT_ABI,
          provider
        );
        const signer = provider.getSigner();
        const address = signer.getAddress();
        const balance = await tokenContract.balanceOf(address);
        setBalanceOfCryptoDevTokens(balance)




        
       } catch (error) {
          console.log(error);
          setBalanceOfCryptoDevTokens(zero);
        
       }


    }

    const mintCryptoDevToken = async () => {
      try {
        const signer = await getProviderOrSigner(true);
        const tokenContract = new Contract(
          TOKEN_CONTRACT_ADDRESS,
          TOKEN_CONTRACT_ABI,
          signer
        );
        const value = 0.001 * amount; // price of 1 token * number of nfts

        const tx = await tokenContract.mint(amount, {
          value: utils.parseEther(value.toString()),

        });
        setLoading(true);
        await tx.wait();
        setLoading(false);
        window.alert("Successfully minted  Dev Tokens");
        await getBalanceOfCryptoDevTokens();
        await getTotalTokensMinted();
        await getTokensToBeClaimed();
  
      } catch (error) {
        
      }
    }



}