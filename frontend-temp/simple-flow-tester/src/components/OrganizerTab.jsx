import React, { useState, useEffect } from 'react';
import { createEvent, createTicketTemplate, getEvents, checkIn } from '../api';

const OrganizerTab = ({ account, jwt, addLog }) => {
    const [activeSection, setActiveSection] = useState('createEvent');
    const [events, setEvents] = useState([]);

    // Create Event State
    const [eventForm, setEventForm] = useState({
        title: '',
        description: '',
        start_date: '',
        end_date: '',
        location: '',
        venue_name: '',
        category: 'Music',
        total_supply: 100,
        royalty_fee: 500, // 5%
        banner_url: 'https://via.placeholder.com/800x400',
        thumbnail_url: 'https://via.placeholder.com/200x200'
    });

    // Create Template State
    const [templateForm, setTemplateForm] = useState({
        event_id: '',
        name: 'General Admission',
        description: 'Standard entry ticket',
        price_token: '10',
        supply: '100',
        tier: '1',
        royalty_fee: '0',
        benefits: '["Entry"]',
        is_soulbound: false
    });

    // Check-in State
    const [checkInTicketId, setCheckInTicketId] = useState('');

    useEffect(() => {
        fetchEvents();
    }, []);

    const fetchEvents = async () => {
        try {
            const res = await getEvents();
            setEvents(res.data || []);
        } catch (err) {
            console.error(err);
        }
    };

    const handleCreateEvent = async () => {
        if (!jwt) return addLog("Please authenticate first!");
        try {
            addLog("Creating event...");
            const res = await createEvent(eventForm, jwt);
            addLog(`Event Created! ID: ${res.data.id}`);
            fetchEvents();
        } catch (err) {
            addLog(`Error: ${err.message}`);
        }
    };

    const handleCreateTemplate = async () => {
        try {
            addLog("Creating template...");
            // Parse benefits JSON
            let parsedBenefits = [];
            try {
                parsedBenefits = JSON.parse(templateForm.benefits);
            } catch (e) {
                console.warn("Invalid JSON for benefits");
            }

            const payload = {
                ...templateForm,
                benefits: parsedBenefits
            };

            const res = await createTicketTemplate(payload);
            addLog(`Template Created! ID: ${res.data.id}`);
        } catch (err) {
            addLog(`Error: ${err.message}`);
        }
    };

    const handleCheckIn = async () => {
        try {
            addLog(`Checking in Ticket ${checkInTicketId}...`);
            // Hardcoded organizer ID for test, ideally comes from auth
            const organizerId = '11111111-1111-1111-1111-111111111111';
            const res = await checkIn(checkInTicketId, organizerId);
            addLog(`Check-in Success! ${JSON.stringify(res.data)}`);
        } catch (err) {
            addLog(`Check-in Error: ${err.response?.data?.error || err.message}`);
        }
    };

    return (
        <div style={{ padding: '10px' }}>
            <div style={{ marginBottom: '15px' }}>
                <button onClick={() => setActiveSection('createEvent')} style={{ marginRight: '10px' }}>Create Event</button>
                <button onClick={() => setActiveSection('createTemplate')} style={{ marginRight: '10px' }}>Add Ticket Type</button>
                <button onClick={() => setActiveSection('checkIn')}>Check-in Terminal</button>
            </div>

            {activeSection === 'createEvent' && (
                <div style={{ border: '1px solid #ccc', padding: '15px' }}>
                    <h3>Create New Event</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                        <input placeholder="Event Title" value={eventForm.title} onChange={e => setEventForm({ ...eventForm, title: e.target.value })} style={{ width: '100%' }} />
                        <select value={eventForm.category} onChange={e => setEventForm({ ...eventForm, category: e.target.value })} style={{ width: '100%' }}>
                            <option value="Music">Music</option>
                            <option value="Sports">Sports</option>
                            <option value="Conference">Conference</option>
                            <option value="Art">Art</option>
                        </select>

                        <div style={{ gridColumn: 'span 2' }}>
                            <textarea placeholder="Description" value={eventForm.description} onChange={e => setEventForm({ ...eventForm, description: e.target.value })} style={{ width: '100%', height: '60px' }} />
                        </div>

                        <label>Start Date: <input type="datetime-local" value={eventForm.start_date} onChange={e => setEventForm({ ...eventForm, start_date: e.target.value })} style={{ width: '100%' }} /></label>
                        <label>End Date: <input type="datetime-local" value={eventForm.end_date} onChange={e => setEventForm({ ...eventForm, end_date: e.target.value })} style={{ width: '100%' }} /></label>

                        <input placeholder="Location (City/Region)" value={eventForm.location} onChange={e => setEventForm({ ...eventForm, location: e.target.value })} style={{ width: '100%' }} />
                        <input placeholder="Venue Name" value={eventForm.venue_name} onChange={e => setEventForm({ ...eventForm, venue_name: e.target.value })} style={{ width: '100%' }} />

                        <input placeholder="Banner URL" value={eventForm.banner_url} onChange={e => setEventForm({ ...eventForm, banner_url: e.target.value })} style={{ width: '100%' }} />
                        <input placeholder="Thumbnail URL" value={eventForm.thumbnail_url} onChange={e => setEventForm({ ...eventForm, thumbnail_url: e.target.value })} style={{ width: '100%' }} />

                        <label>Total Supply: <input type="number" value={eventForm.total_supply} onChange={e => setEventForm({ ...eventForm, total_supply: e.target.value })} style={{ width: '100%' }} /></label>
                        <label>Royalty (bps): <input type="number" value={eventForm.royalty_fee} onChange={e => setEventForm({ ...eventForm, royalty_fee: e.target.value })} style={{ width: '100%' }} /></label>
                    </div>
                    <button onClick={handleCreateEvent} style={{ marginTop: '15px', padding: '10px 20px', background: '#007bff', color: 'white', border: 'none', cursor: 'pointer' }}>Create Event</button>
                </div>
            )}

            {activeSection === 'createTemplate' && (
                <div style={{ border: '1px solid #ccc', padding: '15px' }}>
                    <h3>Add Ticket Type (Template)</h3>
                    <div style={{ display: 'grid', gap: '10px' }}>
                        <select value={templateForm.event_id} onChange={e => setTemplateForm({ ...templateForm, event_id: e.target.value })} style={{ width: '100%' }}>
                            <option value="">Select Event</option>
                            {events.map(ev => <option key={ev.id} value={ev.id}>{ev.title}</option>)}
                        </select>

                        <input placeholder="Name (e.g. VIP)" value={templateForm.name} onChange={e => setTemplateForm({ ...templateForm, name: e.target.value })} />
                        <textarea placeholder="Description" value={templateForm.description} onChange={e => setTemplateForm({ ...templateForm, description: e.target.value })} />

                        <div style={{ display: 'flex', gap: '10px' }}>
                            <input placeholder="Price (TKT)" value={templateForm.price_token} onChange={e => setTemplateForm({ ...templateForm, price_token: e.target.value })} style={{ flex: 1 }} />
                            <input placeholder="Supply" value={templateForm.supply} onChange={e => setTemplateForm({ ...templateForm, supply: e.target.value })} style={{ flex: 1 }} />
                        </div>

                        <div style={{ display: 'flex', gap: '10px' }}>
                            <input placeholder="Tier (1=Reg, 2=VIP)" value={templateForm.tier} onChange={e => setTemplateForm({ ...templateForm, tier: e.target.value })} style={{ flex: 1 }} />
                            <input placeholder="Royalty (bps)" value={templateForm.royalty_fee} onChange={e => setTemplateForm({ ...templateForm, royalty_fee: e.target.value })} style={{ flex: 1 }} />
                        </div>

                        <input placeholder='Benefits (JSON array e.g. ["Drink", "Meetup"])' value={templateForm.benefits} onChange={e => setTemplateForm({ ...templateForm, benefits: e.target.value })} />

                        <label>
                            <input type="checkbox" checked={templateForm.is_soulbound} onChange={e => setTemplateForm({ ...templateForm, is_soulbound: e.target.checked })} /> Soulbound (Non-transferable)?
                        </label>
                    </div>
                    <button onClick={handleCreateTemplate} style={{ marginTop: '15px', padding: '10px 20px', background: '#28a745', color: 'white', border: 'none', cursor: 'pointer' }}>Create Template</button>
                </div>
            )}

            {activeSection === 'checkIn' && (
                <div style={{ border: '1px solid #ccc', padding: '15px' }}>
                    <h3>Check-in Terminal</h3>
                    <input placeholder="Ticket UUID" value={checkInTicketId} onChange={e => setCheckInTicketId(e.target.value)} style={{ display: 'block', marginBottom: '5px', width: '100%' }} />
                    <button onClick={handleCheckIn} style={{ marginTop: '10px' }}>Scan / Check-in</button>
                </div>
            )}
        </div>
    );
};

export default OrganizerTab;
