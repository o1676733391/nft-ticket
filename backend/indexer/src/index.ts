import { createPublicClient, http, Log, decodeEventLog } from 'viem'
import { sepolia } from 'viem/chains'
import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

dotenv.config()

// Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// Viem client
const publicClient = createPublicClient({
  chain: sepolia,
  transport: http(process.env.RPC_URL),
})

// Contract addresses
const TICKET_NFT_ADDRESS = process.env.TICKET_NFT_ADDRESS as `0x${string}`
const MARKETPLACE_ADDRESS = process.env.MARKETPLACE_ADDRESS as `0x${string}`

// Event ABIs (replace with your actual ABIs)
const TICKET_NFT_ABI = [
  'event TicketMinted(uint256 indexed tokenId, uint256 indexed eventId, address indexed owner)',
  'event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)',
  'event TicketCheckedIn(uint256 indexed tokenId, uint256 timestamp)',
] as const;

const MARKETPLACE_ABI = [
  'event Listed(uint256 indexed tokenId, address indexed seller, uint256 price)',
  'event Unlisted(uint256 indexed tokenId, address indexed seller)',
  'event Sold(uint256 indexed tokenId, address indexed seller, address indexed buyer, uint256 price)',
] as const;


// Last processed block (store in Supabase or file)
let lastProcessedBlock = BigInt(0)

/**
 * Main indexer function
 */
