# NFT Ticket System - Database Diagram

## Entity Relationship Diagram

```mermaid
erDiagram
    %% ==========================================
    %% BLOCKCHAIN LAYER (NFT/Web3)
    %% ==========================================
    
    users {
        UUID id PK
        VARCHAR wallet_address UK
        VARCHAR username
        VARCHAR email
        TEXT avatar_url
        TEXT bio
        TIMESTAMPTZ created_at
        TIMESTAMPTZ updated_at
    }
    
    events {
        UUID id PK
        UUID organizer_id FK
        VARCHAR title
        TEXT description
        TEXT location
        VARCHAR venue_name
        TEXT banner_url
        TEXT thumbnail_url
        VARCHAR category
        TIMESTAMPTZ start_date
        TIMESTAMPTZ end_date
        BIGINT event_id_onchain UK
        VARCHAR contract_address
        INTEGER royalty_fee
        BOOLEAN is_active
        BOOLEAN is_published
        INTEGER total_supply
        INTEGER total_sold
        JSONB metadata
    }
    
    ticket_templates {
        UUID id PK
        UUID event_id FK
        VARCHAR name
        TEXT description
        NUMERIC price_token
        INTEGER supply
        INTEGER sold
        INTEGER tier
        INTEGER royalty_fee
        JSONB benefits
        TEXT metadata_uri
        BOOLEAN is_soulbound
        BOOLEAN is_active
        TIMESTAMPTZ sale_starts_at
        TIMESTAMPTZ sale_ends_at
    }
    
    tickets {
        UUID id PK
        BIGINT token_id UK
        UUID template_id FK
        UUID event_id FK
        VARCHAR owner_wallet
        VARCHAR original_owner
        ENUM status
        VARCHAR tx_hash
        TEXT metadata_uri
        TEXT qr_code_url
        VARCHAR qr_hash UK
        BOOLEAN is_checked_in
        TIMESTAMPTZ checked_in_at
        UUID checked_in_by FK
        BOOLEAN is_transferable
        TIMESTAMPTZ minted_at
    }
    
    marketplace_listings {
        UUID id PK
        UUID ticket_id FK
        BIGINT token_id
        VARCHAR seller_wallet
        NUMERIC price_token
        ENUM status
        VARCHAR tx_hash
        TIMESTAMPTZ listed_at
        TIMESTAMPTZ sold_at
        TIMESTAMPTZ cancelled_at
        VARCHAR buyer_wallet
    }
    
    checkin_logs {
        UUID id PK
        UUID ticket_id FK
        BIGINT token_id
        UUID event_id FK
        UUID scanned_by FK
        VARCHAR scanned_wallet
        JSONB device_info
        JSONB location_info
        TIMESTAMPTZ timestamp
    }
    
    transactions {
        UUID id PK
        UUID ticket_id FK
        BIGINT token_id
        ENUM type
        VARCHAR from_wallet
        VARCHAR to_wallet
        NUMERIC price_token
        VARCHAR tx_hash UK
        BIGINT block_number
        BIGINT gas_used
        JSONB metadata
        TIMESTAMPTZ timestamp
    }
    
    event_analytics {
        UUID id PK
        UUID event_id FK
        DATE date
        INTEGER tickets_sold
        NUMERIC revenue_token
        INTEGER unique_buyers
        INTEGER checkins_count
        INTEGER secondary_sales
        NUMERIC secondary_revenue
    }
    
    whitelist {
        UUID id PK
        UUID event_id FK
        VARCHAR wallet_address
        INTEGER allocation
        INTEGER used
        JSONB proof_data
    }
    
    %% ==========================================
    %% MOBILE LAYER (Traditional Database)
    %% ==========================================
    
    mobile_users {
        UUID id PK
        VARCHAR email UK
        VARCHAR password_hash
        VARCHAR username
        VARCHAR full_name
        VARCHAR phone
        TEXT avatar_url
        ENUM acc_type
        VARCHAR organization_name
        TEXT organization_description
        TEXT organization_logo
        BOOLEAN is_verified
        BOOLEAN is_organizer_verified
        VARCHAR verification_token
        VARCHAR reset_token
        TIMESTAMPTZ reset_token_expires
        TIMESTAMPTZ last_login_at
    }
    
    mobile_orders {
        UUID id PK
        UUID user_id FK
        UUID event_id FK
        UUID template_id FK
        INTEGER quantity
        NUMERIC unit_price
        NUMERIC total_amount
        NUMERIC discount_amount
        VARCHAR promo_code
        ENUM payment_method
        VARCHAR payment_reference
        ENUM status
        TIMESTAMPTZ confirmed_at
        TIMESTAMPTZ cancelled_at
        TIMESTAMPTZ refunded_at
        TEXT notes
        JSONB metadata
    }
    
    mobile_tickets {
        UUID id PK
        UUID order_id FK
        UUID user_id FK
        UUID event_id FK
        UUID template_id FK
        VARCHAR ticket_code UK
        TEXT qr_data
        ENUM status
        BOOLEAN is_checked_in
        TIMESTAMPTZ checked_in_at
        UUID checked_in_by FK
        UUID original_user_id FK
        TIMESTAMPTZ transferred_at
        UUID transferred_from FK
    }
    
    mobile_checkin_logs {
        UUID id PK
        UUID ticket_id FK
        UUID event_id FK
        UUID scanned_by FK
        JSONB device_info
        JSONB location_info
        VARCHAR scan_result
    }
    
    promo_codes {
        UUID id PK
        VARCHAR code UK
        TEXT description
        VARCHAR discount_type
        NUMERIC discount_value
        INTEGER max_uses
        INTEGER current_uses
        NUMERIC min_order_amount
        NUMERIC max_discount_amount
        UUID event_id FK
        TIMESTAMPTZ starts_at
        TIMESTAMPTZ expires_at
        BOOLEAN is_active
    }
    
    user_favorites {
        UUID id PK
        UUID user_id FK
        UUID event_id FK
    }
    
    notifications {
        UUID id PK
        UUID user_id FK
        ENUM type
        VARCHAR title
        TEXT message
        JSONB data
        BOOLEAN is_read
        TIMESTAMPTZ read_at
    }
    
    %% ==========================================
    %% RELATIONSHIPS - Blockchain Layer
    %% ==========================================
    
    users ||--o{ events : "organizes"
    events ||--o{ ticket_templates : "has"
    events ||--o{ tickets : "contains"
    ticket_templates ||--o{ tickets : "defines"
    tickets ||--o{ marketplace_listings : "listed_in"
    tickets ||--o{ checkin_logs : "checked_in"
    tickets ||--o{ transactions : "involved_in"
    events ||--o{ checkin_logs : "belongs_to"
    events ||--o{ event_analytics : "analytics"
    events ||--o{ whitelist : "has"
    users ||--o{ tickets : "checked_by"
    
    %% ==========================================
    %% RELATIONSHIPS - Mobile Layer
    %% ==========================================
    
    mobile_users ||--o{ mobile_orders : "places"
    mobile_users ||--o{ mobile_tickets : "owns"
    mobile_users ||--o{ user_favorites : "favorites"
    mobile_users ||--o{ notifications : "receives"
    events ||--o{ mobile_orders : "for_event"
    events ||--o{ mobile_tickets : "for_event"
    events ||--o{ user_favorites : "favorited"
    events ||--o| promo_codes : "has_promo"
    ticket_templates ||--o{ mobile_orders : "template"
    ticket_templates ||--o{ mobile_tickets : "template"
    mobile_orders ||--o{ mobile_tickets : "generates"
    mobile_tickets ||--o{ mobile_checkin_logs : "checked"
```

