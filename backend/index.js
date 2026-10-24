const path = require('node:path');
require('dotenv').config({ path: path.join(__dirname, '.env'), quiet: true });
const mongoose = require('mongoose');
const { createApp } = require('./src/config/express.config');

const startServer = async () => {
  const port = Number(process.env.PORT || 3000);
  const host = process.env.HOST || '127.0.0.1';
  if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error('PORT must be an integer between 1 and 65535.');
  const application = await createApp();
  const server = application.listen(port, host, () => console.log(`Blood Donor Finder: http://${host}:${port}`));
  server.on('error', async error => { console.error(`Cannot start server: ${error.message}`); await mongoose.disconnect(); process.exitCode = 1; });
  for (const signal of ['SIGINT', 'SIGTERM']) {
    process.once(signal, () => server.close(async () => { await mongoose.disconnect(); process.exit(0); }));
  }
};

startServer().catch(async error => {
  console.error(`Cannot start server: ${error.message}`);
  console.error('Start MongoDB (npm run db:dev for local development), or configure MONGODB_URL and MONGODB_NAME.');
  await mongoose.disconnect();
  process.exitCode = 1;
});
