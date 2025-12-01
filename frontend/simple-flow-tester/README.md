# Simple NFT Ticket Tester

This is a lightweight React application to test the NFT Ticketing System workflow.

## Setup

1.  **Install Dependencies**:
    ```bash
    npm install
    ```

2.  **Environment Variables**:
    Ensure you have a `.env` file with the following (already created for you):
    - `VITE_SUPABASE_URL`
    - `VITE_SUPABASE_ANON_KEY`
    - `VITE_TICKET_NFT_ADDRESS`
    - `VITE_MARKETPLACE_ADDRESS`
    - `VITE_SYSTEM_TOKEN_ADDRESS`

## Running

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

## Features

1.  **Connect Wallet**: Connect your Metamask wallet.
2.  **Authenticate**: Sign a message to get a JWT for API calls.
3.  **Approve Tokens**: Approve the Marketplace to spend your System Tokens and NFTs.
4.  **Create Event**: Create a test event via the Backend API.
5.  **Mint Ticket**: Mint a ticket for an event (via API).
6.  **Trade**: List and Buy tickets on the Marketplace (via Smart Contract).

## Local Network Setup (Free Gas)

To avoid using real testnet ETH, you can run a local blockchain:

1.  **Start Local Node**:
    Open a new terminal in `nft-ticket` root and run:
    ```bash
    cd contracts
    npx hardhat node
    ```
    Keep this terminal running!

2.  **Deploy Contracts**:
    In another terminal:
    ```bash
    cd contracts
    npx hardhat run scripts/deploy.ts --network localhost
    ```

3.  **Import Account**:
    - Copy one of the "Account" private keys printed by `npx hardhat node`.
    - Import it into Metamask.
    - Switch Metamask network to `Localhost 8545`.

4.  **Update Config**:
    The deployment script should output new addresses. Update your `.env` files with these addresses and set `RPC_URL=http://127.0.0.1:8545`.

