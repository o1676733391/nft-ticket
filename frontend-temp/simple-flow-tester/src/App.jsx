import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { SystemTokenABI, TicketNFTABI, MarketplaceABI } from './abis';
import { createEvent, mintTicket, authVerify } from './api';

const CONTRACTS = {
  TICKET_NFT: import.meta.env.VITE_TICKET_NFT_ADDRESS,
  MARKETPLACE: import.meta.env.VITE_MARKETPLACE_ADDRESS,
  SYSTEM_TOKEN: import.meta.env.VITE_SYSTEM_TOKEN_ADDRESS,
};

import OrganizerTab from './components/OrganizerTab';

function App() {
  const [account, setAccount] = useState(null);
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [jwt, setJwt] = useState('');
  const [logs, setLogs] = useState([]);
  const [chainId, setChainId] = useState(null);
  const [activeTab, setActiveTab] = useState('identity');

  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.request({ method: 'eth_chainId' }).then(setChainId);
      window.ethereum.on('chainChanged', (newChainId) => {
        setChainId(newChainId);
        window.location.reload();
      });
    }
  }, []);

  const isLocalhost = chainId === '0x7a69' || chainId === '0x539'; // 31337 or 1337

  const addLog = (msg) => setLogs(prev => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev]);

  const checkNetwork = async () => {
    const chainId = await window.ethereum.request({ method: 'eth_chainId' });
    // Accept either Hardhat default (31337/0x7a69) or Metamask default Localhost (1337/0x539)
    if (chainId === '0x7a69' || chainId === '0x539') return;

    try {
      // Try switching to Hardhat Network (31337)
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0x7a69' }],
      });
    } catch (switchError) {
      // If 31337 is not found, try adding it
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [
              {
                chainId: '0x7a69',
                chainName: 'Hardhat Localhost', // Renamed to avoid conflict
                rpcUrls: ['http://127.0.0.1:8545'],
                nativeCurrency: { name: 'ETH', symbol: 'ETH', decimals: 18 },
              },
            ],
          });
        } catch (addError) {
          // If adding fails (e.g. RPC collision), try switching to 1337 (Metamask default)
          if (addError.code === -32603) {
            try {
              await window.ethereum.request({
                method: 'wallet_switchEthereumChain',
                params: [{ chainId: '0x539' }],
              });
            } catch (e) {
              addLog(`Could not switch to Localhost: ${e.message}`);
            }
          } else {
            addLog(`Error adding network: ${addError.message}`);
          }
        }
      } else {
        addLog(`Error switching network: ${switchError.message}`);
      }
    }
  };

  const connectWallet = async () => {
    if (window.ethereum) {
      try {
        await checkNetwork(); // Force network switch
        const _provider = new ethers.BrowserProvider(window.ethereum);
        const _signer = await _provider.getSigner();
        const _account = await _signer.getAddress();
        setProvider(_provider);
        setSigner(_signer);
        setAccount(_account);
        addLog(`Connected: ${_account}`);
      } catch (err) {
        addLog(`Error connecting: ${err.message}`);
      }
    } else {
      addLog("Metamask not found!");
    }
  };

  const handleAuth = async () => {
    if (!signer) return;
    try {
      const message = "Please sign this message to authenticate.";
      const signature = await signer.signMessage(message);
      addLog("Message signed. Verifying...");
      const res = await authVerify(message, signature, account);
      if (res.data && res.data.user) {
        setJwt('dummy-jwt-for-now'); // Backend returns user object, not JWT yet
        addLog(`Auth successful! Welcome ${res.data.user.username || 'User'}`);
      } else {
        addLog("Auth failed.");
      }
    } catch (err) {
      addLog(`Auth error: ${err.message}`);
    }
  };

  const handleMintTokens = async () => {
    if (!signer || !account) return;
    try {
      const tokenContract = new ethers.Contract(CONTRACTS.SYSTEM_TOKEN, SystemTokenABI, signer);
      addLog("Minting 1000 TKT...");
      const tx = await tokenContract.mint(account, ethers.parseEther("1000"));
      await tx.wait();
      addLog("Minted 1000 TKT!");
    } catch (err) {
      addLog(`Mint Error: ${err.message}`);
    }
  };

  const handleSwitchNetwork = async () => {
    await checkNetwork();
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1>NFT Ticket Dashboard</h1>
        <div>
          {!account ? (
            <button onClick={connectWallet} style={{ padding: '10px 20px', background: '#007bff', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>Connect Wallet</button>
          ) : (
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontWeight: 'bold' }}>{account.slice(0, 6)}...{account.slice(-4)}</div>
              <div style={{ fontSize: '0.8em', color: '#666' }}>Connected</div>
            </div>
          )}
        </div>
      </div>

      {!isLocalhost && chainId && (
        <div style={{ background: '#ffcccc', padding: '15px', border: '1px solid red', marginBottom: '20px', borderRadius: '5px' }}>
          <h3 style={{ margin: '0 0 10px 0', color: 'red' }}>⚠️ WRONG NETWORK DETECTED</h3>
          <p style={{ margin: 0 }}>You are on <strong>{chainId}</strong>. Please switch to <strong>Localhost 8545</strong>.</p>
          <button onClick={handleSwitchNetwork} style={{ marginTop: '10px', padding: '8px 16px', fontWeight: 'bold', cursor: 'pointer' }}>
            👉 Switch to Localhost
          </button>
        </div>
      )}

      {/* TABS */}
      <div style={{ display: 'flex', borderBottom: '1px solid #ccc', marginBottom: '20px' }}>
        <button
          onClick={() => setActiveTab('identity')}
          style={{ padding: '10px 20px', background: activeTab === 'identity' ? '#eee' : 'white', border: 'none', cursor: 'pointer', borderBottom: activeTab === 'identity' ? '2px solid #007bff' : 'none' }}
        >
          Identity & Wallet
        </button>
        <button
          onClick={() => setActiveTab('organizer')}
          style={{ padding: '10px 20px', background: activeTab === 'organizer' ? '#eee' : 'white', border: 'none', cursor: 'pointer', borderBottom: activeTab === 'organizer' ? '2px solid #007bff' : 'none' }}
        >
          Organizer Console
        </button>
        <button
          onClick={() => setActiveTab('user')}
          style={{ padding: '10px 20px', background: activeTab === 'user' ? '#eee' : 'white', border: 'none', cursor: 'pointer', borderBottom: activeTab === 'user' ? '2px solid #007bff' : 'none' }}
        >
          User App
        </button>
        <button
          onClick={() => setActiveTab('marketplace')}
          style={{ padding: '10px 20px', background: activeTab === 'marketplace' ? '#eee' : 'white', border: 'none', cursor: 'pointer', borderBottom: activeTab === 'marketplace' ? '2px solid #007bff' : 'none' }}
        >
          Marketplace
        </button>
      </div>

      {/* TAB CONTENT */}
      <div style={{ minHeight: '400px' }}>
        {activeTab === 'identity' && (
          <div style={{ padding: '20px', border: '1px solid #eee', borderRadius: '5px' }}>
            <h2>Identity & Wallet</h2>
            <div style={{ marginBottom: '20px' }}>
              <button onClick={handleMintTokens} disabled={!account} style={{ marginRight: '10px', padding: '10px' }}>💰 Mint 1000 TKT (Faucet)</button>
              <button onClick={handleAuth} disabled={!account || !!jwt} style={{ padding: '10px' }}>
                {jwt ? "✅ Authenticated" : "🔐 Authenticate (Sign Message)"}
              </button>
            </div>
            <p>Use this tab to manage your wallet connection, get test tokens, and authenticate with the backend.</p>
          </div>
        )}

        {activeTab === 'organizer' && (
          <OrganizerTab account={account} jwt={jwt} addLog={addLog} />
        )}

        {activeTab === 'user' && (
          <UserTab account={account} addLog={addLog} />
        )}

        {activeTab === 'marketplace' && (
          <MarketplaceTab account={account} provider={provider} signer={signer} addLog={addLog} />
        )}
      </div>

      {/* LOGS */}
      <div style={{ marginTop: '40px', padding: '10px', background: '#f8f9fa', height: '200px', overflowY: 'scroll', borderTop: '1px solid #ddd' }}>
        <h4 style={{ marginTop: 0 }}>System Logs</h4>
        {logs.map((log, i) => <div key={i} style={{ fontFamily: 'monospace', fontSize: '0.9em' }}>{log}</div>)}
      </div>
    </div>
  );
}

export default App;
