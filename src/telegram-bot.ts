import fetch from 'node-fetch';
import dotenv from 'dotenv';
import logger from './logger'; // Assuming you have a logger set up

dotenv.config({ path: './.env' });

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const CHAT_ID = process.env.TELEGRAM_CHAT_ID; 

// Function to send a message to the Telegram bot
export async function sendTelegramMessage(deposit: any) {
  if (!BOT_TOKEN || !CHAT_ID) {
    logger.error('Telegram bot token or chat ID is missing', { BOT_TOKEN: !!BOT_TOKEN, CHAT_ID: !!CHAT_ID });
    return;
  }

  const message = `
🚨New Deposit Detected🚨:
- Block Number: ${deposit.blockNumber}
- Timestamp: ${deposit.blockTimestampISO}
- Fee: ${deposit.fee} ETH
- Transaction Hash: ${deposit.hash}
- Pubkey: ${deposit.pubkey}
  `;

  try {
    logger.info('Attempting to send Telegram message', { CHAT_ID });
    const response = await fetch(
      `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          chat_id: CHAT_ID,
          text: message,
          parse_mode: "Markdown",
        }),
      }
    );

    const data = await response.json();
    if (!data.ok) {
      logger.error("Failed to send message:", data);
      if (data.error_code === 404) {
        logger.error("Bot token may be invalid or chat not initialized");
      } else if (data.error_code === 400) {
        logger.error("Bad request. Check if the chat ID is correct");
      }
    } else {
      logger.info("Message sent successfully");
    }
  } catch (error) {
    logger.error("Error sending Telegram message:", error);
  }
}