## Smart Contracts Architecture

```mermaid
classDiagram
    class TicketNFT {
        +bytes32 MINTER_ROLE
        +bytes32 ORGANIZER_ROLE
        +mapping tickets
        +mapping events
        +mapping transferLocked
        +createEvent(eventId, name, royaltyFee)
        +mintTicket(to, eventId, templateId, uri, isSoulbound)
        +batchMintTickets(recipients[], ...)
        +checkIn(tokenId)
        +setTransferLock(tokenId, locked)
    }
    
    class Marketplace {
        +IERC721 ticketNFT
        +IERC20 systemToken
        +uint256 platformFee
        +address feeRecipient
        +mapping listings
        +mapping royalties
        +list(tokenId, price)
        +unlist(tokenId)
        +buy(tokenId)
        +setRoyalty(tokenId, recipient, fee)
        +setPlatformFee(fee)
    }
    
    class SystemToken {
        +string name
        +string symbol
        +uint8 decimals
        +mapping balanceOf
        +mapping allowance
        +mint(to, amount)
        +burn(amount)
        +faucet(amount)
        +transfer(to, amount)
        +approve(spender, amount)
    }
    
    class TicketInfo {
        +uint256 eventId
        +uint256 templateId
        +address organizer
        +bool isSoulbound
        +bool isCheckedIn
        +uint256 mintedAt
    }
    
    class EventInfo {
        +string name
        +address organizer
        +uint256 royaltyFee
        +bool isActive
    }
    
    class Listing {
        +uint256 tokenId
        +address seller
        +uint256 price
        +bool isActive
    }
    
    class RoyaltyInfo {
        +address recipient
        +uint256 fee
    }
    
    TicketNFT --> TicketInfo : stores
    TicketNFT --> EventInfo : stores
    Marketplace --> TicketNFT : manages NFTs
    Marketplace --> SystemToken : payment token
    Marketplace --> Listing : stores
    Marketplace --> RoyaltyInfo : stores
```

