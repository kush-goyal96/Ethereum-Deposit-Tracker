import { RpcClient } from "./rpc";
import { Alchemy } from "alchemy-sdk";
import { Web3 } from "web3";
import { Deposit } from "./types";
import { sendTelegramMessage } from "./telegram-bot";
import logger from "./logger";
import dotenv from "dotenv";
import { updateMetrics } from "./metric-updater";

dotenv.config({ path: "./.env" });
const rpcClient = new RpcClient();
const apiKey = rpcClient.getApiKey();
const web3 = new Web3(`https://eth-mainnet.alchemyapi.io/v2/${apiKey}`);


export class DepositTracker {
  private alchemy: Alchemy;
  private beaconDepositContractAddress =
    "0x00000000219ab540356cBB839Cbe05303d7705Fa";

  constructor(rpcClient: RpcClient) {
    this.alchemy = rpcClient.getAlchemy();
  }

  async startMonitoring() {
    const filter = {
      address: this.beaconDepositContractAddress,
      topics: [
        "0x649bbc62d0e31342afea4e5cd82d4049e7e1ee912fc0889aa790803be39038c5",
      ],
    };

    this.alchemy.ws.on(filter, async (txn) => {
      try {
        const receipt = await web3.eth.getTransactionReceipt(
          txn.transactionHash
        );
        if (
          receipt &&
          receipt.logs &&
          receipt.logs.length > 0 &&
          receipt.logs[0].data
        ) {
          const decodedData = this.decodeDepositEventData(receipt.logs[0].data);
          const block = await web3.eth.getBlock(txn.blockNumber);

          const deposit: Deposit = {
            blockNumber: txn.blockNumber,
            blockTimestamp: Number(block.timestamp),
            blockTimestampISO: new Date(
              Number(block.timestamp) * 1000
            ).toISOString(),
            fee: await this.calculateFee(receipt),
            hash: txn.transactionHash,
            pubkey: decodedData.pubkey,
          };

          logger.info("New Deposit:", { deposit });
          sendTelegramMessage(deposit);

          updateMetrics(deposit);
        } else {
          logger.warn("Invalid receipt or missing log data", {
            transactionHash: txn.transactionHash,
          });
        }
      } catch (error) {
        logger.error("Error processing deposit:", {
          error,
          transactionHash: txn.transactionHash,
        });
      }
    });

    logger.info("Deposit monitoring started");
  }

  private async calculateFee(receipt: any): Promise<string> {
    if (receipt.gasUsed) {
      const transaction = await web3.eth.getTransaction(
        receipt.transactionHash
      );
      if (transaction && transaction.gasPrice) {
        const feeWei = BigInt(transaction.gasPrice) * BigInt(receipt.gasUsed);
        return web3.utils.fromWei(feeWei.toString(), "ether");
      }
    }
    return "0";
  }

  private safelyParseBigInt(value: string): string {
    if (!value || value === "0x") {
      return "0";
    }
    try {
      return BigInt(value).toString();
    } catch (error) {
      logger.error(`Error parsing BigInt:`, { value, error });
      return "0";
    }
  }

  decodeDepositEventData(data: string): {
    pubkey: string;
    amount: string;
  } {
    logger.debug("Raw deposit event data:", { data });
    const cleanData = data.startsWith("0x") ? data.slice(2) : data;

    const pubkeyStart = 160 * 2;
    const pubkey1 = "0x" + cleanData.slice(pubkeyStart, pubkeyStart + 96);
    const pubkey = pubkey1.slice(0, 2) + pubkey1.slice(66);

    const amountStart = 320 * 2;
    const amountHex = "0x" + cleanData.slice(amountStart, amountStart + 64);
    const amount = this.safelyParseBigInt(amountHex);

    logger.debug("Decoded deposit event data:", {
      pubkey,
      amount,
    });
    return { pubkey, amount };
  }
}
