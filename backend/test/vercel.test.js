const test = require('node:test');
const assert = require('node:assert/strict');
const { createServer } = require('node:http');
const { randomUUID } = require('node:crypto');
const mongoose = require('mongoose');
const handler = require('../../api/index.js');

test('Vercel adapter recovers from missing configuration and serves only the API', async (t) => {
  const mongoUri = process.env.TEST_MONGODB_URI || 'mongodb://127.0.0.1:27017';
  const dbName = `blood_donor_test_${randomUUID().replaceAll('-', '')}`;
  const savedEnvironment = Object.fromEntries(
    ['MONGODB_URL', 'MONGODB_NAME'].map(key => [key, process.env[key]]),
  );
  const server = createServer(handler);

  t.after(async () => {
    try {
      server.closeAllConnections();
      await new Promise((resolve, reject) => {
        server.close(error => {
          if (error && error.code !== 'ERR_SERVER_NOT_RUNNING') reject(error);
          else resolve();
        });
      });
    } finally {
      try {
        // Never drop the application database or any database not owned by this test.
        if (mongoose.connection.readyState === 1 && mongoose.connection.name === dbName) {
          await mongoose.connection.dropDatabase();
        }
      } finally {
        try {
          await mongoose.disconnect();
        } finally {
          for (const [key, value] of Object.entries(savedEnvironment)) {
            if (value === undefined) delete process.env[key];
            else process.env[key] = value;
          }
        }
      }
    }
  });

  process.env.MONGODB_NAME = dbName;
  delete process.env.MONGODB_URL;
  await new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(0, '127.0.0.1', resolve);
  });
  const baseUrl = `http://127.0.0.1:${server.address().port}`;

  async function api(path, { body, method = 'GET', accept = 'application/json' } = {}) {
    const headers = { Accept: accept };
    if (body !== undefined) headers['Content-Type'] = 'application/json';
    const response = await fetch(`${baseUrl}${path}`, {
      method,
      headers,
      ...(body === undefined ? {} : { body: JSON.stringify(body) }),
    });
    assert.match(response.headers.get('content-type') || '', /application\/json/);
    return { response, body: await response.json() };
  }

  await t.test('missing hosted database configuration returns a JSON 503', async () => {
    const result = await api('/api/v1/health');
    assert.equal(result.response.status, 503);
    assert.equal(result.response.headers.get('cache-control'), 'no-store');
    assert.equal(result.body.success, false);
    assert.equal(result.body.status, 'SERVICE_UNAVAILABLE');
    assert.equal(result.body.data, null);
  });

  await t.test('supplying configuration lets concurrent first requests succeed in the same instance', async () => {
    process.env.MONGODB_URL = mongoUri;
    const paths = ['/api/v1/health', '/api/v1/donors', '/api/v1/requests'];
    const results = await Promise.all(Array.from({ length: 12 }, (_, index) => api(paths[index % paths.length])));

    for (let index = 0; index < results.length; index += 1) {
      const result = results[index];
      assert.equal(result.response.status, 200, JSON.stringify(result.body));
      assert.equal(result.body.success, true);
      assert.equal(result.response.headers.get('cache-control'), 'no-store');
      if (index % paths.length === 0) assert.deepEqual(result.body.data, { status: 'ok' });
      else assert.deepEqual(result.body.data, []);
    }
    assert.equal(mongoose.connection.name, dbName);
  });

  await t.test('donor creation and reads persist through the adapter', async () => {
    const input = {
      name: 'Vercel Test Donor',
      bloodGroup: 'O+',
      phone: '9876501234',
      city: 'Pune',
      available: true,
    };
    const created = await api('/api/v1/donors', { method: 'POST', body: input });
    assert.equal(created.response.status, 201, JSON.stringify(created.body));
    assert.equal(created.body.success, true);
    assert.match(created.body.data.id, /^[0-9a-f]{24}$/);

    const fetched = await api(`/api/v1/donors/${created.body.data.id}`);
    assert.equal(fetched.response.status, 200);
    assert.deepEqual(fetched.body.data, created.body.data);

    const listed = await api('/api/v1/donors');
    assert.equal(listed.response.status, 200);
    assert.equal(listed.body.count, 1);
    assert.equal(listed.body.data[0].id, created.body.data.id);
    const stored = await mongoose.connection.collection('donors').findOne({
      _id: new mongoose.Types.ObjectId(created.body.data.id),
    });
    assert.equal(stored.name, input.name);
  });

  await t.test('unknown API routes return JSON 404 even for browser requests', async () => {
    for (const path of ['/api/v1/does-not-exist', '/api/does-not-exist']) {
      const result = await api(path, { accept: 'text/html' });
      assert.equal(result.response.status, 404);
      assert.equal(result.body.success, false);
      assert.equal(typeof result.body.message, 'string');
    }
  });

  await t.test('React page routes are left for the Vercel CDN instead of served by Express', async () => {
    const result = await api('/donors', { accept: 'text/html' });
    assert.equal(result.response.status, 404);
    assert.equal(result.body.success, false);
  });
});
