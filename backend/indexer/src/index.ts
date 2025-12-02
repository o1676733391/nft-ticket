import { createPublicClient, http, Log, decodeEventLog } from 'viem'
import { hardhat } from 'viem/chains'
import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import { readFileSync } from 'fs'
import { resolve } from 'path'

dotenv.config()

// Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// Viem client
const publicClient = createPublicClient({
  chain: hardhat,
  transport: http(process.env.RPC_URL, {
    timeout: 30_000, // 30 seconds timeout
  }),
})

// Contract addresses
const TICKET_NFT_ADDRESS = process.env.TICKET_NFT_ADDRESS as `0x${string}`
const MARKETPLACE_ADDRESS = process.env.MARKETPLACE_ADDRESS as `0x${string}`

// Load ABIs from compiled contract artifacts when available. Falls back to minimal inline ABI strings.
let TICKET_NFT_ABI: any[] = []
let MARKETPLACE_ABI: any[] = []
try {
  // artifact paths relative to this file: backend/indexer/src -> repository root is ../../..
  const ticketArtifactPath = resolve(__dirname, '../../../contracts/artifacts/contracts/TicketNFT.sol/TicketNFT.json')
  const marketplaceArtifactPath = resolve(__dirname, '../../../contracts/artifacts/contracts/Marketplace.sol/Marketplace.json')
  const ticketArtifact = JSON.parse(readFileSync(ticketArtifactPath, 'utf-8'))
  const marketplaceArtifact = JSON.parse(readFileSync(marketplaceArtifactPath, 'utf-8'))
  TICKET_NFT_ABI = ticketArtifact.abi
  MARKETPLACE_ABI = marketplaceArtifact.abi
  console.log('Loaded ABIs from artifacts')
} catch (err: any) {
  console.warn('Could not load contract artifacts, falling back to inline ABIs:', err?.message || err)
  TICKET_NFT_ABI = [
    'event EventCreated(uint256 indexed eventId, address indexed organizer, string name)',
    'event TicketMinted(uint256 indexed tokenId, uint256 indexed eventId, address indexed owner)',
    'event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)',
    'event TicketCheckedIn(uint256 indexed tokenId, uint256 timestamp)',
    'event TransferLocked(uint256 indexed tokenId, bool locked)',
  ]
  MARKETPLACE_ABI = [
    'event Listed(uint256 indexed tokenId, address indexed seller, uint256 price)',
    'event Unlisted(uint256 indexed tokenId, address indexed seller)',
    'event Sold(uint256 indexed tokenId, address indexed seller, address indexed buyer, uint256 price)',
  ]
}

const MAX_BLOCK_RANGE = BigInt(10); // Alchemy free tier limit: 10 blocks per eth_getLogs request

// Last processed block (store in Supabase or file)
let lastProcessedBlock = BigInt(0)

/**
 * Main indexer function
 */
async function startIndexer() {
  console.log('🚀 Starting NFT Ticket Indexer...');

  // 1. Load the last block we processed
  await loadLastProcessedBlock();

  // 2. Sync any blocks that were missed while the indexer was offline
  const currentBlock = await publicClient.getBlockNumber();
  if (currentBlock > lastProcessedBlock) {
    await syncHistoricalBlocks(lastProcessedBlock + BigInt(1), currentBlock);
  }

  // 3. Start watching for new blocks *after* historical sync is complete
  publicClient.watchBlocks({
    onBlock: async (block) => {
      if (block.number && block.number > lastProcessedBlock) {
        console.log(`📦 New block: ${block.number}`);
        await processBlock(block.number);
      }
    },
    // This will help in case of a short disconnection
    poll: true,
    pollingInterval: 4000, 
  });

  console.log('✅ Indexer is running and watching for new blocks...');
}

/**
 * Load last processed block from database
 */
async function loadLastProcessedBlock() {
  try {
    const { data, error } = await supabase
      .from('indexer_state')
      .select('last_block')
      .eq('id', 'main')
      .single()

    if (data && !error) {
      lastProcessedBlock = BigInt(data.last_block)
      console.log(`📍 Resuming from block: ${lastProcessedBlock}`)
    } else {
      // No state found - first run
      // For local dev, start from 0; for production, start from recent blocks
      if (process.env.CHAIN_ID === '1337') {
        lastProcessedBlock = BigInt(0)
        console.log(`🏠 Local network - first run, starting from block: 0`)
      } else {
        const currentBlock = await publicClient.getBlockNumber()
        lastProcessedBlock = currentBlock - BigInt(100) // Start from 100 blocks ago
        console.log(`🆕 First run, starting from block: ${lastProcessedBlock}`)
      }
    }
  } catch (error) {
    console.error('Error loading last processed block:', error)
  }
}

/**
 * Save last processed block to database
 */
