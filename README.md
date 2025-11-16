# 🎫 NFT Ticketing System

Hệ thống bán vé NFT trên blockchain với marketplace, check-in, và quản lý sự kiện đầy đủ.

## 📋 Tổng quan

NFT Ticketing System là một nền tảng bán vé sự kiện phi tập trung, sử dụng NFT trên blockchain để đảm bảo tính xác thực, minh bạch và khả năng giao dịch thứ cấp công bằng.

### ✨ Tính năng chính

- 🎟️ **Vé NFT**: Mỗi vé là một NFT duy nhất, chống giả mạo
- 🏪 **Marketplace**: Mua bán vé thứ cấp với royalty tự động
- ✅ **Check-in QR**: Quét QR code để check-in tại sự kiện
- 👥 **Quản lý Actor**: Guest, User, Organizer, Staff
- 🔐 **Web3 Auth**: Đăng nhập bằng ví crypto (SIWE)
- 💰 **Token riêng**: Sử dụng token của hệ thống để thanh toán
- 🚫 **Soulbound**: Tùy chọn khóa chuyển nhượng (chống đầu cơ)
- 📊 **Analytics**: Theo dõi doanh số và thống kê real-time

## 🏗️ Kiến trúc hệ thống

```
┌─────────────────┐
│   Frontend      │  Next.js + Wagmi + Viem + RainbowKit
│   (React)       │
└────────┬────────┘
         │
         ├──────────────┬──────────────┐
         │              │              │
         ▼              ▼              ▼
┌────────────────┐ ┌──────────┐ ┌──────────────┐
│   Supabase     │ │ Web3 RPC │ │   Storage    │
│   Backend      │ │  (Viem)  │ │  (Supabase)  │
└────────┬───────┘ └────┬─────┘ └──────────────┘
         │              │
         │              ▼
         │      ┌───────────────┐
         │      │ Smart         │
         │      │ Contracts     │
         │      │ (Solidity)    │
         │      └───────┬───────┘
         │              │
         ▼              ▼
    ┌────────────────────────┐
    │   Indexer Service      │
    │   (Event Listener)     │
    └────────────────────────┘
```

## 📦 Cấu trúc Project

```
nft-ticket/
├── contracts/              # Smart contracts (Hardhat)
│   ├── contracts/
│   │   ├── TicketNFT.sol
│   │   ├── Marketplace.sol
│   │   └── SystemToken.sol
│   ├── scripts/
│   │   └── deploy.ts
│   └── hardhat.config.ts
│
├── backend/
│   ├── supabase/
│   │   ├── migrations/     # Database schema
│   │   └── functions/      # Edge Functions (API)
│   └── indexer/            # Blockchain event indexer
│       └── src/
│           └── index.ts
│
└── frontend/               # Next.js app
    ├── src/
    │   ├── app/            # Pages (App Router)
    │   ├── components/     # React components
    │   ├── lib/            # Utilities
    │   └── config/         # Configurations
    └── public/
```

## 🚀 Bắt đầu

### Prerequisites

- Node.js 18+
- npm/yarn
- Git
- MetaMask hoặc ví Web3 khác
- Supabase account (free tier)
- Alchemy/Infura API key (cho RPC)

### 1️⃣ Clone Repository

```bash
git clone https://github.com/yourusername/nft-ticket.git
cd nft-ticket
```

### 2️⃣ Setup Smart Contracts

```bash
cd contracts
npm install
cp .env.example .env
# Điền thông tin vào .env

# Deploy contracts
npm run deploy:testnet
```

**Lưu địa chỉ contracts sau khi deploy!**

### 3️⃣ Setup Supabase

