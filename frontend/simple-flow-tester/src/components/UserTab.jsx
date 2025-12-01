import React, { useState, useEffect } from 'react';
import { getEvents, getTicketTemplates, mintTicket, getMyTickets } from '../api';

const UserTab = ({ account, addLog }) => {
    const [events, setEvents] = useState([]);
    const [myTickets, setMyTickets] = useState([]);
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [templates, setTemplates] = useState([]);

    useEffect(() => {
        fetchEvents();
        if (account) fetchMyTickets();
    }, [account]);

    const fetchEvents = async () => {
        try {
            const res = await getEvents();
            setEvents(res.data || []);
        } catch (err) {
            console.error(err);
        }
    };

    const fetchMyTickets = async () => {
        try {
            const res = await getMyTickets(account);
            setMyTickets(res.data || []);
        } catch (err) {
            console.error(err);
        }
    };

    const handleEventClick = async (event) => {
        setSelectedEvent(event);
        try {
            const res = await getTicketTemplates(event.id);
            setTemplates(res.data || []);
        } catch (err) {
            console.error(err);
        }
    };

    const handleMint = async (templateId) => {
        if (!account) return addLog("Connect wallet first!");
        try {
            addLog(`Minting ticket for ${selectedEvent.title}...`);
            // Note: backend currently picks default template if not provided, 
            // but we should ideally pass templateId if the backend supports it.
            // The current api.js mintTicket only takes eventId and userWallet.
            // We might need to update api.js if we want to support specific templates.
            // For now, we'll assume the backend handles it or we update api.js later.
            const res = await mintTicket(selectedEvent.id, account);
            addLog(`Mint Success! Tx: ${res.data.transactionHash}`);
            setTimeout(fetchMyTickets, 5000); // Refresh tickets after a delay
        } catch (err) {
            addLog(`Mint Error: ${err.response?.data?.error || err.message}`);
        }
    };

    return (
        <div style={{ display: 'flex', gap: '20px' }}>
            {/* LEFT: Event Explorer */}
            <div style={{ flex: 1, borderRight: '1px solid #ccc', paddingRight: '20px' }}>
                <h3>Explore Events</h3>
                <div style={{ display: 'grid', gap: '10px' }}>
                    {events.map(ev => (
                        <div
                            key={ev.id}
                            onClick={() => handleEventClick(ev)}
                            style={{
                                border: selectedEvent?.id === ev.id ? '2px solid #007bff' : '1px solid #ddd',
                                padding: '10px',
                                cursor: 'pointer',
                                borderRadius: '5px'
                            }}
                        >
                            <div style={{ fontWeight: 'bold' }}>{ev.title}</div>
                            <div style={{ fontSize: '0.8em', color: '#666' }}>{new Date(ev.start_date).toLocaleDateString()}</div>
                        </div>
                    ))}
                </div>
            </div>

            {/* MIDDLE: Selected Event Details */}
            <div style={{ flex: 1, padding: '0 10px' }}>
                {selectedEvent ? (
                    <div>
                        <h3>{selectedEvent.title}</h3>
                        <p>{selectedEvent.description}</p>
                        <p><strong>Location:</strong> {selectedEvent.location}</p>
                        <h4>Ticket Types</h4>
                        {templates.length === 0 ? <p>No tickets available.</p> : (
                            <div style={{ display: 'grid', gap: '10px' }}>
                                {templates.map(t => (
                                    <div key={t.id} style={{ border: '1px solid #eee', padding: '10px', borderRadius: '5px' }}>
                                        <div style={{ fontWeight: 'bold' }}>{t.name}</div>
                                        <div>Price: {t.price_token} TKT</div>
                                        <div>Supply: {t.sold} / {t.supply}</div>
                                        <button onClick={() => handleMint(t.id)} style={{ marginTop: '5px', width: '100%' }}>
                                            Mint Ticket
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                ) : (
                    <p style={{ color: '#999' }}>Select an event to view details</p>
                )}
            </div>

            {/* RIGHT: My Tickets */}
            <div style={{ flex: 1, borderLeft: '1px solid #ccc', paddingLeft: '20px' }}>
                <h3>My Tickets</h3>
                {myTickets.length === 0 ? <p>No tickets found.</p> : (
                    <div style={{ display: 'grid', gap: '10px' }}>
                        {myTickets.map(t => (
                            <div key={t.id} style={{ border: '1px solid #eee', padding: '10px', borderRadius: '5px', background: '#f9f9f9' }}>
                                <div style={{ fontWeight: 'bold' }}>{t.ticket_name}</div>
                                <div style={{ fontSize: '0.9em' }}>{t.event_title}</div>
                                <div style={{ fontSize: '0.8em', fontFamily: 'monospace' }}>Token ID: {t.token_id}</div>
                                <div style={{ fontSize: '0.8em', color: t.is_checked_in ? 'green' : 'red' }}>
                                    {t.is_checked_in ? 'Checked In' : 'Not Checked In'}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default UserTab;
