import {
  depositCounter,
  depositAmount,
  depositFee,
  blockNumber,
  transactionBlockNumber,
  transactionTimestamp,
  transactionFee,
  transactionPubkey,
  transactionHash,
  latestTransaction,
} from "./metrics";

import { Deposit } from "./types";

export function updateMetrics(deposit: Deposit) {
  const labels = {
    hash: deposit.hash,
    pubkey: deposit.pubkey,
    blockNumber: deposit.blockNumber.toString(),
  };

  depositCounter.inc();
  depositAmount.set(32);
  depositFee.set(parseFloat(deposit.fee));
  blockNumber.set(deposit.blockNumber);

  const timestamp = deposit.blockTimestamp;

  transactionHash.labels(deposit.hash).set(1);
  transactionBlockNumber.set(deposit.blockNumber);
  transactionTimestamp.set(timestamp);
  transactionFee.set(parseFloat(deposit.fee));
  transactionPubkey.labels(deposit.pubkey).set(1);

  latestTransaction.set(
    {
      blockNumber: deposit.blockNumber.toString(),
      blockTimestamp: deposit.blockTimestampISO,
      fee: deposit.fee,
      hash: deposit.hash,
      pubkey: deposit.pubkey,
    },
    1
  );

}