1. Tạo project mới tại [supabase.com](https://supabase.com)
2. Chạy migrations:

```bash
cd backend/supabase/migrations
# Copy nội dung các file .sql và chạy trong Supabase SQL Editor
```

3. Deploy Edge Functions:

```bash
# Cài Supabase CLI
npm install -g supabase

# Login
supabase login

# Deploy functions
supabase functions deploy auth-verify
supabase functions deploy event-manager
supabase functions deploy ticket-manager
supabase functions deploy marketplace
supabase functions deploy checkin
```

### 4️⃣ Setup Indexer

```bash
cd backend/indexer
npm install
cp .env.example .env
# Điền contract addresses và Supabase keys

# Run indexer
npm run dev
```

### 5️⃣ Setup Frontend

```bash
cd frontend
npm install
cp .env.example .env.local
# Điền Supabase URL, contract addresses, etc.

# Run development server
npm run dev
```

Mở [http://localhost:3000](http://localhost:3000)

## 🔑 Environment Variables

### Contracts (.env)

```env
PRIVATE_KEY=your_wallet_private_key
POLYGON_MUMBAI_RPC=https://rpc-mumbai.maticvigil.com
POLYGONSCAN_API_KEY=your_api_key
```

### Frontend (.env.local)

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
NEXT_PUBLIC_TICKET_NFT_ADDRESS=0x...
NEXT_PUBLIC_MARKETPLACE_ADDRESS=0x...
NEXT_PUBLIC_SYSTEM_TOKEN_ADDRESS=0x...
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id
```

### Indexer (.env)

```env
RPC_URL=https://rpc.sepolia.org
TICKET_NFT_ADDRESS=0x...
MARKETPLACE_ADDRESS=0x...
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

## 👥 User Roles & Permissions

### 🌐 Guest
- Xem danh sách sự kiện
- Xem chi tiết sự kiện
- Xem giá vé

### 🎫 User (Ticket Holder)
- Mua vé từ organizer
- Nhận vé transfer
- Xem vé sở hữu
- Đăng bán vé trên marketplace
- Check-in tại sự kiện

### 🏢 Organizer
- Tạo & quản lý sự kiện
- Tạo loại vé (VIP, Regular...)
- Mint vé lên blockchain
- Thiết lập royalty
- Theo dõi doanh số
- Quản lý check-in

### 🎯 Staff/Scanner
- Quét QR code
- Xác nhận check-in
- Xem lịch sử check-in

## 📊 Database Schema

### Core Tables

- **users**: Thông tin user (wallet, email, username)
- **events**: Sự kiện (title, date, location, organizer)
- **ticket_templates**: Loại vé (VIP, Regular, price, supply)
- **tickets**: NFT tickets (token_id, owner, status, QR)
- **marketplace_listings**: Listings (price, seller, status)
- **checkin_logs**: Check-in history

## 🔗 Smart Contracts

### TicketNFT (ERC721)

```solidity
function mintTicket(address to, uint256 eventId, uint256 templateId, string uri, bool isSoulbound)
function checkIn(uint256 tokenId)
function setTransferLock(uint256 tokenId, bool locked)
```

### Marketplace

```solidity
function list(uint256 tokenId, uint256 price)
function unlist(uint256 tokenId)
function buy(uint256 tokenId)
```

### SystemToken (ERC20)

```solidity
function mint(address to, uint256 amount)
function faucet(uint256 amount) // Testnet only
```

## 🧪 Testing

### Smart Contracts

```bash
cd contracts
npx hardhat test
```

### Frontend

```bash
cd frontend
npm run test
```

## 🚢 Deployment

### Production Checklist

- [ ] Deploy contracts to mainnet
- [ ] Verify contracts on Etherscan
- [ ] Setup production Supabase
- [ ] Configure RLS policies
- [ ] Deploy Edge Functions
- [ ] Setup domain & SSL
- [ ] Configure CORS
- [ ] Test all flows end-to-end
- [ ] Setup monitoring (Sentry, etc.)

### Deploy Frontend (Vercel)

```bash
cd frontend
vercel --prod
```

### Deploy Indexer (Railway/Render)

```bash
cd backend/indexer
# Push to GitHub, connect to Railway/Render
```

## 📖 API Documentation

### Supabase Edge Functions

#### POST /auth-verify
Xác thực Web3 signature

```json
{
  "message": "Sign-in message",
  "signature": "0x...",
  "address": "0x..."
}
```

#### POST /event-manager
Quản lý events

```json
{
  "action": "create | list | get | update",
  "title": "Event Name",
  "startDate": "2024-01-01T00:00:00Z",
  ...
}
```

#### POST /ticket-manager
Quản lý tickets

```json
{
  "action": "mint | getByOwner | transfer",
  "tokenId": 123,
  "ownerWallet": "0x...",
  ...
}
```

## 🛡️ Security

- ✅ Web3 authentication (SIWE)
- ✅ Row Level Security (RLS) trong Supabase
- ✅ Smart contract audited logic
- ✅ QR code với hash validation
- ✅ Rate limiting trên Edge Functions
- ✅ Input validation
- ⚠️ **Lưu ý**: Đây là testnet, không sử dụng real funds

## 🐛 Troubleshooting

### Lỗi kết nối ví

```bash
# Clear cache
rm -rf .next
npm run dev
```

### Lỗi transaction failed

- Kiểm tra gas fee
- Đảm bảo có đủ testnet tokens (faucet)
- Check contract addresses

### Indexer không sync

- Kiểm tra RPC URL
- Xem logs: `docker logs -f indexer`
- Reset last_block trong DB

## 🤝 Contributing

Contributions are welcome! Please:

1. Fork the repo
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## 📝 License

MIT License - xem [LICENSE](LICENSE) để biết thêm chi tiết.

## 📞 Contact & Support

- GitHub Issues: [Create Issue](https://github.com/yourusername/nft-ticket/issues)
- Email: your.email@example.com
- Discord: [Join Server](https://discord.gg/yourserver)

## 🙏 Acknowledgments

- [OpenZeppelin](https://openzeppelin.com/) - Smart contract libraries
- [Supabase](https://supabase.com/) - Backend & Database
- [Wagmi](https://wagmi.sh/) - React hooks for Ethereum
- [Viem](https://viem.sh/) - TypeScript Ethereum library
- [Next.js](https://nextjs.org/) - React framework

---

Made with ❤️ by [Your Name]

**⚠️ Disclaimer**: Dự án này chỉ mục đích học tập. Sử dụng trên testnet.
