import express, { json } from 'express';

import Web3 from 'web3';
import jsonData from '../ContractJSON/AssetRegistry.json' with { type: 'json' };
import cors from 'cors';
import dotenv from 'dotenv';
dotenv.config();

const app = express();

app.use(cors({
  origin: 'http://localhost:3000', // Allow requests from your frontend origin
  methods: ['GET', 'POST'],       // Allow specific HTTP methods
  credentials: true               // Allow credentials if needed
}));

app.use(json());
const account = process.env.ACCOUNT_ADDRESS;
const web3 = new Web3(process.env.INFURA_SEPOLIA_URL);
const contractAddress = process.env.CONTRACT_ADDRESS;
// const web3 = new Web3(process.env.INFURA_SEPOLIA_URL);

function convertTimestampToUint(timestamp) {
  const date = new Date(timestamp); // Parse the timestamp string into a Date object
  const unixTimestamp = Math.floor(date.getTime() / 1000); // Convert to seconds
  return unixTimestamp; // Return as string (to handle large uint256 size)
}
const contract = new web3.eth.Contract(jsonData.abi, jsonData.address);

// Connect to MetaMask
async function connectMetaMask() {
  if (window.ethereum) {
      await ethereum.request({ method: "eth_requestAccounts" });
      const web3 = new Web3(window.ethereum);
      return web3;
  } else {
      alert("MetaMask not detected. Please install it.");
      return null;
  }
}

const registerAssetOnBlockchain = async (ipfsHash, timestamp) => {
  console.log(process.env.INFURA_SEPOLIA_URL +"==URL")
  const balance = await web3.eth.getBalance(account);
  const unixTimestamp = convertTimestampToUint(timestamp);
  // Register asset on the blockchain
  console.log("Balance == "+balance)
  // const accounts = await web3.eth.getAccounts();
  // const account = accounts[0];
  console.log("contractAddress=="+contractAddress);
  console.log("ipfsHash === " +ipfsHash);
  console.log("timestamp === " +timestamp);
  console.log("unixTimestamp === " +unixTimestamp);
  try {
    const tx = {
      to: contractAddress,
      data: contract.methods.registerAsset(ipfsHash, unixTimestamp).encodeABI(),
      gas: await contract.methods.registerAsset(ipfsHash, unixTimestamp).estimateGas({ from: account }),
      from: account,
    };

    const signedTx = await web3.eth.accounts.signTransaction(tx, process.env.PRIVATE_KEY); // Sign the transaction
    const receipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction); // Send the signed transaction
    
    console.log("Transaction receipt: ", receipt);
    console.log("Asset registered on the blockchain!");
  } catch (error) {
    console.error("Error registering asset on blockchain:", error);
  }
};

// Verify asset on the blockchain
const verifyAsset = async (ipfsHash) => {
  try {
    const exists = await contract.methods.verifyAsset(ipfsHash).call();
    return exists;
  } catch (error) {
    console.error("Error verifying asset:", error);
    return false;
  }
};

// Example usage (from the backend handler)
app.post("/register-asset", async (req, res) => {
  const { ipfsHash, timestamp } = req.body;

  if (!ipfsHash || !timestamp) {
    return res.status(400).send("Missing ipfsHash or timestamp.");
  }

  try {
    // Register asset on blockchain (your logic here)
    await registerAssetOnBlockchain(ipfsHash, timestamp);
    res.status(200).send("Asset registered on the blockchain.");
  } catch (error) {
    console.error("Error registering asset:", error);
    res.status(500).send("Error registering asset.");
  }
});
// API to verify an asset
app.get("/verify-asset", async (req, res) => {
  const { ipfsHash } = req.query;

  if (!ipfsHash) {
    return res.status(400).send("IPFS hash is required.");
  }

  try {
    const exists = await verifyAsset(ipfsHash);
    if (exists) {
      res.status(200).send({ message: "Asset exists on the blockchain." });
    } else {
      res.status(404).send({ message: "Asset does not exist on the blockchain." });
    }
  } catch (error) {
    console.error("Error verifying asset:", error);
    res.status(500).send("Error verifying asset.");
  }
});

const PORT = 4242;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
