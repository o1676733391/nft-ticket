
--
-- PostgreSQL database dump
--

\restrict IzoTSwKYnsyYZbccupeagMXXlJdrbPTS80CTNusgNfGfqOj0lgfwIdnq28lhRqq

-- Dumped from database version 17.6
-- Dumped by pg_dump version 17.6

-- Started on 2025-12-01 18:49:34

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- TOC entry 76 (class 2615 OID 2200)
-- Name: public; Type: SCHEMA; Schema: -; Owner: pg_database_owner
--

CREATE SCHEMA public;


ALTER SCHEMA public OWNER TO pg_database_owner;

--
-- TOC entry 3943 (class 0 OID 0)
-- Dependencies: 76
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: pg_database_owner
--

COMMENT ON SCHEMA public IS 'standard public schema';


--
-- TOC entry 1201 (class 1247 OID 17576)
-- Name: listing_status; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.listing_status AS ENUM (
    'active',
    'sold',
    'cancelled'
);


ALTER TYPE public.listing_status OWNER TO postgres;

--
-- TOC entry 1195 (class 1247 OID 17522)
-- Name: ticket_status; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.ticket_status AS ENUM (
    'minted',
    'listed',
    'sold',
    'checked_in',
    'transferred',
    'burned',
    'cancelled'
);


ALTER TYPE public.ticket_status OWNER TO postgres;

--
-- TOC entry 1210 (class 1247 OID 17629)
-- Name: transaction_type; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.transaction_type AS ENUM (
    'mint',
    'transfer',
    'list',
    'unlist',
    'sale',
    'burn'
);


ALTER TYPE public.transaction_type OWNER TO postgres;

