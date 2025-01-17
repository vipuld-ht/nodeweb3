import express, { json } from 'express';
import Web3 from 'web3';
import contractJson from '../ContractJSON/AssetRegistry.json' with { type: 'json' };
import dotenv from 'dotenv';
import cors from 'cors';
dotenv.config();

const app = express();
app.use(json());
app.use(cors({
    origin: 'http://localhost:3000', // Allow requests from your frontend origin
    methods: ['GET', 'POST'],       // Allow specific HTTP methods
    credentials: true               // Allow credentials if needed
}));

const web3 = new Web3("https://sepolia.infura.io/v3/62fd981f0d5a469ba641a06e35d44f0b");
const account = web3.eth.accounts.privateKeyToAccount("0x8f8856a361987f238a05a0aced82677112f8f6a379d0d091a6502f9d7fcbeef0");

web3.eth.accounts.wallet.add(account);
web3.eth.defaultAccount = account.address;
const contractAddress = contractJson.address;
const abi = contractJson.abi;

const contract = new web3.eth.Contract(abi, contractAddress);
//shadan contract address and hash QmVtimTWZUPXE2Ak2H6xBuw2nAz5vvmSYpwLVqAdyFdzPe
// const contract = new web3.eth.Contract(abi, "0x4Fc0A544afA4574235afd37eFBaB2867C32c8e7c");

console.log( "contract === "+contract.methods)
console.log(web3.eth.defaultAccount)
function convertTimestampToUint(timestamp) {
  const date = new Date(timestamp); // Parse the timestamp string into a Date object
  const unixTimestamp = Math.floor(date.getTime() / 1000); // Convert to seconds
  return unixTimestamp; // Return as string (to handle large uint256 size)
}
app.post('/register-asset', async (req, res) => {
    try {
        const {ipfsHash, timestamp} = req.body;
        const unixTimestamp = convertTimestampToUint(timestamp);
        
        console.log("ipfsHash"+ipfsHash)
        const tx = await contract.methods.registerAsset(ipfsHash, unixTimestamp).send({
              from: web3.eth.defaultAccount,
              gas: 500000,
            });
            console.log(`Asset registered with hash: ${ipfsHash}`);
            res.json({ message: 'Asset registered successfully', ipfsHash });
     }
    catch (err) {

        console.error("Error registering asset on blockchain:", err);
        res.status(500).json({ error: err.message });
    }
});

app.get('/verify-asset/:hash', async (req, res) => {
    try {
        const ipfsHash = req.params.hash;
        const result = await contract.methods.verifyAsset(ipfsHash).call();
        res.json({
          result
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// app.listen(3001, () => console.log('Backend running on port 3001'));

const PORT = 4242;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
