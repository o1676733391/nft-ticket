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
 # NFT Ticket (nft-ticket)

 Phiên bản README được tái tạo lại. Nội dung dưới đây hướng dẫn chi tiết cách thiết lập môi trường (env), triển khai và chạy dự án gồm contracts (Hardhat), backend (indexer, supabase functions) và frontend (web & mobile).

 ## Mục lục
 - Tổng quan
 - Yêu cầu (prerequisites)
 - Biến môi trường (tổng hợp theo từng phần)
 - Thiết lập Supabase (migrations, secrets)
 - Triển khai smart contracts (Hardhat)
 - Backend: indexer & supabase functions
 - Frontend (web & mobile)
 - Chạy thử / Test
 - Gỡ lỗi thường gặp

 ---

 ## Tổng quan
 Repo này chứa 3 phần chính:
 - `contracts/` – Hardhat + smart contracts (TicketNFT, Marketplace, SystemToken) + scripts
 - `backend/` – indexer (node/ts) và `supabase/functions` (edge functions) để xử lý sự kiện và API serverless
 - `frontend/` – Next.js web app và React Native mobile app (monorepo under `frontend/packages`)

 Hãy đọc kỹ các bước dưới đây để thiết lập môi trường local và triển khai lên testnet / production.

 ## Yêu cầu (Prerrequisites)
 - Node.js 18+ và npm/yarn/pnpm (dùng pnpm hoặc npm tuỳ bạn)
 - Git
 - Hardhat (cài trong `contracts` bằng npm install)
 - Supabase CLI (nếu bạn deploy functions hoặc dùng local emulators): https://supabase.com/docs/guides/cli
 - An RPC provider key (Alchemy/Infura) cho mạng testnet (ví dụ Sepolia)
 - Một ví private key (ký hợp đồng khi deploy). LƯU Ý: dùng account testnet, không đưa private key production vào repo.

 Trên Windows (PowerShell), các lệnh khởi tạo ví dụ:

 ```powershell
 # clone
 git clone <repo-url>
 cd nft-ticket
 # root has multiple packages; you can open using your editor
 ```

 ---

 ## Biến môi trường (env) — tổng hợp
 Sau khi quét mã nguồn, repo sử dụng nhiều biến môi trường cho từng phần. Dưới đây là danh sách biến phổ biến và ví dụ `.env` theo ngữ cảnh.

 LƯU Ý: biến bắt đầu bằng `NEXT_PUBLIC_` là biến client-safe (phải public) — những biến không có tiền tố này là secret và chỉ đặt trên server hoặc trong secrets của Supabase.

 ### 1) _Global / Contracts_ (Hardhat / deploy)
 - PRIVATE_KEY: private key ví deployer (testnet)
 - RPC_URL: RPC endpoint (sepolia/other) — có thể dùng Alchemy/Infura URL

 Ví dụ `contracts/.env`:
 ```
 PRIVATE_KEY=0x....
 RPC_URL=https://sepolia.infura.io/v3/YOUR_INFURA_KEY
 ```

 ### 2) Supabase (project + server)
 - SUPABASE_URL: https://xxxxx.supabase.co
 - SUPABASE_ANON_KEY / NEXT_PUBLIC_SUPABASE_ANON_KEY: client anon key
 - SUPABASE_SERVICE_ROLE_KEY: service role key (secret, chỉ dùng trên server)
 - (Optionally) DATABASE_URL if you self-host Postgres

 Bạn có thể set secrets trên Supabase bằng CLI hoặc dashboard. Ví dụ:

 ```bash
 # với supabase CLI
 supabase secrets set SUPABASE_SERVICE_ROLE_KEY=xxx RPC_URL=https://rpc.sepolia.org
 ```

 ### 3) Frontend (web & mobile) — biến public cho client
 - NEXT_PUBLIC_SUPABASE_URL
 - NEXT_PUBLIC_SUPABASE_ANON_KEY
 - NEXT_PUBLIC_TICKET_NFT_ADDRESS
 - NEXT_PUBLIC_MARKETPLACE_ADDRESS
 - NEXT_PUBLIC_SYSTEM_TOKEN_ADDRESS
 - NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID
 - NEXT_PUBLIC_BICONOMY_BUNDLER_URL_BASE / NEXT_PUBLIC_BICONOMY_PAYMASTER_URL_BASE
 - NEXT_PUBLIC_BICONOMY_BUNDLER_URL_BASE_SEPOLIA / NEXT_PUBLIC_BICONOMY_PAYMASTER_URL_BASE_SEPOLIA

 Ví dụ `frontend/.env.local` (web):
 ```
 NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
 NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
 NEXT_PUBLIC_TICKET_NFT_ADDRESS=0x...
 NEXT_PUBLIC_MARKETPLACE_ADDRESS=0x...
 NEXT_PUBLIC_SYSTEM_TOKEN_ADDRESS=0x...
 NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id
 # Biconomy (account abstraction)
 NEXT_PUBLIC_BICONOMY_BUNDLER_URL_BASE=https://bundler.biconomy.io/api/v2/.../YOUR_BUNDLER_KEY
 NEXT_PUBLIC_BICONOMY_PAYMASTER_URL_BASE=https://paymaster.biconomy.io/api/v1/.../YOUR_PAYMASTER_KEY
 ```

 ### 4) Backend / Indexer / Supabase Functions
 - SUPABASE_URL
 - SUPABASE_SERVICE_ROLE_KEY
 - RPC_URL (hoặc PRIVATE_KEY/RPC cho việc gọi chain nếu cần)
 - Các function riêng có thể dùng thêm secrets (ví dụ API keys)

 Ví dụ `backend/indexer/.env`:
 ```
 SUPABASE_URL=https://xxxxx.supabase.co
 SUPABASE_SERVICE_ROLE_KEY=service-role-key
 RPC_URL=https://sepolia.infura.io/v3/YOUR_INFURA_KEY
 ```

 ---

 ## Thiết lập Supabase (migrations & secrets)
 1. Tạo project trên Supabase, lấy `SUPABASE_URL` và `SERVICE_ROLE_KEY`.
 2. Chạy migrations (tập lệnh SQL có sẵn `backend/supabase/migrations`):

 ```bash
 # sử dụng supabase CLI từ thư mục root
 supabase db remote set <CONNECTION_STRING>  # nếu dùng remote DB
 # hoặc deploy migrations nếu repo có script
 # nếu không, mở SQL file và chạy trong SQL editor của Supabase
 ```

 3. Thiết lập secrets (ví dụ RPC_URL, SUPABASE_SERVICE_ROLE_KEY)

 ```bash
 supabase secrets set SUPABASE_SERVICE_ROLE_KEY=your_service_key RPC_URL=https://sepolia.infura.io/v3/YOUR_INFURA_KEY
 ```

 ## Triển khai smart contracts (Hardhat)
 1. Vào thư mục `contracts/` và cài dependency:

 ```bash
 cd contracts
 npm install
 ```

 2. Tạo file `.env` hoặc export biến môi trường như ở phần `Contracts` phía trên.
 3. Chạy deploy (ví dụ mạng sepolia — kiểm tra script `scripts/deploy.ts`):

 ```bash
 # ví dụ
 npx hardhat run scripts/deploy.ts --network sepolia
 ```

 Sau khi deploy, copy địa chỉ hợp đồng (TicketNFT, Marketplace, SystemToken) vào biến `NEXT_PUBLIC_*` cho frontend.

 ## Backend: indexer & Supabase functions
 - Indexer
   1. Vào `backend/indexer`.
   2. Cài đặt và chạy:

 ```bash
 cd backend/indexer
 npm install
 npm run build   # nếu có
 npm run start   # hoặc npm run dev
 ```

 Indexer sẽ lắng nghe sự kiện từ chain (RPC_URL) và ghi vào Supabase.

 - Supabase functions
   1. Vào `backend/supabase/functions`.
   2. Mỗi function có thể được deploy bằng supabase CLI:

 ```bash
 cd backend/supabase
 # ví dụ deploy function 'checkin'
 supabase functions deploy checkin --project-ref <project-ref>
 ```

 Thiết lập trước các secrets cần thiết trên Supabase (SERVICE_ROLE_KEY, RPC_URL...).

 ## Frontend (web & mobile)
 - Web (Next.js)
   1. Vào `frontend/web`.
   2. Cài đặt và chạy:

 ```bash
 cd frontend/web
 npm install
 # dev
 npm run dev
 # build
 npm run build && npm run start
 ```

 - Mobile (React Native, trong `frontend/packages/mobile`):

 ```bash
 cd frontend/packages/mobile
 npm install
 # chạy app theo hướng dẫn trong package (expo / react-native-cli tuỳ config)
 ```

 Chú ý: đảm bảo `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` và các địa chỉ hợp đồng đã được set trước khi chạy.

 ## Chạy thử / Test
 - Contracts: có thể chạy `npx hardhat test` trong `contracts/`.
 - Backend: kiểm tra indexer logs, hoặc gọi API functions qua `supabase.functions.invoke` hoặc endpoint nếu được deploy.
 - Frontend: mở trình duyệt `http://localhost:3000` (Next default) và test các flow: đăng ký, mua vé, checkin (tuỳ chức năng repository).

 ## Gỡ lỗi thường gặp
 - Lỗi kết nối Supabase: kiểm tra `SUPABASE_URL` và `SERVICE_ROLE_KEY` có chính xác không.
 - RPC errors: kiểm tra `RPC_URL` và giới hạn request (Alchemy/Infura quota).
 - Private key bị từ chối deploy: chắc chắn private key có testnet ETH.
 - Biconomy / AA: nếu muốn bật account-abstraction, cấu hình đúng Biconomy bundler/paymaster URLs trong `NEXT_PUBLIC_BICONOMY_*`.

 ## Tóm tắt các file/đường dẫn quan trọng
 - `contracts/` — smart contracts + `scripts/deploy.ts`
 - `backend/indexer` — indexer service (node/ts)
 - `backend/supabase/functions` — Supabase Edge Functions (checkin, ticket-manager, marketplace,...)
 - `frontend/web` — Next.js app
 - `frontend/packages/mobile` — mobile app

 ---

 Nếu bạn muốn, tôi có thể:
 - Tự động thêm mẫu file `.env.example` cho từng phần (contracts, backend/indexer, frontend)
 - Tạo 1 checklist triển khai (deploy checklist) hoặc script để đẩy secrets vào Supabase bằng `supabase secrets set`

 Hãy cho biết bạn muốn tôi thêm mẫu `.env.example` tự động cho phần nào trước tiên.

 ---
 Những thay đổi đã thực hiện: tái tạo `README.md` ở root chứa hướng dẫn chi tiết triển khai env và lệnh chạy.
