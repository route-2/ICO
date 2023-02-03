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

    const mintDevToken = async () => {
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
        await getBalanceOfDevTokens();
        await getTotalTokensMinted();
        await getTokensToBeClaimed();
  
      } catch (error) {
        
      }
    }
    
  
    /**
     * claimCryptoDevTokens: Helps the user claim Crypto Dev Tokens
     */
    const claimDevTokens = async () => {
      try {
        // We need a Signer here since this is a 'write' transaction.
        // Create an instance of tokenContract
        const signer = await getProviderOrSigner(true);
        // Create an instance of tokenContract
        const tokenContract = new Contract(
          TOKEN_CONTRACT_ADDRESS,
          TOKEN_CONTRACT_ABI,
          signer
        );
        const tx = await tokenContract.claim();
        setLoading(true);
        // wait for the transaction to get mined
        await tx.wait();
        setLoading(false);
        window.alert("Sucessfully claimed Crypto Dev Tokens");
        await getBalanceOfDevTokens();
        await getTotalTokensMinted();
        await getTokensToBeClaimed();
      } catch (err) {
        console.error(err);
      }
    };
  
    /**
     * getTotalTokensMinted: Retrieves how many tokens have been minted till now
     * out of the total supply
     */
    const getTotalTokensMinted = async () => {
      try {
        // Get the provider from web3Modal, which in our case is MetaMask
        // No need for the Signer here, as we are only reading state from the blockchain
        const provider = await getProviderOrSigner();
        // Create an instance of token contract
        const tokenContract = new Contract(
          TOKEN_CONTRACT_ADDRESS,
          TOKEN_CONTRACT_ABI,
          provider
        );
        // Get all the tokens that have been minted
        const _tokensMinted = await tokenContract.totalSupply();
        setTokensMinted(_tokensMinted);
      } catch (err) {
        console.error(err);
      }
    };
  
    /**
     * getOwner: gets the contract owner by connected address
     */
    const getOwner = async () => {
      try {
        const provider = await getProviderOrSigner();
        const tokenContract = new Contract(
          TOKEN_CONTRACT_ADDRESS,
          TOKEN_CONTRACT_ABI,
          provider
        );
        // call the owner function from the contract
        const _owner = await tokenContract.owner();
        // we get signer to extract address of currently connected Metamask account
        const signer = await getProviderOrSigner(true);
        // Get the address associated to signer which is connected to Metamask
        const address = await signer.getAddress();
        if (address.toLowerCase() === _owner.toLowerCase()) {
          setIsOwner(true);
        }
      } catch (err) {
        console.error(err.message);
      }
    };
  
    /**
     * withdrawCoins: withdraws ether by calling
     * the withdraw function in the contract
     */
    const withdrawCoins = async () => {
      try {
        const signer = await getProviderOrSigner(true);
        const tokenContract = new Contract(
          TOKEN_CONTRACT_ADDRESS,
          TOKEN_CONTRACT_ABI,
          signer
        );
  
        const tx = await tokenContract.withdraw();
        setLoading(true);
        await tx.wait();
        setLoading(false);
        await getOwner();
      } catch (err) {
        console.error(err);
        window.alert(err.reason);
      }
    };

    const getProviderOrSigner = async (needSigner = false) => {
      // Connect to Metamask
      // Since we store `web3Modal` as a reference, we need to access the `current` value to get access to the underlying object
      const provider = await web3ModalRef.current.connect();
      const web3Provider = new providers.Web3Provider(provider);
  
      // If user is not connected to the Goerli network, let them know and throw an error
      const { chainId } = await web3Provider.getNetwork();
      if (chainId !== 5) {
        window.alert("Change the network to Goerli");
        throw new Error("Change network to Goerli");
      }
  
      if (needSigner) {
        const signer = web3Provider.getSigner();
        return signer;
      }
      return web3Provider;
    };
  
    /*
          connectWallet: Connects the MetaMask wallet
        */
    const connectWallet = async () => {
      try {
        // Get the provider from web3Modal, which in our case is MetaMask
        // When used for the first time, it prompts the user to connect their wallet
        await getProviderOrSigner();
        setWalletConnected(true);
      } catch (err) {
        console.error(err);
      }
    };
  
    // useEffects are used to react to changes in state of the website
    // The array at the end of function call represents what state changes will trigger this effect
    // In this case, whenever the value of `walletConnected` changes - this effect will be called
    useEffect(() => {
      // if wallet is not connected, create a new instance of Web3Modal and connect the MetaMask wallet
      if (!walletConnected) {
        // Assign the Web3Modal class to the reference object by setting it's `current` value
        // The `current` value is persisted throughout as long as this page is open
        web3ModalRef.current = new Web3Modal({
          network: "goerli",
          providerOptions: {},
          disableInjectedProvider: false,
        });
        connectWallet();
        getTotalTokensMinted();
        getBalanceOfDevTokens();
        getTokensToBeClaimed();
        getOwner();
      }
    }, [walletConnected]);

    const renderButton = () => {
      // If we are currently waiting for something, return a loading button
      if (loading) {
        return (
          <div>
            <button className={styles.button}>Loading...</button>
          </div>
        );
      }
      // If tokens to be claimed are greater than 0, Return a claim button
      if (tokensToBeClaimed > 0) {
        return (
          <div>
            <div className={styles.description}>
              {tokensToBeClaimed * 10} Tokens can be claimed!
            </div>
            <button className={styles.button} onClick={claimDevTokens}>
              Claim Tokens
            </button>
          </div>
        );
      }

      
  
    }

    return (
      <div style={{ display: "flex-col" }}>
      <div>
        <input
          type="number"
          placeholder="Amount of Tokens"
          // BigNumber.from converts the `e.target.value` to a BigNumber
          onChange={(e) => setTokenAmount(BigNumber.from(e.target.value))}
          className={styles.input}
        />
      </div>

      <button
        className={styles.button}
        disabled={!(tokenAmount > 0)}
        onClick={() => mintDevToken(tokenAmount)}
      >
        Mint Tokens
      </button>
    </div>
  )

    return (
      <div>
      <Head>
        <title>Crypto Devs</title>
        <meta name="description" content="ICO-Dapp" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className={styles.main}>
        <div>
          <h1 className={styles.title}>Welcome to Crypto Devs ICO!</h1>
          <div className={styles.description}>
            You can claim or mint Crypto Dev tokens here
          </div>
          {walletConnected ? (
            <div>
              <div className={styles.description}>
                {/* Format Ether helps us in converting a BigNumber to string */}
                You have minted {utils.formatEther(balanceOfCryptoDevTokens)} Crypto
                Dev Tokens
              </div>
              <div className={styles.description}>
                {/* Format Ether helps us in converting a BigNumber to string */}
                Overall {utils.formatEther(tokensMinted)}/10000 have been minted!!!
              </div>
              {renderButton()}
              {/* Display additional withdraw button if connected wallet is owner */}
                {isOwner ? (
                  <div>
                  {loading ? <button className={styles.button}>Loading...</button>
                           : <button className={styles.button} onClick={withdrawCoins}>
                               Withdraw Coins
                             </button>
                  }
                  </div>
                  ) : ("")
                }
            </div>
          ) : (
            <button onClick={connectWallet} className={styles.button}>
              Connect your wallet
            </button>
          )}
        </div>
        <div>
          <img className={styles.image} src="./0.svg" />
        </div>
      </div>

      <footer className={styles.footer}>
        Made with &#10084; by Crypto Devs
      </footer>
    </div>
  
    )


}