import express from 'express';
import dotenv from 'dotenv';
import { Web3 } from 'web3';

dotenv.config();

const app = express();
const web3 = new Web3(process.env.INFURA_SEPOLIA_URL);

const account = process.env.ACCOUNT_ADDRESS;

// Example: Fetch account balance
app.get('/balance', async (req, res) => {
    try {
        const balance = await web3.eth.getBalance(account);
        res.json({ balance: web3.utils.fromWei(balance, 'ether') + ' ETH' });
    } catch (error) {
        console.error(error);
        res.status(500).send('Error fetching balance');
    }
});

const PORT = 3000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
