import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { NETWORKS } from "./config";

const fetchReceipt = async (network, txHash) => {
  const rpcUrl = NETWORKS[network].rpcUrl;

  const response = await fetch(rpcUrl, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      jsonrpc: "2.0",
      method: "eth_getTransactionReceipt",
      params: [txHash],
      id: 1,
    }),
  });

  if (!response.ok) throw new Error("Failed to fetch transaction receipt");

  const data = await response.json();
  if (data.error) throw new Error(data.error.message || "Transaction receipt not found");

  return data.result;
};

const fetchTransaction = async (network, txHash) => {
  const rpcUrl = NETWORKS[network].rpcUrl;

  const response = await fetch(rpcUrl, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      jsonrpc: "2.0",
      method: "eth_getTransactionByHash",
      params: [txHash],
      id: 2,
    }),
  });

  if (!response.ok) throw new Error("Failed to fetch transaction details");

  const data = await response.json();
  if (data.error) throw new Error(data.error.message || "Transaction details not found");

  return data.result;
};

const fetchBlock = async (network, blockHash) => {
  const rpcUrl = NETWORKS[network].rpcUrl;

  const response = await fetch(rpcUrl, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      jsonrpc: "2.0",
      method: "eth_getBlockByHash",
      params: [blockHash, true],
      id: 3,
    }),
  });

  if (!response.ok) throw new Error("Failed to fetch block details");

  const data = await response.json();
  if (data.error) throw new Error(data.error.message || "Block details not found");

  return data.result;
};

function Transaction() {
  const { network, input: txHash } = useParams(); // Get the network and transaction hash from the URL
  const [receipt, setReceipt] = useState(null); // Store the transaction receipt
  const [transaction, setTransaction] = useState(null); // Store the transaction details
  const [block, setBlock] = useState(null); // Store the block details
  const [error, setError] = useState(""); // Store any errors
  const [isLoading, setIsLoading] = useState(true); // Track loading state

  useEffect(() => {
    const getTransactionDetails = async () => {
      try {
        // Validate the network
        if (!NETWORKS[network]) {
          throw new Error("Invalid network selected.");
        }

        // Validate the transaction hash
        if (!/^0x([A-Fa-f0-9]{64})$/.test(txHash)) {
          throw new Error("Invalid transaction hash. It should be 64 characters long and start with '0x'.");
        }

        // Step 1: Fetch the transaction receipt
        const receiptData = await fetchReceipt(network, txHash);
        if (!receiptData) {
          throw new Error("Transaction not found on this network.");
        }
        setReceipt(receiptData);

        // Step 2: Fetch the transaction details
        const transactionData = await fetchTransaction(network, txHash);
        setTransaction(transactionData);

        // Step 3: Fetch the block details using the blockHash from the receipt
        const blockData = await fetchBlock(network, receiptData.blockHash);
        setBlock(blockData);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    getTransactionDetails();
  }, [network, txHash]); // Re-run when the network or transaction hash changes

  // Get the theme based on the selected network
  const theme = NETWORKS[network]?.theme || NETWORKS.ethereum.theme;

  if (isLoading) {
    return (
      <div className={`App min-h-screen p-6 ${theme.background} ${theme.text}`}>
        <div className="flex justify-center items-center h-full">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`App min-h-screen p-6 ${theme.background} ${theme.text}`}>
        <div className="search-container max-w-2xl mx-auto p-6 rounded-lg shadow-md bg-white">
          <div className="text-center text-red-500">{error}</div>
        </div>
      </div>
    );
  }

  // Convert timestamp to human-readable format
  const timestamp = new Date(parseInt(block.timestamp, 16) * 1000).toLocaleString();

  // Convert value and gas price from wei to ETH
  const valueInEth = parseInt(transaction.value, 16) / 1e18;
  const gasPriceInGwei = parseInt(transaction.gasPrice, 16) / 1e9;

  // Calculate transaction fee
  const transactionFee = (receipt.gasUsed * gasPriceInGwei) / 1e9;

  return (
    <div className={`App min-h-screen p-6 ${theme.background} ${theme.text}`}>
      <h1 className="text-3xl font-bold text-center mb-6">Transaction Details</h1>
      <div className={`search-container max-w-2xl mx-auto p-6 rounded-lg shadow-md ${theme.cardBackground}`}>
        <div className="flex items-center space-x-2 mb-4">
          <img src={NETWORKS[network].icon} alt={NETWORKS[network].name} className="w-6 h-6" />
          <span className="text-xl font-semibold">{NETWORKS[network].name}</span>
        </div>
        <div className="detail mb-4">
          <strong className="font-semibold">Transaction Hash:</strong>{" "}
          <span className="text-gray-700">{txHash}</span>
        </div>
        <div className="detail mb-4">
  <strong className="font-semibold">Status:</strong>{" "}
  <span
    className={`px-2 py-1 rounded ${
      receipt.status === "0x1"
        ? "bg-green-100 text-green-800" // Green for success
        : "bg-red-100 text-red-800" // Red for failure
    }`}
  >
    {receipt.status === "0x1" ? "Success" : "Failure"}
  </span>
 </div>
        <div className="detail mb-4">
          <strong className="font-semibold">Block:</strong>{" "}
          <span className="text-gray-700">{parseInt(receipt.blockNumber, 16)}</span>
        </div>
        <div className="detail mb-4">
          <strong className="font-semibold">Timestamp:</strong>{" "}
          <span className="text-gray-700">{timestamp}</span>
        </div>
        <div className="detail mb-4">
          <strong className="font-semibold">From:</strong>{" "}
          <span className="text-gray-700">{receipt.from}</span>
        </div>
        <div className="detail mb-4">
          <strong className="font-semibold">To:</strong>{" "}
          <span className="text-gray-700">{receipt.to}</span>
        </div>
        <div className="detail mb-4">
          <strong className="font-semibold">Value:</strong>{" "}
          <span className="text-gray-700">{valueInEth} {NETWORKS[network].currency}</span>
        </div>
        <div className="detail mb-4">
          <strong className="font-semibold">Transaction Fee:</strong>{" "}
          <span className="text-gray-700">
            {transactionFee} {NETWORKS[network].currency}
          </span>
        </div>
        <div className="detail mb-4">
          <strong className="font-semibold">Gas Price:</strong>{" "}
          <span className="text-gray-700">{gasPriceInGwei} Gwei</span>
        </div>
      </div>
    </div>
  );
}

export default Transaction;