## System Flow

```mermaid
flowchart TB
    subgraph Frontend["Frontend (React Native)"]
        MobileApp[Mobile App]
        WebApp[Web App]
    end
    
    subgraph Backend["Backend API"]
        RestAPI[REST API]
        Indexer[Blockchain Indexer]
    end
    
    subgraph Database["Supabase Database"]
        subgraph Blockchain["NFT Layer"]
            users[(users)]
            events[(events)]
            tickets[(tickets)]
            marketplace[(marketplace_listings)]
            transactions[(transactions)]
        end
        
        subgraph Mobile["Mobile Layer"]
            mobile_users[(mobile_users)]
            mobile_orders[(mobile_orders)]
            mobile_tickets[(mobile_tickets)]
        end
    end
    
    subgraph Contracts["Smart Contracts"]
        TicketNFT[TicketNFT]
        Marketplace[Marketplace]
        SystemToken[SystemToken]
    end
    
    MobileApp --> RestAPI
    WebApp --> RestAPI
    RestAPI --> Database
    RestAPI --> Contracts
    Indexer --> Contracts
    Indexer --> Database
    Contracts --> TicketNFT
    Contracts --> Marketplace
    Contracts --> SystemToken
```

## Enums Reference

| Enum Name | Values |
|-----------|--------|
| `ticket_status` | minted, listed, sold, checked_in, transferred, burned, cancelled |
| `listing_status` | active, sold, cancelled |
| `transaction_type` | mint, transfer, list, unlist, sale, burn |
| `account_type` | user, organizer, admin |
| `order_status` | pending, confirmed, cancelled, refunded, failed |
| `payment_method` | card, momo, zalopay, vnpay, bank_transfer, free |
| `mobile_ticket_status` | valid, used, cancelled, expired, transferred |
| `notification_type` | order_confirmed, ticket_ready, event_reminder, event_update, promo, system |

## Notes

### Two-Layer Architecture:

1. **Blockchain Layer (NFT)**: 
   - For Web3 users with wallet
   - NFT-based tickets on-chain
   - Decentralized ownership
   - Secondary marketplace with royalties

2. **Mobile Layer (Traditional)**:
   - For mobile users with email/password
   - Database-based tickets
   - Traditional payment methods
   - Simpler UX for mainstream users

### Shared Tables:
- `events` - Used by both layers
- `ticket_templates` - Used by both layers

### Sync Mechanism:
- Indexer syncs blockchain events to database
- Enables hybrid Web2/Web3 experience
