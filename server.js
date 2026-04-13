import express from 'express';
import cors from 'cors';
import { Rain } from '@buidlrrr/rain-sdk';

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Initialize Rain SDK
const rain = new Rain({ 
  environment: 'production',
  subgraphApiKey: process.env.GRAPH_API_KEY || '',
  wsRpcUrl: process.env.WS_RPC_URL || ''
});

// Get markets
app.get('/api/markets', async (req, res) => {
  try {
    const { limit = 20, sortBy = 'Liquidity', status = 'Live' } = req.query;
    const markets = await rain.getPublicMarkets({
      limit: parseInt(limit),
      sortBy,
      status
    });
    
    // Convert amounts to human-readable USD (USDT has 6 decimals)
    const formatted = markets.map(m => ({
      ...m,
      totalVolume: m.totalVolume ? Number(m.totalVolume) / 1_000_000 : 0,
      totalLiquidity: m.totalLiquidity ? Number(m.totalLiquidity) / 1_000_000 : 0
    }));
    
    res.json(formatted);
  } catch (error) {
    console.error('Markets error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get market details
app.get('/api/markets/:id', async (req, res) => {
  try {
    const details = await rain.getMarketDetails(req.params.id);
    
    // Format amounts
    const formatted = {
      ...details,
      allFunds: details.allFunds ? Number(details.allFunds) / 1_000_000 : 0,
      totalLiquidity: details.totalLiquidity ? Number(details.totalLiquidity) / 1_000_000 : 0
    };
    
    res.json(formatted);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get market prices
app.get('/api/markets/:id/prices', async (req, res) => {
  try {
    const prices = await rain.getMarketPrices(req.params.id);
    
    // Convert prices from 1e18 to decimal
    const formatted = prices.map(p => ({
      ...p,
      currentPrice: Number(p.currentPrice) / 1e18
    }));
    
    res.json(formatted);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get positions for a wallet
app.get('/api/positions/:address', async (req, res) => {
  try {
    const positions = await rain.getPositions(req.params.address);
    res.json(positions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get smart account balance (internal Rain wallet)
app.get('/api/balance/:address', async (req, res) => {
  try {
    const balance = await rain.getSmartAccountBalance({
      address: req.params.address,
      tokenAddresses: ['0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9'] // USDT
    });
    
    // Format to USD
    const formatted = balance.map(b => ({
      ...b,
      balance: Number(b.balance) / 1_000_000
    }));
    
    res.json(formatted);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Build create market transaction
app.post('/api/build-create-market', async (req, res) => {
  try {
    const {
      marketQuestion,
      marketOptions,
      marketTags,
      marketDescription,
      isPublic,
      creator,
      startTime,
      endTime,
      inputAmountWei,
      barValues
    } = req.body;
    
    const txs = await rain.buildCreateMarketTx({
      marketQuestion,
      marketOptions,
      marketTags: marketTags || ['general'],
      marketDescription: marketDescription || '',
      isPublic: isPublic !== false,
      isPublicPoolResolverAi: false,
      creator,
      startTime: BigInt(startTime),
      endTime: BigInt(endTime),
      no_of_options: BigInt(marketOptions.length),
      inputAmountWei: BigInt(inputAmountWei),
      barValues: barValues || Array(marketOptions.length).fill(Math.floor(100 / marketOptions.length)),
      baseToken: '0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9', // USDT on Arbitrum
      tokenDecimals: 6
    });
    
    // Convert BigInt to string for JSON
    const serialized = txs.map(tx => ({
      to: tx.to,
      data: tx.data,
      value: tx.value?.toString() || '0'
    }));
    
    res.json(serialized);
  } catch (error) {
    console.error('Build create market error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Build buy option transaction
app.post('/api/build-buy', async (req, res) => {
  try {
    const { marketContractAddress, selectedOption, buyAmountInWei } = req.body;
    
    const tx = rain.buildBuyOptionRawTx({
      marketContractAddress,
      selectedOption: BigInt(selectedOption),
      buyAmountInWei: BigInt(buyAmountInWei)
    });
    
    res.json({
      to: tx.to,
      data: tx.data,
      value: tx.value?.toString() || '0'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Build approval transaction
app.post('/api/build-approval', async (req, res) => {
  try {
    const { spender, amount } = req.body;
    
    const tx = rain.buildApprovalTx({
      tokenAddress: '0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9', // USDT
      spender,
      amount: amount ? BigInt(amount) : undefined
    });
    
    if (tx instanceof Error) {
      return res.status(400).json({ error: tx.message });
    }
    
    res.json({
      to: tx.to,
      data: tx.data,
      value: tx.value?.toString() || '0'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`🌧️ Rain Market Creator running on http://localhost:${PORT}`);
});