async function saveLastProcessedBlock(blockNumber: bigint) {
  try {
    await supabase
      .from('indexer_state')
      .upsert({
        id: 'main',
        last_block: blockNumber.toString(),
        updated_at: new Date().toISOString(),
      })
    lastProcessedBlock = blockNumber
  } catch (error) {
    console.error('Error saving last processed block:', error)
  }
}

/**
 * Process a range of blocks, fetching logs in chunks.
 */
async function processBlockRange(fromBlock: bigint, toBlock: bigint) {
    if (toBlock < fromBlock) {
        return;
    }

    console.log(`Processing blocks from ${fromBlock} to ${toBlock}`);

    try {
        for (let currentFrom = fromBlock; currentFrom <= toBlock; currentFrom += MAX_BLOCK_RANGE) {
            // Ensure we don't exceed MAX_BLOCK_RANGE (inclusive range)
            const currentTo = (currentFrom + MAX_BLOCK_RANGE - BigInt(1) > toBlock) 
                ? toBlock 
                : currentFrom + MAX_BLOCK_RANGE - BigInt(1);

            console.log(`  Fetching logs from block ${currentFrom} to ${currentTo}`);

            const logs = await publicClient.getLogs({
                address: [TICKET_NFT_ADDRESS, MARKETPLACE_ADDRESS],
                fromBlock: currentFrom,
                toBlock: currentTo,
            });

            if (logs.length > 0) {
                console.log(`  🔍 Found ${logs.length} events in this range.`);
                for (const log of logs) {
                    await processLog(log);
                }
            }
            // Save progress after each chunk
            await saveLastProcessedBlock(currentTo);
            console.log(`  ✅ Progress saved up to block ${currentTo}`);

            // Add a small delay to avoid overwhelming the RPC
            await new Promise(resolve => setTimeout(resolve, 250));
        }

        console.log(`✅ Finished processing up to block ${toBlock}`);

    } catch (error) {
        console.error(`Error processing blocks from ${fromBlock} to ${toBlock}:`, error);
    }
}

/**
 * Process a single new block.
 */
async function processBlock(blockNumber: bigint) {
  if (blockNumber <= lastProcessedBlock) {
    return; // Already processed
  }
  await processBlockRange(lastProcessedBlock + BigInt(1), blockNumber);
}

/**
 * Process individual log
 */
async function processLog(log: Log) {
  try {
    const { address } = log;

    console.log(`🔍 Processing log from address: ${address}`);
    console.log(`   Expected TicketNFT: ${TICKET_NFT_ADDRESS}`);
    console.log(`   Expected Marketplace: ${MARKETPLACE_ADDRESS}`);

    if (address.toLowerCase() === TICKET_NFT_ADDRESS.toLowerCase()) {
      console.log('✅ Matched TicketNFT contract, processing...');
      await processTicketNFTEvent(log);
    } else if (address.toLowerCase() === MARKETPLACE_ADDRESS.toLowerCase()) {
      console.log('✅ Matched Marketplace contract, processing...');
      await processMarketplaceEvent(log);
    } else {
      console.log('⚠️ Unknown contract address, skipping...');
    }
  } catch (error) {
    console.error('Error processing log:', error, log);
  }
}

/**
 * Process TicketNFT events
 */
