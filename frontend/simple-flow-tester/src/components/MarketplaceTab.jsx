import React, { useState, useEffect } from 'react';
import { getMarketplaceListings, getMyTickets } from '../api';
import { ethers } from 'ethers';
import { MarketplaceABI } from '../abis'; // We need to export this from abis.js

// Assuming CONTRACTS are passed or imported
const MARKETPLACE_ADDRESS = import.meta.env.VITE_MARKETPLACE_ADDRESS;
const SYSTEM_TOKEN_ADDRESS = import.meta.env.VITE_SYSTEM_TOKEN_ADDRESS;

const MarketplaceTab = ({ account, provider, signer, addLog }) => {
    const [listings, setListings] = useState([]);
    const [myTickets, setMyTickets] = useState([]);
    const [sellForm, setSellForm] = useState({ ticketId: '', price: '' });

    useEffect(() => {
        fetchListings();
        if (account) fetchMyTickets();
    }, [account]);

    const fetchListings = async () => {
        try {
            const res = await getMarketplaceListings();
            setListings(res.data || []);
        } catch (err) {
            console.error(err);
        }
    };

    const fetchMyTickets = async () => {
        try {
            const res = await getMyTickets(account);
            // Filter tickets that are NOT listed (status = 'minted' or 'transferred')
            setMyTickets((res.data || []).filter(t => t.status === 'minted' || t.status === 'transferred'));
        } catch (err) {
            console.error(err);
        }
    };

    const handleBuy = async (listing) => {
        if (!signer) return addLog("Connect wallet first!");
        try {
            addLog(`Buying Token ${listing.token_id} for ${listing.price_token} TKT...`);

            // 1. Approve Token Spend (if needed)
            // Ideally we check allowance first, but for simplicity we just approve or assume approved
            // const tokenContract = new ethers.Contract(SYSTEM_TOKEN_ADDRESS, ['function approve(address,uint256)'], signer);
            // await (await tokenContract.approve(MARKETPLACE_ADDRESS, ethers.parseEther(listing.price_token.toString()))).wait();

            // 2. Call Buy on Contract
            const marketplace = new ethers.Contract(MARKETPLACE_ADDRESS, MarketplaceABI, signer);
            const tx = await marketplace.buy(listing.token_id);
            addLog(`Transaction Sent: ${tx.hash}`);
            await tx.wait();
            addLog("Purchase Successful!");
            fetchListings();
            fetchMyTickets();
        } catch (err) {
            addLog(`Buy Error: ${err.message}`);
        }
    };

    const handleList = async (ticket) => {
        const price = prompt(`Enter price in TKT for ${ticket.ticket_name} (Token ID: ${ticket.token_id})`);
        if (!price) return;

        try {
            addLog(`Listing Token ${ticket.token_id} for ${price} TKT...`);
            const marketplace = new ethers.Contract(MARKETPLACE_ADDRESS, MarketplaceABI, signer);
            const tx = await marketplace.list(ticket.token_id, ethers.parseEther(price));
            addLog(`Transaction Sent: ${tx.hash}`);
            await tx.wait();
            addLog("Listing Successful!");
            fetchListings();
            fetchMyTickets();
        } catch (err) {
            addLog(`Listing Error: ${err.message}`);
        }
    };

    return (
        <div style={{ display: 'flex', gap: '20px' }}>
            {/* LEFT: Active Listings */}
            <div style={{ flex: 2 }}>
                <h3>Marketplace Listings</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '15px' }}>
                    {listings.map(l => (
                        <div key={l.id} style={{ border: '1px solid #ccc', padding: '15px', borderRadius: '5px' }}>
                            <div style={{ fontWeight: 'bold' }}>{l.ticket_name}</div>
                            <div style={{ fontSize: '0.9em' }}>{l.event_title}</div>
                            <div style={{ margin: '10px 0', fontSize: '1.2em', color: 'green' }}>{l.price_token} TKT</div>
                            <div style={{ fontSize: '0.8em', color: '#666' }}>Seller: {l.seller_wallet.slice(0, 6)}...</div>
                            <button onClick={() => handleBuy(l)} style={{ width: '100%', marginTop: '10px', background: '#28a745', color: 'white', border: 'none', padding: '8px', cursor: 'pointer' }}>
                                Buy Now
                            </button>
                        </div>
                    ))}
                    {listings.length === 0 && <p>No items for sale.</p>}
                </div>
            </div>

            {/* RIGHT: Sell My Tickets */}
            <div style={{ flex: 1, borderLeft: '1px solid #ccc', paddingLeft: '20px' }}>
                <h3>Sell Your Tickets</h3>
                <div style={{ display: 'grid', gap: '10px' }}>
                    {myTickets.map(t => (
                        <div key={t.id} style={{ border: '1px solid #eee', padding: '10px', borderRadius: '5px' }}>
                            <div style={{ fontWeight: 'bold' }}>{t.ticket_name}</div>
                            <div style={{ fontSize: '0.8em' }}>{t.event_title}</div>
                            <button onClick={() => handleList(t)} style={{ width: '100%', marginTop: '5px' }}>
                                List for Sale
                            </button>
                        </div>
                    ))}
                    {myTickets.length === 0 && <p>You have no tickets to sell.</p>}
                </div>
            </div>
        </div>
    );
};

export default MarketplaceTab;
