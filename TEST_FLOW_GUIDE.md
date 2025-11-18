# 🎫 NFT TICKETING SYSTEM - COMPLETE TEST FLOW

## 📋 Overview
This guide will walk you through testing the entire NFT Ticketing system from user registration to ticket purchase and check-in.

---

## 🔧 Prerequisites

### 1. Make sure all services are running:
```bash
# Terminal 1: REST API
cd backend/rest-api
npm run dev

# Terminal 2: Indexer
cd backend/indexer
npm run dev
```

### 2. Have MetaMask installed:
- Install MetaMask browser extension
- Switch to Sepolia Testnet
- Get test ETH from faucet: https://sepoliafaucet.com/

### 3. Contract addresses (already deployed on Sepolia):
- TicketNFT: `0x66CAE4d070C2A6b8d469fE3538414c72C4FA41B6`
- Marketplace: `0x47F402Cc8196dBD8A9F7D61dFACC1de84a4e66Bd`
- SystemToken: `0xe09D1b84652FFf494Ad87934A13D39395e0767F3`

---

## 🧪 COMPLETE TEST FLOW

### **STEP 1: Open Test Interface** 🌐

1. Open `backend/rest-api/test-flow-guide.html` in your browser
2. Make sure your REST API is running on `http://localhost:3001`

---

### **STEP 2: Connect MetaMask Wallet** 🦊

1. Click **"Connect MetaMask"** button
2. Approve connection in MetaMask popup
3. Your wallet address will be displayed
4. ✅ Progress: 12.5%

**What happens:**
- JavaScript connects to MetaMask
- Retrieves your wallet address
- Enables the next step button

---

### **STEP 3: Sign Message & Register User** ✍️

1. Click **"Sign & Register"** button
2. MetaMask will popup asking you to sign a message
3. Click **"Sign"** in MetaMask
4. Wait for API response

**What happens:**
- Frontend: Signs message with your private key
- Backend: Verifies signature using `ethers.verifyMessage()`
- Database: Creates/finds user in `users` table
- Returns: JWT token and user information

