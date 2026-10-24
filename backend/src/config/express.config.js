const express = require('express');
const cors = require('cors');
const path = require('node:path');
const fs = require('node:fs');
const { connectDatabase } = require('./db.config');
const router = require('./router.config');
const DonorModel = require('../modules/donor/donor.model');
const BloodRequestModel = require('../modules/blood-request/blood-request.model');
const { notFound, errorHandler } = require('../middlewares/error-handler.middleware');

const createApp = async ({ mongoUri, dbName, frontendDir = path.resolve(__dirname, '../../../frontend/dist') } = {}) => {
  await connectDatabase({ mongoUri, dbName });
  // Build unique indexes before accepting concurrent registrations.
  await Promise.all([DonorModel.createIndexes(), BloodRequestModel.createIndexes()]);
  const application = express();
  application.disable('x-powered-by');
  application.set('query parser', 'simple');
  application.use(cors({ origin: ['http://127.0.0.1:5173', 'http://localhost:5173'] }));
  application.use(express.json({ limit: '16kb' }));
  application.use('/api', (_req, res, next) => { res.set('Cache-Control', 'no-store'); next(); });
  application.use('/api/v1', router);
  application.use('/api', router); // Retains compatibility with the original Postman collection.
  application.use('/api', notFound);
  application.use(express.static(frontendDir));
  application.get('*', (req, res, next) => {
    const indexFile = path.join(frontendDir, 'index.html');
    if (!path.extname(req.path) && req.accepts('html') && fs.existsSync(indexFile)) return res.sendFile(indexFile);
    return next();
  });
  application.use(notFound);
  application.use(errorHandler);
  return application;
};

module.exports = { createApp };
