import express, { Request, Response } from 'express';
import { RpcClient } from './rpc';
import { DepositTracker } from './deposit-tracker';
import logger from './logger';
import { register } from './metrics';

const app = express();
const PORT = process.env.PORT || 8080;

app.get('/metrics', async (req: Request, res: Response) => {
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
});

async function main() {
  try {
    const rpcClient = new RpcClient();
    const depositTracker = new DepositTracker(rpcClient);
    await depositTracker.startMonitoring();

    app.listen(PORT, () => {
      logger.info(`Server is running on http://localhost:${PORT}`);
    });
  } catch (error) {
    logger.error("Error starting deposit monitoring:", { error });
  }
}

main();

