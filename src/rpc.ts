import { Alchemy, Network, Filter } from "alchemy-sdk";
import dotenv from "dotenv";

dotenv.config({ path: "./.env" });
if (!process.env.API_KEY) {
  throw new Error("API key is not defined");
}

export class RpcClient {
  private alchemy: Alchemy;
  private apiKey: string;
  private network: Network;

  constructor() {
    this.apiKey = process.env.API_KEY ?? "";
    this.network = Network.ETH_MAINNET;
    this.alchemy = new Alchemy({
      apiKey: this.apiKey,
      network: this.network,
    });
  }

  getApiKey(): string {
    return this.apiKey;
  }

  getAlchemy(): Alchemy {
    return this.alchemy;
  }
}
