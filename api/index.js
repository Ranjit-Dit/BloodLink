const { createApp } = require('../backend/src/config/express.config');

let applicationPromise;

// Reuse the app and its MongoDB connection between warm function requests.
module.exports = async (req, res) => {
  try {
    if (!process.env.MONGODB_URL) throw new Error('MONGODB_URL is required for deployment.');
    if (!applicationPromise) {
      applicationPromise = createApp({ serveFrontend: false }).catch(error => {
        applicationPromise = undefined;
        throw error;
      });
    }
    const application = await applicationPromise;
    return application(req, res);
  } catch (error) {
    const frames = String(error.stack || '').split('\n')
      .filter(line => /^\s+at\s/.test(line)).slice(0, 3);
    // Log source locations without including connection strings or credentials.
    console.error('API initialization failed:', error.name, ...frames);
    res.statusCode = 503;
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Cache-Control', 'no-store');
    return res.end(JSON.stringify({
      success: false,
      data: null,
      message: 'The database is unavailable. Please try again later.',
      status: 'SERVICE_UNAVAILABLE',
      options: null,
    }));
  }
};
