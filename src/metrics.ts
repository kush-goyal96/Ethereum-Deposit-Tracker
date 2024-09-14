import { Counter, Gauge, Registry, Histogram } from "prom-client";

export const register = new Registry();

export const depositCounter = new Counter({
  name: "deposits_total",
  help: "Total number of deposits",
  registers: [register],
});

export const depositAmount = new Gauge({
  name: "deposit_amount",
  help: "Amount of the last deposit in ETH",
  registers: [register],
});

export const depositFee = new Gauge({
  name: "deposit_fee",
  help: "Fee of the last deposit in ETH",
  registers: [register],
});

export const blockNumber = new Gauge({
  name: "last_block_number",
  help: "Number of the last processed block",
  registers: [register],
});

export const blockProcessingTime = new Histogram({
  name: "block_processing_time",
  help: "Time taken to process each block in milliseconds",
  buckets: [10, 50, 100, 200, 500, 1000, 2000],
  registers: [register],
});

export const latestTransaction = new Gauge({
  name: "latest_transaction",
  help: "Details of the latest transaction",
  labelNames: ["blockNumber", "blockTimestamp", "fee", "hash", "pubkey"],
  registers: [register],
});

export const transactionHash = new Gauge({
    name: 'transaction_hash',
    help: 'Hash of recent transactions',
    labelNames: ['hash'],
    registers: [register]
  });

export const transactionBlockNumber = new Gauge({
    name: 'transaction_block_number',
    help: 'Block number of recent transactions',
    labelNames: ['hash'],
    registers: [register]
  });
  
  export const transactionTimestamp = new Gauge({
    name: 'transaction_timestamp',
    help: 'Timestamp of recent transactions',
    labelNames: ['hash'],
    registers: [register]
  });
  
  export const transactionFee = new Gauge({
    name: 'transaction_fee',
    help: 'Fee of recent transactions',
    labelNames: ['hash'],
    registers: [register]
  });
  
  export const transactionPubkey = new Gauge({
    name: 'transaction_pubkey',
    help: 'Pubkey of recent transactions',
    labelNames: ['pubkey'],
    registers: [register]
  });

const defaultHash = 'default';
const currentTimestamp = Math.floor(Date.now() / 1000);

latestTransaction.labels({
  blockNumber: '0',
  blockTimestamp: new Date(currentTimestamp * 1000).toISOString(),
  fee: '0',
  hash: defaultHash,
  pubkey: defaultHash
}).set(0);
transactionHash.labels(defaultHash).set(0);
transactionBlockNumber.labels(defaultHash).set(0);
transactionTimestamp.labels(defaultHash).set(currentTimestamp);
transactionFee.labels(defaultHash).set(0);
transactionPubkey.labels(defaultHash).set(0);
  
// Register all metrics
[transactionHash, transactionBlockNumber, transactionTimestamp, transactionFee, transactionPubkey].forEach(metric => register.registerMetric(metric));


