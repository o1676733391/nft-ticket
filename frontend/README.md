# NFT Ticket Frontend - Multi-platform

Monorepo cho NFT Ticketing System với Web và Mobile App.

## Cấu trúc

```
frontend/
├── packages/
│   ├── web/      # Next.js web application
│   ├── mobile/   # React Native (Expo) mobile app
│   └── shared/   # Shared code (types, hooks, utils)
```

## Cài đặt

```bash
# Install dependencies
npm install

# hoặc
yarn install
```

## Development

```bash
# Run all packages
npm run dev

# Run web only
npm run dev:web

# Run mobile only
npm run dev:mobile
```

## Build

```bash
# Build all packages
npm run build

# Build web only
npm run build:web

# Build mobile only
npm run build:mobile
```

## Tech Stack

- **Web**: Next.js 14, React, TailwindCSS, shadcn/ui
- **Mobile**: React Native, Expo Router
- **Shared**: TypeScript, Wagmi, Viem, Supabase
- **Monorepo**: Turborepo, npm workspaces