async function processTicketNFTEvent(log: Log) {
  try {
    console.log('🔍 Processing TicketNFT log:', {
      address: log.address,
      topics: log.topics,
      data: log.data,
      transactionHash: log.transactionHash
    });

    // decodeEventLog's types can be permissive; cast to any and guard at runtime
    const decodedEventAny: any = decodeEventLog({
      abi: TICKET_NFT_ABI,
      data: log.data,
      topics: log.topics,
    })

    console.log('📝 Decoded event:', decodedEventAny);

    const eventName: string | undefined = decodedEventAny?.eventName
    const args: any = decodedEventAny?.args

    if (!eventName || !args) {
      console.warn('⚠️ Could not decode event name or args');
      return;
    }

    console.log(`🎯 Event type: ${eventName}`);

    switch (eventName) {
      case 'EventCreated': {
        const eventIdOnChain = (args.eventId ?? args[0])
        const organizer = (args.organizer ?? args[1])
        const name = (args.name ?? args[2])
        
        console.log(`🎉 Event Created: eventId=${eventIdOnChain}, organizer=${organizer}, name=${name}`)
        try {
          // Since events.ts now creates on-chain events during event creation,
          // the event_id_onchain should already be set in the DB.
          // Just verify that the event exists.
          const eventIdStr = eventIdOnChain?.toString()
          console.log(`🔍 Looking for event with event_id_onchain = "${eventIdStr}" (type: ${typeof eventIdStr})`)
          
          const { data: dbEvent, error } = await supabase
            .from('events')
            .select('id, title, event_id_onchain')
            .eq('event_id_onchain', eventIdStr)
            .maybeSingle();

          if (error) {
            console.error(`❌ DB query error:`, error)
          } else if (!dbEvent) {
            console.warn(`⚠️ Event ${eventIdOnChain} not found in DB. This may happen if the event was created before REST API was updated.`)
          } else {
            console.log(`✅ Verified DB event ${dbEvent.id} (${dbEvent.title}) exists with onchain ID ${eventIdOnChain}`)
            console.log(`   DB value: "${dbEvent.event_id_onchain}" (type: ${typeof dbEvent.event_id_onchain})`)
          }
        } catch (err) {
          console.error('Error while verifying EventCreated in DB:', err)
        }

        break
      }

      case 'TicketMinted': {
        // args may be an array or an object with named keys depending on decoder
        const tokenId = (args.tokenId ?? args[0])
        const eventIdOnChain = (args.eventId ?? args[1])
        const owner = (args.owner ?? args[2])

        if (tokenId == null) return

        console.log(`🎫 Ticket Minted: tokenId=${tokenId}, eventIdOnChain=${eventIdOnChain}, owner=${owner}`)

        // Find the event UUID from the on-chain event ID
        const { data: eventData, error: eventError } = await supabase
          .from('events')
          .select('id, title, event_id_onchain')
          .eq('event_id_onchain', eventIdOnChain?.toString())
          .maybeSingle()

        if (eventError || !eventData) {
          console.error(`❌ Event with on-chain ID ${eventIdOnChain} not found in database`)
          if (eventError) console.error('Event lookup error:', eventError)
          console.error('Tried to find event_id_onchain:', eventIdOnChain?.toString())
          return
        }

        console.log(`✅ Found event: ${eventData.title} (UUID: ${eventData.id})`)

        // Find the first active template for this event (or null if none)
        const { data: templateData, error: templateError } = await supabase
          .from('ticket_templates')
          .select('id, name')
          .eq('event_id', eventData.id)
          .eq('is_active', true)
          .limit(1)
          .maybeSingle()

        if (templateError && templateError.code !== 'PGRST116') {
          console.error('Template lookup error:', templateError)
        }

        if (templateData) {
          console.log(`✅ Found template: ${templateData.name} (UUID: ${templateData.id})`)
        } else {
          console.warn(`⚠️ No template found for event ${eventData.id}, using null`)
        }

        const ticketData = {
          token_id: tokenId.toString(),
          template_id: templateData?.id || null,
          event_id: eventData.id,
          owner_wallet: owner?.toLowerCase(),
          original_owner: owner?.toLowerCase(),
          tx_hash: log.transactionHash,
          status: 'minted' as const,
          minted_at: new Date().toISOString(),
        }

        console.log('Attempting to insert ticket:', JSON.stringify(ticketData, null, 2))

        const { error: insertError } = await supabase
          .from('tickets')
          .upsert(ticketData, { onConflict: 'token_id' })

        if (insertError) {
          console.error(`❌ Failed to insert ticket: ${insertError.message}`)
          console.error('Full error:', JSON.stringify(insertError, null, 2))
        } else {
          console.log(`✅ Successfully inserted ticket ${tokenId} into database`)
        }
        break
      }

      case 'Transfer': {
        const from = (args.from ?? args[0])
        const to = (args.to ?? args[1])
        const tokenId = (args.tokenId ?? args[2])

        if (!tokenId) return
        if (from === '0x0000000000000000000000000000000000000000') return // Skip mint

        console.log(`🔄 Transfer: tokenId=${tokenId}, from=${from}, to=${to}`)

        await supabase
          .from('tickets')
          .update({ owner_wallet: (to as string).toLowerCase(), status: 'transferred' })
          .eq('token_id', tokenId.toString())

        await supabase
          .from('transactions')
          .insert({
            token_id: tokenId.toString(),
            type: 'transfer',
            from_wallet: (from as string).toLowerCase(),
            to_wallet: (to as string).toLowerCase(),
            tx_hash: log.transactionHash,
            block_number: log.blockNumber?.toString(),
          })

        break
      }

      case 'TicketCheckedIn': {
        const tokenId = (args.tokenId ?? args[0])
        if (!tokenId) return
        console.log(`✅ Ticket Checked In: tokenId=${tokenId}`)
        await supabase
          .from('tickets')
          .update({ is_checked_in: true, checked_in_at: new Date().toISOString() })
          .eq('token_id', tokenId.toString())
        break
      }

      case 'TransferLocked': {
        const tokenId = (args.tokenId ?? args[0])
        const locked = (args.locked ?? args[1])
        console.log(`🔒 Transfer Lock Changed: tokenId=${tokenId}, locked=${locked}`)
        await supabase
          .from('tickets')
          .update({ is_transferable: !locked })
          .eq('token_id', tokenId.toString())
        break
      }
    }
  } catch (err) {
    console.error('❌ Error decoding TicketNFT event:', err);
    // Don't try to stringify log as it contains BigInt
  }
}

