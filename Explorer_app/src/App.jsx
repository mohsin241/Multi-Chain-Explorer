import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { NETWORKS } from "./config";

function App() {
  const [transactionHash, setTransactionHash] = useState("");
  const [selectedNetwork, setSelectedNetwork] = useState("ethereum"); // Default network
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSearch = async (e) => {
    e.preventDefault();

    // Validate the transaction hash
    if (!transactionHash.trim()) {
      setError("Please enter a transaction hash.");
      return;
    }

    if (!/^0x([A-Fa-f0-9]{64})$/.test(transactionHash)) {
      setError("Invalid transaction hash. It should be 64 characters long and start with '0x'.");
      return;
    }

    // Validate the selected network
    if (!NETWORKS[selectedNetwork]) {
      setError("Invalid network selected.");
      return;
    }

    setError(""); // Clear any previous errors
    navigate(`/transaction/${selectedNetwork}/${transactionHash}`); // Navigate to the transaction route
  };

  // Get the theme based on the selected network
  const theme = NETWORKS[selectedNetwork].theme;

  return (
    <div className={`App min-h-screen p-6 ${theme.background} ${theme.text}`}>
      <h1 className="text-3xl font-bold text-center mb-6">Multi-Chain Explorer</h1>
      <div className={`search-container max-w-md mx-auto p-6 rounded-lg shadow-md ${theme.cardBackground}`}>
        <form onSubmit={handleSearch} className="space-y-4">
          <div className="flex items-center space-x-2">
            <img src={NETWORKS[selectedNetwork].icon} alt={NETWORKS[selectedNetwork].name} className="w-6 h-6" />
            <select
              value={selectedNetwork}
              onChange={(e) => setSelectedNetwork(e.target.value)}
              className={`w-full p-2 border rounded-lg focus:outline-none focus:ring-2 ${theme.selectBorder} ${theme.selectFocus}`}
            >
              {Object.keys(NETWORKS).map((network) => (
                <option key={network} value={network}>
                  {NETWORKS[network].name}
                </option>
              ))}
            </select>
          </div>
          <input
            type="text"
            placeholder="Enter Transaction Hash"
            value={transactionHash}
            onChange={(e) => {
              setTransactionHash(e.target.value);
              setError(""); // Clear error when user starts typing
            }}
            className={`w-full p-2 border rounded-lg focus:outline-none focus:ring-2 ${theme.inputBorder} ${theme.inputFocus}`}
          />
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <button
            type="submit"
            className={`w-full p-2 rounded-lg transition-colors ${theme.buttonBackground} ${theme.buttonHover}`}
          >
            Search
          </button>
        </form>
      </div>
    </div>
  );
}

export default App;