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
  transport: http(process.env.RPC_URL, {
    timeout: 30_000, // 30 seconds timeout
  }),
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

const MAX_BLOCK_RANGE = BigInt(49000); // Set a safe limit for RPC requests

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
 * Process a range of blocks, fetching logs in chunks.
 */
async function processBlockRange(fromBlock: bigint, toBlock: bigint) {
    if (toBlock < fromBlock) {
        return;
    }

    console.log(`Processing blocks from ${fromBlock} to ${toBlock}`);

    try {
        for (let currentFrom = fromBlock; currentFrom <= toBlock; currentFrom += MAX_BLOCK_RANGE + BigInt(1)) {
            const currentTo = (currentFrom + MAX_BLOCK_RANGE > toBlock) ? toBlock : currentFrom + MAX_BLOCK_RANGE;

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
    // decodeEventLog's types can be permissive; cast to any and guard at runtime
    const decodedEventAny: any = decodeEventLog({
      abi: TICKET_NFT_ABI,
      data: log.data,
      topics: log.topics,
    })

    const eventName: string | undefined = decodedEventAny?.eventName
    const args: any = decodedEventAny?.args

    if (!eventName || !args) return

    switch (eventName) {
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
          .select('id')
          .eq('event_id_onchain', eventIdOnChain?.toString())
          .single()

        if (eventError || !eventData) {
          console.error(`❌ Event with on-chain ID ${eventIdOnChain} not found in database`)
          return
        }

        const { error: insertError } = await supabase
          .from('tickets')
          .upsert({
            token_id: tokenId.toString(),
            event_id: eventData.id, // Use the UUID from database
            owner_wallet: owner?.toLowerCase(),
            original_owner: owner?.toLowerCase(),
            tx_hash: log.transactionHash,
            status: 'minted',
            minted_at: new Date().toISOString(),
          }, { onConflict: 'token_id' })

        if (insertError) {
          console.error(`❌ Failed to insert ticket: ${insertError.message}`)
        } else {
          console.log(`✅ Inserted ticket ${tokenId} into database`)
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
    // Ignore decoding errors if the log doesn't match the ABI
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