async function startIndexer() {
  console.log('🚀 Starting NFT Ticket Indexer...')
  
  // Load last processed block from storage
  await loadLastProcessedBlock()
  
  // Start listening to new blocks
  const unwatch = publicClient.watchBlocks({
    onBlock: async (block) => {
      console.log(`📦 New block: ${block.number}`)
      await processBlock(block.number!)
    },
  })

  console.log('✅ Indexer running...')
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
      // Start from recent block if no state found
      const currentBlock = await publicClient.getBlockNumber()
      lastProcessedBlock = currentBlock - BigInt(100) // Start from 100 blocks ago
      console.log(`🆕 Starting from block: ${lastProcessedBlock}`)
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
 * Process a single block
 */
async function processBlock(blockNumber: bigint) {
  if (blockNumber <= lastProcessedBlock) {
    return // Already processed
  }

  try {
    // Fetch logs for all events from both contracts
    const logs = await publicClient.getLogs({
      address: [TICKET_NFT_ADDRESS, MARKETPLACE_ADDRESS],
      fromBlock: lastProcessedBlock + BigInt(1),
      toBlock: blockNumber,
    })

    if (logs.length > 0) {
      console.log(`🔍 Found ${logs.length} events in block ${blockNumber}`)
      
      // Process each log
      for (const log of logs) {
        await processLog(log)
      }
    }

    // Save progress
    await saveLastProcessedBlock(blockNumber)
  } catch (error) {
    console.error(`Error processing block ${blockNumber}:`, error)
  }
}

/**
 * Process individual log
 */
async function processLog(log: Log) {
  try {
    const { address } = log;

    if (address.toLowerCase() === TICKET_NFT_ADDRESS.toLowerCase()) {
      await processTicketNFTEvent(log);
    } else if (address.toLowerCase() === MARKETPLACE_ADDRESS.toLowerCase()) {
      await processMarketplaceEvent(log);
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
    const decodedEvent = decodeEventLog({
      abi: TICKET_NFT_ABI,
      data: log.data,
      topics: log.topics,
    });

    const { eventName, args } = decodedEvent;

    switch (eventName) {
      case 'TicketMinted': {
        const { tokenId, eventId, owner } = args;
        console.log(`🎫 Ticket Minted: tokenId=${tokenId}, eventId=${eventId}, owner=${owner}`);
        await supabase
          .from('tickets')
          .upsert({
            token_id: tokenId.toString(),
            event_id: eventId.toString(),
            owner_wallet: owner.toLowerCase(),
            tx_hash: log.transactionHash,
            status: 'minted',
          }, { onConflict: 'token_id' });
        break;
      }
      case 'Transfer': {
        const { from, to, tokenId } = args;
        if (from === '0x0000000000000000000000000000000000000000') return; // Skip mint
        console.log(`🔄 Transfer: tokenId=${tokenId}, from=${from}, to=${to}`);
        await supabase
          .from('tickets')
          .update({ owner_wallet: to.toLowerCase(), status: 'transferred' })
          .eq('token_id', tokenId.toString());
        await supabase
          .from('transactions')
          .insert({
            token_id: tokenId.toString(),
            type: 'transfer',
            from_wallet: from.toLowerCase(),
            to_wallet: to.toLowerCase(),
            tx_hash: log.transactionHash,
            block_number: log.blockNumber?.toString(),
          });
        break;
      }
      case 'TicketCheckedIn': {
        const { tokenId } = args;
        console.log(`✅ Ticket Checked In: tokenId=${tokenId}`);
        await supabase
          .from('tickets')
          .update({ is_checked_in: true, checked_in_at: new Date().toISOString() })
          .eq('token_id', tokenId.toString());
        break;
      }
    }
  } catch (err) {
    // Ignore decoding errors if the log doesn't match the ABI
  }
}

/**
 * Process Marketplace events
 */
async function processMarketplaceEvent(log: Log) {
  try {
    const decodedEvent = decodeEventLog({
      abi: MARKETPLACE_ABI,
      data: log.data,
      topics: log.topics,
    });

    const { eventName, args } = decodedEvent;

    switch (eventName) {
      case 'Listed': {
        const { tokenId, seller, price } = args;
        console.log(`📝 Listing Created: tokenId=${tokenId}, seller=${seller}, price=${price}`);
        await supabase
          .from('tickets')
          .update({ status: 'listed' })
          .eq('token_id', tokenId.toString());
        // You might want to create a new entry in a 'listings' table here
        break;
      }
      case 'Unlisted': {
        const { tokenId } = args;
        console.log(`❌ Listing Cancelled: tokenId=${tokenId}`);
        await supabase
          .from('marketplace_listings')
          .update({ status: 'cancelled', cancelled_at: new Date().toISOString() })
          .eq('token_id', tokenId.toString())
          .eq('status', 'active');
        await supabase
          .from('tickets')
          .update({ status: 'minted' })
          .eq('token_id', tokenId.toString());
        break;
      }
      case 'Sold': {
        const { tokenId, seller, buyer, price } = args;
        console.log(`💰 Sale Completed: tokenId=${tokenId}, buyer=${buyer}, price=${price}`);
        await supabase
          .from('marketplace_listings')
          .update({
            status: 'sold',
            buyer_wallet: buyer.toLowerCase(),
            sold_at: new Date().toISOString(),
          })
          .eq('token_id', tokenId.toString())
          .eq('status', 'active');
        await supabase
          .from('tickets')
          .update({
            owner_wallet: buyer.toLowerCase(),
            status: 'sold',
          })
          .eq('token_id', tokenId.toString());
        break;
      }
    }
  } catch (err) {
    // Ignore decoding errors if the log doesn't match the ABI
  }
}

/**
 * Catch up on missed blocks (historical sync)
 */
async function syncHistoricalBlocks(fromBlock: bigint, toBlock: bigint) {
  console.log(`📚 Syncing historical blocks from ${fromBlock} to ${toBlock}`)
  
  const batchSize = BigInt(1000)
  let currentBlock = fromBlock

  while (currentBlock < toBlock) {
    const endBlock = currentBlock + batchSize > toBlock ? toBlock : currentBlock + batchSize
    
    console.log(`Processing blocks ${currentBlock} to ${endBlock}`)
    await processBlock(endBlock)
    
    currentBlock = endBlock + BigInt(1)
    
    // Small delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 1000))
  }

  console.log('✅ Historical sync complete')
}

// Start the indexer
startIndexer().catch(console.error)

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n👋 Shutting down indexer...')
  process.exit(0)
})
