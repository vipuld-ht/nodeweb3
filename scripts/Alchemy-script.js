import { Alchemy, Network } from "alchemy-sdk";

const settings = {
  apiKey: "5IYNrk3xAUwPGBCZ40LZSgBXDPQcVr0c",
  network: Network.ETH_MAINNET,
};
const alchemy = new Alchemy(settings);

// The wallet address / token we want to query for:
const ownerAddr = "0x3f5ce5fbfe3e9af3971dd833d26ba9b5c936f0be";
const balances = await alchemy.core.getTokenBalances(ownerAddr, [
  "0x607f4c5bb672230e8672085532f7e901544a7375",
]);

// The token address we want to query for metadata:
const metadata = await alchemy.core.getTokenMetadata(
  "0x607f4c5bb672230e8672085532f7e901544a7375"
);

console.log("Token Balances:");
console.log(balances);
console.log("Token Metadata: ");
console.log(metadata);