/**
 * Process Marketplace events
 */
async function processMarketplaceEvent(log: Log) {
  try {
    const decodedAny: any = decodeEventLog({
      abi: MARKETPLACE_ABI,
      data: log.data,
      topics: log.topics,
    });

    const eventName: string | undefined = decodedAny?.eventName;
    const args: any = decodedAny?.args;
    if (!eventName || !args) return;

    switch (eventName) {
      case 'Listed': {
        const tokenId = (args.tokenId ?? args[0])
        const seller = (args.seller ?? args[1])
        const price = (args.price ?? args[2])
        if (!tokenId) return
        console.log(`📝 Listing Created: tokenId=${tokenId}, seller=${seller}, price=${price}`)
        
        // Get ticket UUID from token_id
        const { data: ticketData, error: ticketError } = await supabase
          .from('tickets')
          .select('id')
          .eq('token_id', tokenId.toString())
          .single()
        
        if (ticketError || !ticketData) {
          console.error(`❌ Ticket ${tokenId} not found in database`)
          if (ticketError) console.error('Ticket lookup error:', ticketError)
          return
        }
        
        console.log(`✅ Found ticket UUID: ${ticketData.id}`)
        
        // Convert price from wei to ether (with 2 decimals for NUMERIC(20,2))
        // Price is in wei (e.g., "200000000000000000" = 0.2 ETH)
        const priceInWei = BigInt(price.toString())
        const priceInEther = Number(priceInWei) / 1e18
        
        // Insert into marketplace_listings (using ticket_id UUID, not event_id)
        const listingData = {
          ticket_id: ticketData.id,
          token_id: tokenId.toString(),
          seller_wallet: (seller as string).toLowerCase(),
          price_token: priceInEther,
          status: 'active' as const,
          listed_at: new Date().toISOString(),
          tx_hash: log.transactionHash,
        }
        
        console.log('Attempting to insert marketplace listing:', JSON.stringify(listingData, null, 2))
        
        const { error: listingError } = await supabase
          .from('marketplace_listings')
          .insert(listingData)
        
        if (listingError) {
          console.error(`❌ Failed to insert marketplace listing: ${listingError.message}`)
          console.error('Full error:', JSON.stringify(listingError, null, 2))
        } else {
          console.log(`✅ Successfully inserted marketplace listing for token ${tokenId}`)
        }
        
        // Update ticket status
        await supabase
          .from('tickets')
          .update({ status: 'listed' })
          .eq('token_id', tokenId.toString())
        
        break
      }
      case 'Unlisted': {
        const tokenId = (args.tokenId ?? args[0])
        if (!tokenId) return
        console.log(`❌ Listing Cancelled: tokenId=${tokenId}`)
        await supabase
          .from('marketplace_listings')
          .update({ status: 'cancelled', cancelled_at: new Date().toISOString() })
          .eq('token_id', tokenId.toString())
          .eq('status', 'active')
        await supabase
          .from('tickets')
          .update({ status: 'minted' })
          .eq('token_id', tokenId.toString())
        break
      }
      case 'Sold': {
        const tokenId = (args.tokenId ?? args[0])
        const seller = (args.seller ?? args[1])
        const buyer = (args.buyer ?? args[2])
        const price = (args.price ?? args[3])
        if (!tokenId) return
        console.log(`💰 Sale Completed: tokenId=${tokenId}, buyer=${buyer}, price=${price}`)
        await supabase
          .from('marketplace_listings')
          .update({
            status: 'sold',
            buyer_wallet: (buyer as string).toLowerCase(),
            sold_at: new Date().toISOString(),
          })
          .eq('token_id', tokenId.toString())
          .eq('status', 'active')
        await supabase
          .from('tickets')
          .update({
            owner_wallet: (buyer as string).toLowerCase(),
            status: 'sold',
          })
          .eq('token_id', tokenId.toString())
        break
      }
    }
  } catch (err) {
    console.error('❌ Error decoding Marketplace event:', err);
    // Don't try to stringify log as it contains BigInt
  }
}

/**
 * Catch up on missed blocks (historical sync)
 */
async function syncHistoricalBlocks(fromBlock: bigint, toBlock: bigint) {
  console.log(`📚 Syncing historical blocks from ${fromBlock} to ${toBlock}`);
  await processBlockRange(fromBlock, toBlock);
  console.log('✅ Historical sync complete');
}

// Start the indexer
startIndexer().catch(console.error)

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n👋 Shutting down indexer...')
  process.exit(0)
})
