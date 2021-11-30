import './styles/App.css';
import twitterLogo from './assets/twitter-logo.svg';
import { ethers } from "ethers";
import React, { useEffect, useState } from "react";
import payToWin from './utils/PayToWin.json';
import { hexZeroPad } from '@ethersproject/bytes';

const TWITTER_HANDLE = 'no';
const TWITTER_LINK = `https://twitter.com/${TWITTER_HANDLE}`;

// I moved the contract address to the top for easy access.
const CONTRACT_ADDRESS = "0xF31514D54de1ABa394b1029253AfA9539463A8EA";

const App = () => {

    const [currentAccount, setCurrentAccount] = useState("");
    const [leaderboardData, setLeaderboardData] = useState([]);

    const checkIfWalletIsConnected = async () => {
      const { ethereum } = window;

      if (!ethereum) {
          console.log("Make sure you have metamask!");
          return;
      } else {
          console.log("We have the ethereum object", ethereum);
      }

      let chainId = await ethereum.request({ method: 'eth_chainId' });
      console.log("Connected to chain " + chainId);
      
      // String, hex code of the chainId of the Rinkebey test network
      const rinkebyChainId = "0x4"; 
      if (chainId !== rinkebyChainId) {
        alert("You are not connected to the Rinkeby Test Network!");
      } 

      const accounts = await ethereum.request({ method: 'eth_accounts' });

      if (accounts.length !== 0) {
          const account = accounts[0];
          console.log("Found an authorized account:", account);
					setCurrentAccount(account);
          
          // Setup listener! This is for the case where a user comes to our site
          // and ALREADY had their wallet connected + authorized.
          setupEventListener()
          //getMintNumbers();
          getLeaderboardData();
      } else {
          console.log("No authorized account found")
      }
  }

  const connectWallet = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        alert("Get MetaMask!");
        return;
      }

      const accounts = await ethereum.request({ method: "eth_requestAccounts" });

      console.log("Connected", accounts[0]);
      setCurrentAccount(accounts[0]);

      setupEventListener() 
    } catch (error) {
      console.log(error)
    }
  }

  // Setup our listener.
  const setupEventListener = async () => {
    // Most of this looks the same as our function askContractToMintNft
    try {
      const { ethereum } = window;

      if (ethereum) {
        // Same stuff again
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const connectedContract = new ethers.Contract(CONTRACT_ADDRESS, payToWin.abi, signer);

        /*
        connectedContract.on("NewEpicNFTMinted", (from, tokenId) => {
          console.log(from, tokenId.toNumber())
          alert(`Hey there! We've minted your NFT and sent it to your wallet. It may be blank right now. It can take a max of 10 min to show up on OpenSea. Here's the link: https://testnets.opensea.io/assets/${CONTRACT_ADDRESS}/${tokenId.toNumber()}`)
        });
        */

        console.log("Setup event listener!")

      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error)
    }
  }

  /*
  const askContractToMintNft = async () => {
    try {
      const { ethereum } = window;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const connectedContract = new ethers.Contract(CONTRACT_ADDRESS, myEpicNft.abi, signer);

        console.log("Going to pop wallet now to pay gas...")
        let nftTxn = await connectedContract.makeAnEpicNFT();

        console.log("Mining...please wait.")
        await nftTxn.wait();
        console.log(nftTxn);
        console.log(`Mined, see transaction: https://rinkeby.etherscan.io/tx/${nftTxn.hash}`);

      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error)
    }
  } 

  const getMintNumbers = async () => {
    try {
      const { ethereum } = window;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const connectedContract = new ethers.Contract(CONTRACT_ADDRESS, myEpicNft.abi, provider);

        console.log("OHH");
        let r = await connectedContract.getTokenCount();
        setMintCount(r.toString());
        r = await connectedContract.getMaxTokenCount();
        setMaxMintCount(r.toString());
      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error)
    }
  } 
  */

  //let leaderboardData = [];

  const getLeaderboardData = async () => {
    try {
      const { ethereum } = window;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const connectedContract = new ethers.Contract(CONTRACT_ADDRESS, payToWin.abi, provider);

        let r = await connectedContract.getUnsortedLeaderboard();

        r.sort(function(a, b) {
          var keyA = a.score,
            keyB = b.score;
          if (keyA < keyB) return -1;
          if (keyA > keyB) return 1;
          return 0;
        });
  
        //leaderboardData = r;
        setLeaderboardData(r);
      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error)
    }
  }

  useEffect(() => {
    checkIfWalletIsConnected();
  }, [])

  const renderLeaderboard = function() {
    if (leaderboardData.length != 0) {
      const thingy = leaderboardData.map((e) => {return (<div>{e.name} - {ethers.utils.formatEther(e.score, 'ether')}</div>)}); 
      return (<div>
        {thingy}
      </div>)
    }

    return (<div>Leaderboard here</div>);
  }

  const payAndWin = async function() {
    try {
      const { ethereum } = window;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const connectedContract = new ethers.Contract(CONTRACT_ADDRESS, payToWin.abi, signer);

        console.log("Going to pop wallet now to pay gas...")
        let nftTxn = await connectedContract.pay("MAN", {value: ethers.utils.parseEther("0.001")});

        console.log("Mining...please wait.")
        await nftTxn.wait();
        console.log(nftTxn);
        console.log(`Mined, see transaction: https://rinkeby.etherscan.io/tx/${nftTxn.hash}`);

      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error)
    }
  }

  const renderNotConnectedContainer = () => (
    <button onClick={connectWallet} className="cta-button connect-wallet-button">
      Connect to Wallet
    </button>
  );

  const renderUI = () => (
    <div>
      <button onClick={payAndWin} className="cta-button connect-wallet-button">
        PAY/WIN
      </button><br />

      <h2>Leaderboard</h2>
      {renderLeaderboard()}
    </div>
  )

  return (
    <div className="App">
      <div className="container">
        <div className="header-container">
          <p className="header gradient-text">Pay To Win</p>
          <p className="sub-text">
            p2w baby!
          </p>
          {currentAccount === "" ? renderNotConnectedContainer() : renderUI()}
        </div>
      </div>
    </div>
  );
};

export default App;