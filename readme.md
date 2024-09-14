# Ethereum Deposit Tracker: Setup and Deployment Guide

## Prerequisites

- Node.js (version 14.0.0 or higher)
- npm (usually comes with Node.js)
- Git
- GitHub account
- Prometheus (for metrics collection)
- Grafana (for metrics visualization)
- Telegram Bot (for notifications)

## Setup

1. Clone the repository:
   ```
   git clone https://github.com/your-username/ethereum-deposit-tracker.git
   cd ethereum-deposit-tracker
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Create a `.env` file in the root directory and add your Telegram bot token and chat ID:
   ```
   TELEGRAM_BOT_TOKEN="your_bot_token_here"
   TELEGRAM_CHAT_ID="your_chat_id_here"
   ```

4. Update the Alchemy API key in `src/rpc.ts` if necessary:
   ```typescript
   this.apiKey = 'your_alchemy_api_key_here';
   ```

## Telegram Bot Setup

1. Create a new bot on Telegram:
   - Start a chat with BotFather on Telegram.
   - Send the command `/newbot` and follow the prompts to create your bot.
   - Save the API token provided by BotFather.

2. Get your chat ID:
   - Start a chat with your new bot.
   - Visit `https://api.telegram.org/bot<YourBOTToken>/getUpdates` in your browser.
   - Look for the `"chat":{"id":` field in the response to find your chat ID.

3. Update the `.env` file with your bot token and chat ID.

The Telegram bot is configured in `src/telegram-bot.ts` and uses the `node-fetch` library to send messages to the Telegram API.

## Winston Logger

The application uses Winston for logging. The logger is configured in `src/logger.ts`:

- Console logging is enabled with colorized output.
- File logging is set up with two files:
  - `logs/info.log`: Contains all log levels except errors.
  - `logs/error.log`: Contains only error logs.

Log levels used: `error`, `warn`, `info`, `debug`.

To use the logger in your code:

```typescript
import logger from './logger';

logger.info('This is an info message');
logger.error('This is an error message');
```

## Running the Application

1. Start the application:
   ```
   npm start
   ```

2. The server should now be running on `http://localhost:8080` (or the port specified in your environment).

3. To access metrics, navigate to `http://localhost:8080/metrics` in your browser.

## Prometheus Configuration

1. Ensure Prometheus is installed on your system or server.

2. Update your `prometheus.yml` configuration file:

   ```yaml
   global:
     scrape_interval: 15s

   scrape_configs:
     - job_name: "deposit_tracker"
       static_configs:
         - targets: ["app:9090"]
   ```

   Note: Replace `app:9090` with the appropriate hostname and port where your application is running.

3. Restart Prometheus to apply the new configuration.

## Metrics

The application exposes the following metrics:

- `deposits_total`: Total number of deposits
- `deposit_amount`: Amount of the last deposit in ETH
- `deposit_fee`: Fee of the last deposit in ETH
- `last_block_number`: Number of the last processed block
- `transaction_timestamp`: Timestamp of the last transaction
- `block_processing_time`: Time taken to process each block in milliseconds

## Grafana Setup

Grafana can be used to create visual dashboards for the metrics collected by Prometheus:

1. Install and set up Grafana on your system or server.

2. Add Prometheus as a data source in Grafana:
   - Go to Configuration > Data Sources > Add data source
   - Select Prometheus
   - Set the URL to your Prometheus server (e.g., `http://localhost:9090`)
   - Click "Save & Test" to ensure the connection is working

3. Create a new dashboard:
   - Click the "+" icon in the sidebar and select "Dashboard"
   - Add panels for each metric you want to visualize
   - Use PromQL queries to fetch and display the data

4. Some example queries for your panels:
   - Total deposits: `deposits_total`
   - Deposit amount over time: `deposit_amount`
   - Block processing time: `block_processing_time`

5. Save your dashboard and set up any desired alerts.

## Pushing to GitHub

1. Create a new repository on GitHub (if you haven't already).

2. Initialize Git in your project folder (if not already initialized):
   ```
   git init
   ```

3. Add all files to Git:
   ```
   git add .
   ```

4. Commit your changes:
   ```
   git commit -m "Initial commit"
   ```

5. Add your GitHub repository as a remote:
   ```
   git remote add origin https://github.com/your-username/your-repo-name.git
   ```

6. Push your code to GitHub:
   ```
   git push -u origin main
   ```

## Important Notes

- Ensure that your `.env` file is included in `.gitignore` to keep your sensitive information private.
- The `logs/` directory is also ignored by Git, so you may need to create it manually on your deployment environment.
- Make sure to update any hardcoded API keys or URLs before deploying to production.
- The Prometheus configuration file (`prometheus.yml`) should be managed separately from your application code, typically on the server where Prometheus is running.

## Monitoring

- Check the `logs/` directory for `info.log` and `error.log` files.
- Prometheus metrics are exposed at the `/metrics` endpoint.
- Use Grafana dashboards to visualize the collected metrics and set up alerts.
- Telegram notifications are sent for each new deposit detected.