**Expected Response:**
```json
{
  "message": "Authentication successful.",
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "wallet_address": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb1",
    "email": "550e8400...@temp.wallet"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Save this:** User ID will be auto-saved and used in next steps

✅ Progress: 25%

---

### **STEP 4: Create Event** 🎉

1. Fill in event details:
   - **Title**: "Amazing Concert 2025"
   - **Description**: "The most amazing concert of the year!"
   - **Start Date**: "2025-12-31T20:00:00Z"
   - **End Date**: "2025-12-31T23:59:00Z"
   - **Location**: "Madison Square Garden"
   - **Total Supply**: 1000
   - **Banner URL**: (optional)

2. Click **"Create Event"** button

**What happens:**
- API creates event in `events` table
- Uses your user ID as `organizer_id`
- Sets `is_published = true`
- Returns event with UUID

**Expected Response:**
```json
{
  "id": "74530762-c257-48ce-9411-7508a5df08e1",
  "organizer_id": "550e8400-e29b-41d4-a716-446655440000",
  "title": "Amazing Concert 2025",
  "total_supply": 1000,
  "total_sold": 0,
  "is_published": true,
  "created_at": "2025-11-18T10:30:00Z"
}
```

**Save this:** Event ID will be auto-saved

✅ Progress: 37.5%

---

### **STEP 5: Mint Ticket NFT** 🎫 ⛓️

1. Recipient wallet is auto-filled with your connected wallet
2. Click **"Mint Ticket (On-Chain)"** button
3. Wait ~15-30 seconds for blockchain confirmation

**What happens:**

**Backend (REST API):**
1. Checks if event exists in database ✅
2. Checks if event exists on blockchain
3. If not → Creates event on-chain: `createEvent(eventId, name, royalty)`
4. Mints ticket: `mintTicket(to, eventId, templateId, uri, isSoulbound)`
5. Updates `total_sold` counter in database

**Blockchain:**
- Transaction is sent to Sepolia network
- Smart contract validates MINTER_ROLE
- NFT is minted with tokenId
- `TicketMinted` event is emitted

**Indexer (watches blockchain):**
- Detects `TicketMinted` event
- Creates record in `tickets` table:
  ```sql
  INSERT INTO tickets (token_id, event_id, owner_wallet, status, tx_hash)
  VALUES (0, '74530762...', '0x742d35...', 'minted', '0xabc123...')
  ```
- Logs: `🎫 Ticket Minted: tokenId=0, eventId=1, owner=0x742d35...`

**Expected Response:**
```json
{
  "message": "Mint transaction sent successfully.",
  "transactionHash": "0xabc123def456...",
  "tokenId": "Will be available after indexer processes the transaction"
}
```

**Important:** 
- Token ID starts from 0
- Check indexer terminal for the token ID
- Or check Supabase `tickets` table after ~30 seconds

✅ Progress: 50%

---

### **STEP 6: Check Token ID** 🔍

**Option 1: Indexer Terminal**
Look for log like:
```
🎫 Ticket Minted: tokenId=0, eventId=1, owner=0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb1
```

**Option 2: Supabase Dashboard**
1. Go to Supabase dashboard
2. Open `tickets` table
3. Find newest record
4. Copy `token_id` value (should be `0` for first ticket)

**Option 3: API Query**
```bash
curl http://localhost:3001/api/events/74530762-c257-48ce-9411-7508a5df08e1
```

**Save the token ID** (e.g., `0`) for next steps!

---

### **STEP 7: List Ticket on Marketplace** 🏪 ⛓️

1. Enter **Token ID**: `0` (or the ID you got from previous step)
2. Enter **Price**: `0.1` (ETH)
3. Click **"List on Marketplace"** button

**What happens:**

**Backend:**
- Calls smart contract: `marketplace.listTicket(tokenId, price)`
- Waits for transaction confirmation

**Blockchain:**
- Smart contract approves listing
- Emits `Listed` event

**Indexer:**
- Detects `Listed` event
- Updates `tickets` table: `status = 'listed'`
- Creates record in `marketplace_listings` table:
  ```sql
  INSERT INTO marketplace_listings 
  (ticket_id, token_id, seller_wallet, price_token, status)
  VALUES (...)
  ```

**Expected Response:**
```json
{
  "message": "Ticket listed successfully",
  "transactionHash": "0xdef789..."
}
```

✅ Progress: 62.5%

---

### **STEP 8: Buy Ticket from Marketplace** 💰 ⛓️

1. Enter **Token ID**: `0`
2. Enter **Buyer Address**: (auto-filled or enter different address)
3. Click **"Buy Ticket"** button

**What happens:**

**Backend:**
1. Fetches listing from `marketplace_listings` table
2. Calls smart contract: `marketplace.buyTicket(tokenId, buyer)`
3. Waits for confirmation

**Blockchain:**
- Transfers ownership from seller to buyer
- Transfers payment tokens
- Emits `Sold` event

**Indexer:**
- Detects `Sold` event
- Updates `marketplace_listings`: `status = 'sold', buyer_wallet = ...`
- Updates `tickets`: `owner_wallet = buyer, status = 'sold'`
- Creates transaction record in `transactions` table

**Expected Response:**
```json
{
  "message": "Ticket purchased successfully",
  "transactionHash": "0xghi012..."
}
```

✅ Progress: 75%

---

### **STEP 9: Check-in at Event** ✅ ⛓️

1. Enter **Token ID**: `0`
2. Click **"Check-in"** button

**What happens:**

**Backend:**
- Calls smart contract: `ticketNFT.checkIn(tokenId)`
- Only organizer or admin can check-in

**Blockchain:**
- Sets `isCheckedIn = true` on-chain
- Emits `TicketCheckedIn` event

**Indexer:**
- Detects `TicketCheckedIn` event
- Updates `tickets` table: 
  ```sql
  UPDATE tickets 
  SET is_checked_in = true, checked_in_at = NOW()
  WHERE token_id = 0
  ```
- Creates record in `checkin_logs` table

**Expected Response:**
```json
{
  "message": "Ticket checked in successfully",
  "transactionHash": "0xjkl345..."
}
```

✅ Progress: 87.5%

---

### **STEP 10: View All Events & Tickets** 📊

1. Click **"Get All Events"** button
2. See complete list of events with their tickets

**Expected Response:**
```json
[
  {
    "id": "74530762-c257-48ce-9411-7508a5df08e1",
    "title": "Amazing Concert 2025",
    "total_supply": 1000,
    "total_sold": 1,
    "tickets": [
      {
        "token_id": "0",
        "owner_wallet": "0x...",
        "status": "sold",
        "is_checked_in": true
      }
    ]
  }
]
```

✅ Progress: 100% - **TEST COMPLETE!** 🎉

---

## 📊 Verify Results

### 1. **Check Supabase Dashboard**

**users table:**
```
id | wallet_address | username | created_at
550e8400... | 0x742d35... | null | 2025-11-18...
```

**events table:**
```
id | organizer_id | title | total_supply | total_sold
74530762... | 550e8400... | Amazing Concert 2025 | 1000 | 1
```

**tickets table:**
```
token_id | event_id | owner_wallet | status | is_checked_in
0 | 74530762... | 0x742d35... | sold | true
```

**marketplace_listings table:**
```
token_id | seller_wallet | buyer_wallet | price_token | status
0 | 0x742d35... | 0x742d35... | 0.1 | sold
```

**transactions table:**
```
type | token_id | from_wallet | to_wallet | tx_hash
mint | 0 | 0x0000... | 0x742d35... | 0xabc123...
transfer | 0 | 0x742d35... | 0x742d35... | 0xdef789...
```

**checkin_logs table:**
```
ticket_id | token_id | event_id | timestamp
... | 0 | 74530762... | 2025-11-18...
```

---

### 2. **Check Blockchain (Sepolia Etherscan)**

1. Go to https://sepolia.etherscan.io/
2. Search for your transaction hashes
3. Verify:
   - ✅ Transaction confirmed
   - ✅ Events emitted (TicketMinted, Listed, Sold, TicketCheckedIn)
   - ✅ Gas used
   - ✅ Block number

---

### 3. **Check Indexer Logs**

Terminal should show:
```
🎫 Ticket Minted: tokenId=0, eventId=1, owner=0x742d35...
📝 Listing Created: tokenId=0, seller=0x742d35..., price=100000000000000000
💰 Sale Completed: tokenId=0, buyer=0x742d35..., price=100000000000000000
✅ Ticket Checked In: tokenId=0
```

---

## 🐛 Troubleshooting

### Issue: "Wallet not connected"
**Solution:** Make sure MetaMask is installed and you clicked "Connect MetaMask"

### Issue: "Insufficient funds"
**Solution:** Get test ETH from Sepolia faucet

### Issue: "Event not found when minting"
**Solution:** Make sure you created the event first and copied the correct Event ID

### Issue: "Token ID not found"
**Solution:** Wait 30-60 seconds for indexer to sync the blockchain data

### Issue: "Transaction reverted"
**Solution:** 
- Check you have MINTER_ROLE (admin wallet)
- Verify contract addresses in `.env`
- Check Sepolia network is selected in MetaMask

### Issue: "Indexer not syncing"
**Solution:**
- Check indexer terminal for errors
- Verify RPC_URL in `.env`
- Check contract addresses match deployed contracts

---

## 🎯 Success Criteria

All of these should be TRUE:
- ✅ User created in database
- ✅ Event created with valid UUID
- ✅ Ticket minted on blockchain (tx confirmed)
- ✅ Ticket record in database (indexer synced)
- ✅ Ticket listed on marketplace
- ✅ Ticket purchased (ownership transferred)
- ✅ Ticket checked in
- ✅ All data in Supabase matches blockchain state

---

## 🚀 Next Steps

Once basic flow works, you can test:
1. **Multiple users** - Create second wallet, buy from marketplace
2. **Multiple events** - Create different event types
3. **Soulbound tickets** - Non-transferable tickets
4. **Batch minting** - Mint multiple tickets at once
5. **Role-based access** - Test organizer vs admin permissions

---

## 📚 Architecture Overview

```
Frontend (test-flow-guide.html)
    ↓ MetaMask
    ↓ Sign Message
    ↓ HTTP Request
REST API (Express.js)
    ↓ Verify Signature
    ↓ Database CRUD
Supabase PostgreSQL
    ↑ Read/Write
REST API
    ↓ Smart Contract Call
Blockchain (Sepolia)
    ↓ Emit Events
Indexer (Viem)
    ↓ Listen Events
    ↓ Write to DB
Supabase PostgreSQL
```

---

## 💡 Tips

- Keep indexer terminal visible to see real-time sync logs
- Use browser console (F12) to debug JavaScript errors
- Check Supabase logs for database errors
- Transaction times vary (5-30 seconds on Sepolia)
- Always wait for indexer to sync before checking database

---

**Happy Testing! 🎉**
