import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom"; // Import routing components
import App from "./App";
import Transaction from "./transaction_detail"; // Ensure the import path is correct (case-sensitive)
import "./index.css";

// Main component to wrap the Router and Routes
function Main() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} /> {/* Home route */}
        <Route path="/transaction/:network/:input" element={<Transaction />} /> {/* Transaction route */}
      </Routes>
    </BrowserRouter>
  );
}

// Render the app
ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Main />
  </React.StrictMode>
);