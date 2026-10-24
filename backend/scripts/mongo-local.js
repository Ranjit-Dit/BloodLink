const path = require('node:path');
const fs = require('node:fs');
const { MongoMemoryServer } = require('mongodb-memory-server-core');

// Runs a real local mongod with persistent disk storage for development.
// A normal MongoDB installation or Atlas connection can be used instead.
const startMongo = async () => {
  const root = path.resolve(__dirname, '..');
  const dbPath = path.join(root, '.local-mongo');
  fs.mkdirSync(dbPath, { recursive: true });
  const database = await MongoMemoryServer.create({
    binary: { version: '8.0.17', downloadDir: path.join(root, '.cache/mongodb-binaries') },
    instance: { ip: '127.0.0.1', port: 27017, portGeneration: false, dbPath, storageEngine: 'wiredTiger' },
  });
  if (database.instanceInfo.port !== 27017) {
    await database.stop();
    throw new Error('Port 27017 is already in use. Use your running MongoDB server instead.');
  }
  console.log('MongoDB development server: mongodb://127.0.0.1:27017');
  console.log('Data persists in .local-mongo/. Keep this terminal running.');
  for (const signal of ['SIGINT', 'SIGTERM']) process.once(signal, async () => { await database.stop({ doCleanup: false }); process.exit(0); });
  // Keep the parent process alive while mongod runs.
  setInterval(() => {}, 60000);
};

startMongo().catch(error => { console.error(error.message); process.exitCode = 1; });
