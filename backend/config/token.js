
export const USDT_CONTRACT_ADDRESSES = {
  SEPOLIA: "0x7169D38820dfd117C3FA1f22a697dBA58d90BA06",
  ETHEREUM: "0xdAC17F958D2ee523a2206206994597C13D831ec7",
  POLYGON: "0xc2132D05D31c914a87C6611C10748AEb04B58e8F",
  BSC: "0x55d398326f99059fF775485246999027B3197955"
};


export const USDT_ABI = [
  {
    constant: true,
    inputs: [{ name: "_owner", type: "address" }],
    name: "balanceOf",
    outputs: [{ name: "balance", type: "uint256" }],
    type: "function"
  },
  {
    constant: true,
    inputs: [],
    name: "decimals",
    outputs: [{ name: "", type: "uint8" }],
    type: "function"
  }
];

export default {
  USDT_CONTRACT_ADDRESSES,
  USDT_ABI
};