--
-- TOC entry 471 (class 1255 OID 17740)
-- Name: events_search_trigger(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.events_search_trigger() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.search_vector :=
        setweight(to_tsvector('english', COALESCE(NEW.title, '')), 'A') ||
        setweight(to_tsvector('english', COALESCE(NEW.description, '')), 'B') ||
        setweight(to_tsvector('english', COALESCE(NEW.location, '')), 'C');
    RETURN NEW;
END;
$$;


ALTER FUNCTION public.events_search_trigger() OWNER TO postgres;

--
-- TOC entry 472 (class 1255 OID 17755)
-- Name: refresh_popular_events(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.refresh_popular_events() RETURNS void
    LANGUAGE plpgsql
    AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY popular_events;
END;
$$;


ALTER FUNCTION public.refresh_popular_events() OWNER TO postgres;

--
-- TOC entry 470 (class 1255 OID 17704)
-- Name: update_updated_at_column(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.update_updated_at_column() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;


ALTER FUNCTION public.update_updated_at_column() OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 334 (class 1259 OID 17601)
-- Name: checkin_logs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.checkin_logs (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    ticket_id uuid NOT NULL,
    token_id bigint NOT NULL,
    event_id uuid NOT NULL,
    scanned_by uuid,
    scanned_wallet character varying(42),
    device_info jsonb,
    location_info jsonb,
    "timestamp" timestamp with time zone DEFAULT now()
);


ALTER TABLE public.checkin_logs OWNER TO postgres;

--
-- TOC entry 3948 (class 0 OID 0)
-- Dependencies: 334
-- Name: TABLE checkin_logs; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.checkin_logs IS 'Check-in history at event venues';


--
-- TOC entry 336 (class 1259 OID 17661)
-- Name: event_analytics; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.event_analytics (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    event_id uuid NOT NULL,
    date date NOT NULL,
    tickets_sold integer DEFAULT 0,
    revenue_token numeric(20,2) DEFAULT 0,
    unique_buyers integer DEFAULT 0,
    checkins_count integer DEFAULT 0,
    secondary_sales integer DEFAULT 0,
    secondary_revenue numeric(20,2) DEFAULT 0,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.event_analytics OWNER TO postgres;

--
-- TOC entry 3950 (class 0 OID 0)
-- Dependencies: 336
-- Name: TABLE event_analytics; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.event_analytics IS 'Daily analytics per event';


--
-- TOC entry 330 (class 1259 OID 17471)
-- Name: events; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.events (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    organizer_id uuid NOT NULL,
    title character varying(255) NOT NULL,
    description text,
    location text,
    venue_name character varying(255),
    banner_url text,
    thumbnail_url text,
    category character varying(50),
    start_date timestamp with time zone NOT NULL,
    end_date timestamp with time zone NOT NULL,
    event_id_onchain bigint,
    contract_address character varying(42),
    royalty_fee integer DEFAULT 0,
    is_active boolean DEFAULT true,
    is_published boolean DEFAULT false,
    total_supply integer DEFAULT 0,
    total_sold integer DEFAULT 0,
    metadata jsonb,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    search_vector tsvector
);


ALTER TABLE public.events OWNER TO postgres;

--
-- TOC entry 3952 (class 0 OID 0)
-- Dependencies: 330
-- Name: TABLE events; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.events IS 'Events created by organizers';


--
-- TOC entry 331 (class 1259 OID 17497)
-- Name: ticket_templates; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.ticket_templates (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    event_id uuid NOT NULL,
    name character varying(100) NOT NULL,
    description text,
    price_token numeric(20,2) DEFAULT 0 NOT NULL,
    supply integer DEFAULT 0 NOT NULL,
    sold integer DEFAULT 0,
    tier integer DEFAULT 1,
    royalty_fee integer DEFAULT 0,
    benefits jsonb,
    metadata_uri text,
    is_soulbound boolean DEFAULT false,
    is_active boolean DEFAULT true,
    sale_starts_at timestamp with time zone,
    sale_ends_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.ticket_templates OWNER TO postgres;

--
-- TOC entry 3954 (class 0 OID 0)
-- Dependencies: 331
-- Name: TABLE ticket_templates; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.ticket_templates IS 'Ticket types/tiers for each event';


--
-- TOC entry 332 (class 1259 OID 17537)
-- Name: tickets; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tickets (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    token_id bigint NOT NULL,
    template_id uuid NOT NULL,
    event_id uuid NOT NULL,
    owner_wallet character varying(42) NOT NULL,
    original_owner character varying(42),
    status public.ticket_status DEFAULT 'minted'::public.ticket_status,
    tx_hash character varying(66),
    metadata_uri text,
    qr_code_url text,
    qr_hash character varying(64),
    is_checked_in boolean DEFAULT false,
    checked_in_at timestamp with time zone,
    checked_in_by uuid,
    is_transferable boolean DEFAULT true,
    minted_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.tickets OWNER TO postgres;

--
-- TOC entry 3956 (class 0 OID 0)
-- Dependencies: 332
-- Name: TABLE tickets; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.tickets IS 'Individual NFT tickets owned by users';


--
-- TOC entry 340 (class 1259 OID 17727)
-- Name: event_stats; Type: VIEW; Schema: public; Owner: postgres
--

CREATE VIEW public.event_stats AS
 SELECT e.id,
    e.title,
    count(DISTINCT t.id) AS total_tickets,
    count(DISTINCT
        CASE
            WHEN t.is_checked_in THEN t.id
            ELSE NULL::uuid
        END) AS checked_in_count,
    sum(tt.price_token) AS total_revenue,
    count(DISTINCT t.owner_wallet) AS unique_holders
   FROM ((public.events e
     LEFT JOIN public.tickets t ON ((e.id = t.event_id)))
     LEFT JOIN public.ticket_templates tt ON ((t.template_id = tt.id)))
  GROUP BY e.id, e.title;


ALTER VIEW public.event_stats OWNER TO postgres;

--
-- TOC entry 342 (class 1259 OID 17756)
-- Name: indexer_state; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.indexer_state (
    id character varying(50) NOT NULL,
    last_block bigint NOT NULL,
    updated_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.indexer_state OWNER TO postgres;

--
-- TOC entry 333 (class 1259 OID 17583)
-- Name: marketplace_listings; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.marketplace_listings (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    ticket_id uuid NOT NULL,
    token_id bigint NOT NULL,
    seller_wallet character varying(42) NOT NULL,
    price_token numeric(20,2) NOT NULL,
    status public.listing_status DEFAULT 'active'::public.listing_status,
    tx_hash character varying(66),
    listed_at timestamp with time zone DEFAULT now(),
    sold_at timestamp with time zone,
    cancelled_at timestamp with time zone,
    buyer_wallet character varying(42),
    updated_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.marketplace_listings OWNER TO postgres;

--
-- TOC entry 3960 (class 0 OID 0)
-- Dependencies: 333
-- Name: TABLE marketplace_listings; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.marketplace_listings IS 'Secondary market listings';


--
-- TOC entry 339 (class 1259 OID 17722)
-- Name: marketplace_full; Type: VIEW; Schema: public; Owner: postgres
--

CREATE VIEW public.marketplace_full AS
 SELECT ml.id,
    ml.token_id,
    ml.seller_wallet,
    ml.price_token,
    ml.status,
    ml.listed_at,
    t.owner_wallet,
    tt.name AS ticket_name,
    tt.tier,
    e.title AS event_title,
    e.start_date,
    e.banner_url
   FROM (((public.marketplace_listings ml
     JOIN public.tickets t ON ((ml.ticket_id = t.id)))
     JOIN public.ticket_templates tt ON ((t.template_id = tt.id)))
     JOIN public.events e ON ((t.event_id = e.id)))
  WHERE (ml.status = 'active'::public.listing_status);


ALTER VIEW public.marketplace_full OWNER TO postgres;

--
-- TOC entry 338 (class 1259 OID 17717)
-- Name: tickets_full; Type: VIEW; Schema: public; Owner: postgres
--

CREATE VIEW public.tickets_full AS
 SELECT t.id,
    t.token_id,
    t.owner_wallet,
    t.status,
    t.is_checked_in,
    t.qr_code_url,
    tt.name AS ticket_name,
    tt.price_token,
    tt.tier,
    e.id AS event_id,
    e.title AS event_title,
    e.start_date,
    e.end_date,
    e.location,
    e.banner_url
   FROM ((public.tickets t
     JOIN public.ticket_templates tt ON ((t.template_id = tt.id)))
     JOIN public.events e ON ((t.event_id = e.id)));


ALTER VIEW public.tickets_full OWNER TO postgres;

--
-- TOC entry 335 (class 1259 OID 17641)
-- Name: transactions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.transactions (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    ticket_id uuid,
    token_id bigint,
    type public.transaction_type NOT NULL,
    from_wallet character varying(42),
    to_wallet character varying(42),
    price_token numeric(20,2),
    tx_hash character varying(66) NOT NULL,
    block_number bigint,
    gas_used bigint,
    metadata jsonb,
    "timestamp" timestamp with time zone DEFAULT now()
);


ALTER TABLE public.transactions OWNER TO postgres;

--
-- TOC entry 3964 (class 0 OID 0)
-- Dependencies: 335
-- Name: TABLE transactions; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.transactions IS 'On-chain transaction history';


--
-- TOC entry 329 (class 1259 OID 17457)
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    wallet_address character varying(42) NOT NULL,
    username character varying(50),
    email character varying(255),
    avatar_url text,
    bio text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.users OWNER TO postgres;

--
-- TOC entry 3966 (class 0 OID 0)
-- Dependencies: 329
-- Name: TABLE users; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.users IS 'User profiles linked to wallet addresses';


--
-- TOC entry 337 (class 1259 OID 17684)
-- Name: whitelist; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.whitelist (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    event_id uuid NOT NULL,
    wallet_address character varying(42) NOT NULL,
    allocation integer DEFAULT 1,
    used integer DEFAULT 0,
    proof_data jsonb,
    created_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.whitelist OWNER TO postgres;

--
-- TOC entry 3968 (class 0 OID 0)
-- Dependencies: 337
-- Name: TABLE whitelist; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.whitelist IS 'Whitelist for presale/private access';


--
-- TOC entry 3691 (class 2606 OID 17485)
-- Name: events events_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.events
    ADD CONSTRAINT events_pkey PRIMARY KEY (id);


--
-- TOC entry 341 (class 1259 OID 17742)
-- Name: popular_events; Type: MATERIALIZED VIEW; Schema: public; Owner: postgres
--

CREATE MATERIALIZED VIEW public.popular_events AS
 SELECT e.id,
    e.title,
    e.banner_url,
    e.start_date,
    e.location,
    count(t.id) AS tickets_sold,
    count(DISTINCT t.owner_wallet) AS unique_buyers,
    avg(ml.price_token) AS avg_secondary_price
   FROM ((public.events e
     LEFT JOIN public.tickets t ON ((e.id = t.event_id)))
     LEFT JOIN public.marketplace_listings ml ON ((t.id = ml.ticket_id)))
  WHERE (e.is_published = true)
  GROUP BY e.id
  ORDER BY (count(t.id)) DESC, (count(DISTINCT t.owner_wallet)) DESC
 LIMIT 100
  WITH NO DATA;


ALTER MATERIALIZED VIEW public.popular_events OWNER TO postgres;

--
-- TOC entry 3723 (class 2606 OID 17609)
-- Name: checkin_logs checkin_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.checkin_logs
    ADD CONSTRAINT checkin_logs_pkey PRIMARY KEY (id);


--
-- TOC entry 3739 (class 2606 OID 17676)
-- Name: event_analytics event_analytics_event_id_date_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.event_analytics
    ADD CONSTRAINT event_analytics_event_id_date_key UNIQUE (event_id, date);


--
-- TOC entry 3741 (class 2606 OID 17674)
-- Name: event_analytics event_analytics_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.event_analytics
    ADD CONSTRAINT event_analytics_pkey PRIMARY KEY (id);


--
-- TOC entry 3689 (class 2606 OID 17487)
-- Name: events events_event_id_onchain_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.events
    ADD CONSTRAINT events_event_id_onchain_key UNIQUE (event_id_onchain);


--
-- TOC entry 3753 (class 2606 OID 17761)
-- Name: indexer_state indexer_state_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.indexer_state
    ADD CONSTRAINT indexer_state_pkey PRIMARY KEY (id);


--
-- TOC entry 3721 (class 2606 OID 17591)
-- Name: marketplace_listings marketplace_listings_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.marketplace_listings
    ADD CONSTRAINT marketplace_listings_pkey PRIMARY KEY (id);


--
-- TOC entry 3701 (class 2606 OID 17513)
-- Name: ticket_templates ticket_templates_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ticket_templates
    ADD CONSTRAINT ticket_templates_pkey PRIMARY KEY (id);


--
-- TOC entry 3710 (class 2606 OID 17549)
-- Name: tickets tickets_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tickets
    ADD CONSTRAINT tickets_pkey PRIMARY KEY (id);


--
-- TOC entry 3712 (class 2606 OID 17553)
-- Name: tickets tickets_qr_hash_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tickets
    ADD CONSTRAINT tickets_qr_hash_key UNIQUE (qr_hash);


--
-- TOC entry 3714 (class 2606 OID 17551)
-- Name: tickets tickets_token_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tickets
    ADD CONSTRAINT tickets_token_id_key UNIQUE (token_id);


--
-- TOC entry 3735 (class 2606 OID 17649)
-- Name: transactions transactions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.transactions
    ADD CONSTRAINT transactions_pkey PRIMARY KEY (id);


--
-- TOC entry 3737 (class 2606 OID 17651)
-- Name: transactions transactions_tx_hash_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.transactions
    ADD CONSTRAINT transactions_tx_hash_key UNIQUE (tx_hash);


--
-- TOC entry 3685 (class 2606 OID 17466)
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- TOC entry 3687 (class 2606 OID 17468)
-- Name: users users_wallet_address_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_wallet_address_key UNIQUE (wallet_address);


--
-- TOC entry 3748 (class 2606 OID 17696)
-- Name: whitelist whitelist_event_id_wallet_address_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.whitelist
    ADD CONSTRAINT whitelist_event_id_wallet_address_key UNIQUE (event_id, wallet_address);


--
-- TOC entry 3750 (class 2606 OID 17694)
-- Name: whitelist whitelist_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.whitelist
    ADD CONSTRAINT whitelist_pkey PRIMARY KEY (id);


--
-- TOC entry 3742 (class 1259 OID 17683)
-- Name: idx_analytics_date; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_analytics_date ON public.event_analytics USING btree (date);


--
-- TOC entry 3743 (class 1259 OID 17682)
-- Name: idx_analytics_event; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_analytics_event ON public.event_analytics USING btree (event_id);


--
-- TOC entry 3744 (class 1259 OID 17738)
-- Name: idx_analytics_event_date; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_analytics_event_date ON public.event_analytics USING btree (event_id, date DESC);


--
-- TOC entry 3724 (class 1259 OID 17626)
-- Name: idx_checkin_event; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_checkin_event ON public.checkin_logs USING btree (event_id);


--
-- TOC entry 3725 (class 1259 OID 17737)
-- Name: idx_checkin_event_timestamp; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_checkin_event_timestamp ON public.checkin_logs USING btree (event_id, "timestamp" DESC);


--
-- TOC entry 3726 (class 1259 OID 17625)
-- Name: idx_checkin_ticket; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_checkin_ticket ON public.checkin_logs USING btree (ticket_id);


--
-- TOC entry 3727 (class 1259 OID 17627)
-- Name: idx_checkin_timestamp; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_checkin_timestamp ON public.checkin_logs USING btree ("timestamp");


--
-- TOC entry 3692 (class 1259 OID 17495)
-- Name: idx_events_active; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_events_active ON public.events USING btree (is_active, is_published);


--
-- TOC entry 3693 (class 1259 OID 17496)
-- Name: idx_events_category; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_events_category ON public.events USING btree (category);


--
-- TOC entry 3694 (class 1259 OID 17732)
-- Name: idx_events_date_category; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_events_date_category ON public.events USING btree (start_date, category) WHERE (is_published = true);


--
-- TOC entry 3695 (class 1259 OID 17494)
-- Name: idx_events_dates; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_events_dates ON public.events USING btree (start_date, end_date);


--
-- TOC entry 3696 (class 1259 OID 17493)
-- Name: idx_events_organizer; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_events_organizer ON public.events USING btree (organizer_id);


--
-- TOC entry 3697 (class 1259 OID 17739)
-- Name: idx_events_search; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_events_search ON public.events USING gin (search_vector);


--
-- TOC entry 3715 (class 1259 OID 17600)
-- Name: idx_listings_active; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_listings_active ON public.marketplace_listings USING btree (status) WHERE (status = 'active'::public.listing_status);


--
-- TOC entry 3716 (class 1259 OID 17734)
-- Name: idx_listings_price; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_listings_price ON public.marketplace_listings USING btree (price_token) WHERE (status = 'active'::public.listing_status);


--
-- TOC entry 3717 (class 1259 OID 17598)
-- Name: idx_listings_seller; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_listings_seller ON public.marketplace_listings USING btree (seller_wallet);


--
-- TOC entry 3718 (class 1259 OID 17599)
-- Name: idx_listings_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_listings_status ON public.marketplace_listings USING btree (status);


--
-- TOC entry 3719 (class 1259 OID 17597)
-- Name: idx_listings_ticket; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_listings_ticket ON public.marketplace_listings USING btree (ticket_id);


--
-- TOC entry 3698 (class 1259 OID 17520)
-- Name: idx_templates_active; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_templates_active ON public.ticket_templates USING btree (is_active);


--
-- TOC entry 3699 (class 1259 OID 17519)
-- Name: idx_templates_event; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_templates_event ON public.ticket_templates USING btree (event_id);


--
-- TOC entry 3702 (class 1259 OID 17571)
-- Name: idx_tickets_event; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_tickets_event ON public.tickets USING btree (event_id);


--
-- TOC entry 3703 (class 1259 OID 17733)
-- Name: idx_tickets_event_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_tickets_event_status ON public.tickets USING btree (event_id, status);


--
-- TOC entry 3704 (class 1259 OID 17570)
-- Name: idx_tickets_owner; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_tickets_owner ON public.tickets USING btree (owner_wallet);


--
-- TOC entry 3705 (class 1259 OID 17574)
-- Name: idx_tickets_qr_hash; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_tickets_qr_hash ON public.tickets USING btree (qr_hash);


--
-- TOC entry 3706 (class 1259 OID 17573)
-- Name: idx_tickets_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_tickets_status ON public.tickets USING btree (status);


--
-- TOC entry 3707 (class 1259 OID 17572)
-- Name: idx_tickets_template; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_tickets_template ON public.tickets USING btree (template_id);


--
-- TOC entry 3708 (class 1259 OID 17569)
-- Name: idx_tickets_token_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_tickets_token_id ON public.tickets USING btree (token_id);


--
-- TOC entry 3728 (class 1259 OID 17736)
-- Name: idx_transactions_buyer_timestamp; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_transactions_buyer_timestamp ON public.transactions USING btree (to_wallet, "timestamp" DESC);


--
-- TOC entry 3729 (class 1259 OID 17657)
-- Name: idx_transactions_ticket; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_transactions_ticket ON public.transactions USING btree (ticket_id);


--
-- TOC entry 3730 (class 1259 OID 17660)
-- Name: idx_transactions_tx_hash; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_transactions_tx_hash ON public.transactions USING btree (tx_hash);


--
-- TOC entry 3731 (class 1259 OID 17658)
-- Name: idx_transactions_type; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_transactions_type ON public.transactions USING btree (type);


--
-- TOC entry 3732 (class 1259 OID 17735)
-- Name: idx_transactions_user_timestamp; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_transactions_user_timestamp ON public.transactions USING btree (from_wallet, "timestamp" DESC);


--
-- TOC entry 3733 (class 1259 OID 17659)
-- Name: idx_transactions_wallets; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_transactions_wallets ON public.transactions USING btree (from_wallet, to_wallet);


--
-- TOC entry 3682 (class 1259 OID 17470)
-- Name: idx_users_username; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_users_username ON public.users USING btree (username);


--
-- TOC entry 3683 (class 1259 OID 17469)
-- Name: idx_users_wallet; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_users_wallet ON public.users USING btree (wallet_address);


--
-- TOC entry 3745 (class 1259 OID 17702)
-- Name: idx_whitelist_event; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_whitelist_event ON public.whitelist USING btree (event_id);


--
-- TOC entry 3746 (class 1259 OID 17703)
-- Name: idx_whitelist_wallet; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_whitelist_wallet ON public.whitelist USING btree (wallet_address);


--
-- TOC entry 3751 (class 1259 OID 17754)
-- Name: popular_events_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX popular_events_id_idx ON public.popular_events USING btree (id);


--
-- TOC entry 3767 (class 2620 OID 17741)
-- Name: events events_search_update; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER events_search_update BEFORE INSERT OR UPDATE ON public.events FOR EACH ROW EXECUTE FUNCTION public.events_search_trigger();


--
-- TOC entry 3772 (class 2620 OID 17710)
-- Name: event_analytics update_event_analytics_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_event_analytics_updated_at BEFORE UPDATE ON public.event_analytics FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- TOC entry 3768 (class 2620 OID 17706)
-- Name: events update_events_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_events_updated_at BEFORE UPDATE ON public.events FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- TOC entry 3771 (class 2620 OID 17709)
-- Name: marketplace_listings update_marketplace_listings_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_marketplace_listings_updated_at BEFORE UPDATE ON public.marketplace_listings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- TOC entry 3769 (class 2620 OID 17707)
-- Name: ticket_templates update_ticket_templates_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_ticket_templates_updated_at BEFORE UPDATE ON public.ticket_templates FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- TOC entry 3770 (class 2620 OID 17708)
-- Name: tickets update_tickets_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_tickets_updated_at BEFORE UPDATE ON public.tickets FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- TOC entry 3766 (class 2620 OID 17705)
-- Name: users update_users_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- TOC entry 3760 (class 2606 OID 17615)
-- Name: checkin_logs checkin_logs_event_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.checkin_logs
    ADD CONSTRAINT checkin_logs_event_id_fkey FOREIGN KEY (event_id) REFERENCES public.events(id);


--
-- TOC entry 3761 (class 2606 OID 17620)
-- Name: checkin_logs checkin_logs_scanned_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.checkin_logs
    ADD CONSTRAINT checkin_logs_scanned_by_fkey FOREIGN KEY (scanned_by) REFERENCES public.users(id);


--
-- TOC entry 3762 (class 2606 OID 17610)
-- Name: checkin_logs checkin_logs_ticket_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.checkin_logs
    ADD CONSTRAINT checkin_logs_ticket_id_fkey FOREIGN KEY (ticket_id) REFERENCES public.tickets(id);


--
-- TOC entry 3764 (class 2606 OID 17677)
-- Name: event_analytics event_analytics_event_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.event_analytics
    ADD CONSTRAINT event_analytics_event_id_fkey FOREIGN KEY (event_id) REFERENCES public.events(id) ON DELETE CASCADE;


--
-- TOC entry 3754 (class 2606 OID 17488)
-- Name: events events_organizer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.events
    ADD CONSTRAINT events_organizer_id_fkey FOREIGN KEY (organizer_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- TOC entry 3759 (class 2606 OID 17592)
-- Name: marketplace_listings marketplace_listings_ticket_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.marketplace_listings
    ADD CONSTRAINT marketplace_listings_ticket_id_fkey FOREIGN KEY (ticket_id) REFERENCES public.tickets(id) ON DELETE CASCADE;


--
-- TOC entry 3755 (class 2606 OID 17514)
-- Name: ticket_templates ticket_templates_event_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ticket_templates
    ADD CONSTRAINT ticket_templates_event_id_fkey FOREIGN KEY (event_id) REFERENCES public.events(id) ON DELETE CASCADE;


--
-- TOC entry 3756 (class 2606 OID 17564)
-- Name: tickets tickets_checked_in_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tickets
    ADD CONSTRAINT tickets_checked_in_by_fkey FOREIGN KEY (checked_in_by) REFERENCES public.users(id);


--
-- TOC entry 3757 (class 2606 OID 17559)
-- Name: tickets tickets_event_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tickets
    ADD CONSTRAINT tickets_event_id_fkey FOREIGN KEY (event_id) REFERENCES public.events(id);


--
-- TOC entry 3758 (class 2606 OID 17554)
-- Name: tickets tickets_template_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tickets
    ADD CONSTRAINT tickets_template_id_fkey FOREIGN KEY (template_id) REFERENCES public.ticket_templates(id);


--
-- TOC entry 3763 (class 2606 OID 17652)
-- Name: transactions transactions_ticket_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.transactions
    ADD CONSTRAINT transactions_ticket_id_fkey FOREIGN KEY (ticket_id) REFERENCES public.tickets(id);


--
-- TOC entry 3765 (class 2606 OID 17697)
-- Name: whitelist whitelist_event_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.whitelist
    ADD CONSTRAINT whitelist_event_id_fkey FOREIGN KEY (event_id) REFERENCES public.events(id) ON DELETE CASCADE;
