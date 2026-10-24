const test = require('node:test');
const assert = require('node:assert/strict');
const { randomUUID } = require('node:crypto');
const { mkdtemp, rm, writeFile } = require('node:fs/promises');
const { tmpdir } = require('node:os');
const { join } = require('node:path');
const mongoose = require('mongoose');
const { createApp } = require('../src/app.js');

let phoneSequence = 7000000000;

const donorInput = (overrides = {}) => ({
  name: 'Anita Sharma',
  bloodGroup: 'O+',
  phone: String(++phoneSequence),
  city: 'Pune',
  available: true,
  ...overrides,
});

const requestInput = (overrides = {}) => ({
  patientName: 'Ravi Kumar',
  bloodGroup: 'O+',
  city: 'Pune',
  hospital: 'City Hospital',
  requesterName: 'Meera Kumar',
  phone: '9876543210',
  units: 2,
  ...overrides,
});

async function fixture(t, options = {}) {
  const mongoUri = process.env.TEST_MONGODB_URI || 'mongodb://127.0.0.1:27017';
  const dbName = `blood_donor_test_${randomUUID().replaceAll('-', '')}`;
  const servers = [];

  t.after(async () => {
    try {
      for (const server of servers) {
        server.closeAllConnections();
        await new Promise((resolve, reject) => {
          server.close((error) => {
            if (error && error.code !== 'ERR_SERVER_NOT_RUNNING') reject(error);
            else resolve();
          });
        });
      }
    } finally {
      try {
        // Only the unique database created for this test may be removed.
        if (mongoose.connection.readyState === 1 && mongoose.connection.name === dbName) {
          await mongoose.connection.dropDatabase();
        }
      } finally {
        await mongoose.disconnect();
      }
    }
  });

  async function start() {
    const app = await createApp({ mongoUri, dbName, ...options });
    const server = app.listen(0, '127.0.0.1');
    await new Promise((resolve, reject) => {
      server.once('listening', resolve);
      server.once('error', reject);
    });
    servers.push(server);
    const baseUrl = `http://127.0.0.1:${server.address().port}`;

    async function api(path, { method = 'GET', body, rawBody } = {}) {
      const options = { method };
      if (body !== undefined || rawBody !== undefined) {
        options.headers = { 'Content-Type': 'application/json' };
        options.body = rawBody === undefined ? JSON.stringify(body) : rawBody;
      }
      const response = await fetch(`${baseUrl}${path}`, options);
      assert.match(response.headers.get('content-type') ?? '', /application\/json/);
      return { status: response.status, body: await response.json() };
    }

    return { api, server, baseUrl };
  }

  return { start, dbName };
}

function success(result, status = 200) {
  assert.equal(result.status, status, JSON.stringify(result.body));
  assert.equal(result.body.success, true);
  assert.ok(Object.hasOwn(result.body, 'data'));
  return result.body.data;
}

function failure(result, status) {
  assert.equal(result.status, status, JSON.stringify(result.body));
  assert.equal(result.body.success, false);
  assert.equal(typeof result.body.message, 'string');
  assert.ok(result.body.message.length > 0);
}

function list(result, count) {
  const data = success(result);
  assert.ok(Array.isArray(data));
  assert.equal(result.body.count, data.length);
  if (count !== undefined) assert.equal(data.length, count);
  return data;
}

test('health and empty collections are available on a new MongoDB database', async (t) => {
  const { api } = await (await fixture(t)).start();
  assert.deepEqual(success(await api('/api/health')), { status: 'ok' });
  list(await api('/api/donors'), 0);
  list(await api('/api/requests'), 0);
});

test('canonical v1 routes and legacy routes operate on the same MongoDB records', async (t) => {
  const { api } = await (await fixture(t)).start();
  assert.deepEqual(success(await api('/api/v1/health')), { status: 'ok' });
  const donor = success(await api('/api/v1/donors', {
    method: 'POST', body: donorInput(),
  }), 201);
  assert.deepEqual(success(await api(`/api/donors/${donor.id}`)), donor);
  const request = success(await api('/api/requests', {
    method: 'POST', body: requestInput(),
  }), 201);
  assert.equal(list(await api(`/api/v1/requests/${request.id}/matches`), 1)[0].id, donor.id);
  success(await api(`/api/v1/donors/${donor.id}/availability`, {
    method: 'PATCH', body: { available: false },
  }));
  assert.equal(success(await api(`/api/donors/${donor.id}`)).available, false);
  list(await api(`/api/requests/${request.id}/matches`), 0);
  failure(await api('/api/v1/donors', {
    method: 'POST', body: donorInput({ bloodGroup: 'invalid' }),
  }), 400);
});

test('donor creation normalizes input and donor edits preserve identity', async (t) => {
  const { api } = await (await fixture(t)).start();
  const donor = success(await api('/api/donors', {
    method: 'POST',
    body: donorInput({ name: '  Anita Sharma  ', bloodGroup: 'ab+', city: '  New   Delhi  ', phone: '+1 (415) 555-0123' }),
  }), 201);

  assert.equal(typeof donor.id, 'string');
  assert.match(donor.id, /^[0-9a-f]{24}$/);
  assert.equal(donor._id, donor.id);
  assert.equal(donor.name, 'Anita Sharma');
  assert.equal(donor.bloodGroup, 'AB+');
  assert.equal(donor.city, 'New Delhi');
  assert.equal(donor.phone, '+14155550123');
  assert.equal(donor.area, '');
  assert.ok(Number.isFinite(Date.parse(donor.createdAt)));
  assert.ok(Number.isFinite(Date.parse(donor.updatedAt)));
  assert.deepEqual(success(await api(`/api/donors/${donor.id}`)), donor);

  const edited = success(await api(`/api/donors/${donor.id}`, {
    method: 'PATCH', body: { city: ' Mumbai ', area: ' Andheri ', bloodGroup: 'b-' },
  }));
  assert.equal(edited.id, donor.id);
  assert.equal(edited.createdAt, donor.createdAt);
  assert.equal(edited.phone, donor.phone);
  assert.equal(edited.city, 'Mumbai');
  assert.equal(edited.area, 'Andheri');
  assert.equal(edited.bloodGroup, 'B-');
  assert.ok(Date.parse(edited.updatedAt) >= Date.parse(donor.updatedAt));

  const unavailable = success(await api(`/api/donors/${donor.id}/availability`, {
    method: 'PATCH', body: { available: false },
  }));
  assert.equal(unavailable.available, false);
  assert.equal(success(await api(`/api/donors/${donor.id}`)).available, false);
});

test('donor filters combine exact blood group, normalized city and availability', async (t) => {
  const { api } = await (await fixture(t)).start();
  const desired = success(await api('/api/donors', {
    method: 'POST', body: donorInput({ city: '  New   Delhi  ', bloodGroup: 'B+' }),
  }), 201);
  for (const overrides of [
    { city: 'New Delhi', bloodGroup: 'AB+' },
    { city: 'New Delhi East', bloodGroup: 'B+' },
    { city: 'New Delhi', bloodGroup: 'B+', available: false },
    { city: 'Mumbai', bloodGroup: 'B+' },
  ]) {
    success(await api('/api/donors', { method: 'POST', body: donorInput(overrides) }), 201);
  }
  const query = new URLSearchParams({ bloodGroup: 'b+', city: ' new   DELHI ', available: 'true' });
  assert.deepEqual(list(await api(`/api/donors?${query}`), 1).map((item) => item.id), [desired.id]);
  const unavailableQuery = new URLSearchParams({ bloodGroup: 'B+', city: 'New Delhi', available: 'false' });
  assert.equal(list(await api(`/api/donors?${unavailableQuery}`), 1)[0].available, false);
});

test('equivalent phone numbers are unique during creation and editing', async (t) => {
  const { api } = await (await fixture(t)).start();
  const first = success(await api('/api/donors', {
    method: 'POST', body: donorInput({ phone: '+1 (415) 555-0123' }),
  }), 201);
  failure(await api('/api/donors', {
    method: 'POST', body: donorInput({ phone: '14155550123' }),
  }), 409);
  const second = success(await api('/api/donors', {
    method: 'POST', body: donorInput({ phone: '9876543210' }),
  }), 201);
  failure(await api(`/api/donors/${second.id}`, {
    method: 'PATCH', body: { phone: '1 415 555 0123' },
  }), 409);
  assert.equal(success(await api(`/api/donors/${second.id}`)).phone, '9876543210');
  success(await api(`/api/donors/${first.id}`, { method: 'PATCH', body: { phone: first.phone } }));
  list(await api('/api/donors'), 2);
});

test('concurrent registrations of equivalent phone numbers create exactly one donor', async (t) => {
  const { api } = await (await fixture(t)).start();
  const formats = ['+1 (415) 555-0123', '14155550123', '1 415 555 0123', '+14155550123'];
  const results = await Promise.all(Array.from({ length: 16 }, (_, index) => api('/api/v1/donors', {
    method: 'POST', body: donorInput({ name: `Donor ${index + 1}`, phone: formats[index % formats.length] }),
  })));
  const created = results.filter((result) => result.status === 201);
  assert.equal(created.length, 1, JSON.stringify(results));
  for (const result of results) {
    if (result.status === 201) success(result, 201);
    else failure(result, 409);
  }
  const [donor] = list(await api('/api/donors'), 1);
  assert.equal(donor.id, created[0].body.data.id);
  assert.equal(await mongoose.connection.collection('donors').countDocuments(), 1);
});

test('invalid donor inputs cannot create or overwrite records', async (t) => {
  const { api } = await (await fixture(t)).start();
  const invalidBodies = [
    donorInput({ name: 'A' }),
    donorInput({ name: 'a'.repeat(81) }),
    donorInput({ bloodGroup: 'O' }),
    donorInput({ phone: '123456' }),
    donorInput({ phone: '1'.repeat(16) }),
    donorInput({ phone: '1234567abc' }),
    donorInput({ city: '   ' }),
    donorInput({ available: 'true' }),
    donorInput({ area: null }),
    donorInput({ id: 'injected-id' }),
    donorInput({ createdAt: '2000-01-01' }),
    donorInput({ constructor: { prototype: { injected: true } } }),
    null,
    [],
    'not an object',
  ];
  for (const body of invalidBodies) {
    failure(await api('/api/donors', { method: 'POST', body }), 400);
  }
  failure(await api('/api/donors', {
    method: 'POST',
    rawBody: JSON.stringify(donorInput()).slice(0, -1) + ',"__proto__":{"injected":true}}',
  }), 400);
  assert.equal({}.injected, undefined);
  list(await api('/api/donors'), 0);

  const donor = success(await api('/api/donors', { method: 'POST', body: donorInput() }), 201);
  for (const body of [{}, { id: 'replaced' }, { available: null }, { name: '' }, []]) {
    failure(await api(`/api/donors/${donor.id}`, { method: 'PATCH', body }), 400);
  }
  for (const body of [{}, { available: 'false' }, { available: false, name: 'Changed' }]) {
    failure(await api(`/api/donors/${donor.id}/availability`, { method: 'PATCH', body }), 400);
  }
  assert.deepEqual(success(await api(`/api/donors/${donor.id}`)), donor);
});

test('malformed JSON, ambiguous filters and unsupported filter values return JSON errors', async (t) => {
  const { api } = await (await fixture(t)).start();
  failure(await api('/api/donors', { method: 'POST', rawBody: '{"name":' }), 400);
  failure(await api('/api/requests', { method: 'POST', rawBody: '{' }), 400);
  for (const path of [
    '/api/donors?available=yes',
    '/api/donors?bloodGroup=invalid',
    '/api/donors?city=Pune&city=Mumbai',
    '/api/donors?available=true&available=false',
    '/api/requests?status=invalid',
    '/api/requests?urgency=critical',
    '/api/requests?bloodGroup=invalid',
    '/api/requests?status=open&status=fulfilled',
  ]) {
    failure(await api(path), 400);
  }
});

test('requests use defaults and filter by status, urgency, exact blood group and city', async (t) => {
  const { api } = await (await fixture(t)).start();
  const desired = success(await api('/api/requests', {
    method: 'POST', body: requestInput({ bloodGroup: 'b-', city: '  New   Delhi  ' }),
  }), 201);
  assert.equal(desired.status, 'open');
  assert.equal(desired.urgency, 'urgent');
  assert.equal(desired.bloodGroup, 'B-');
  assert.equal(desired.city, 'New Delhi');
  assert.ok(Number.isFinite(Date.parse(desired.createdAt)));
  assert.deepEqual(success(await api(`/api/requests/${desired.id}`)), desired);

  for (const overrides of [
    { bloodGroup: 'AB-', city: 'New Delhi' },
    { bloodGroup: 'B-', city: 'New Delhi East' },
    { bloodGroup: 'B-', city: 'New Delhi', urgency: 'normal' },
  ]) {
    success(await api('/api/requests', { method: 'POST', body: requestInput(overrides) }), 201);
  }
  const closed = success(await api('/api/requests', {
    method: 'POST', body: requestInput({ bloodGroup: 'B-', city: 'New Delhi' }),
  }), 201);
  success(await api(`/api/requests/${closed.id}/status`, { method: 'PATCH', body: { status: 'fulfilled' } }));

  const query = new URLSearchParams({ bloodGroup: 'B-', city: 'new delhi', status: 'open', urgency: 'urgent' });
  assert.deepEqual(list(await api(`/api/requests?${query}`), 1).map((item) => item.id), [desired.id]);
  list(await api('/api/requests?status=fulfilled'), 1);
  list(await api('/api/requests?urgency=normal'), 1);
});

test('matching includes only available donors in the same group and city with a contact draft', async (t) => {
  const { api } = await (await fixture(t)).start();
  const matchingDonor = success(await api('/api/donors', {
    method: 'POST', body: donorInput({ bloodGroup: 'O+', city: 'Pune' }),
  }), 201);
  for (const overrides of [
    { bloodGroup: 'O+', city: 'Pune', available: false },
    { bloodGroup: 'O-', city: 'Pune' },
    { bloodGroup: 'AB+', city: 'Pune' },
    { bloodGroup: 'O+', city: 'Pune East' },
    { bloodGroup: 'O+', city: 'Mumbai' },
  ]) {
    success(await api('/api/donors', { method: 'POST', body: donorInput(overrides) }), 201);
  }
  const request = success(await api('/api/requests', {
    method: 'POST', body: requestInput({ city: ' pune ', hospital: 'Central Hospital', phone: '9876501234' }),
  }), 201);
  const [match] = list(await api(`/api/requests/${request.id}/matches`), 1);
  assert.equal(match.id, matchingDonor.id);
  assert.equal(match.phone, matchingDonor.phone);
  assert.equal(typeof match.contactMessage, 'string');
  assert.ok(match.contactMessage.includes('Central Hospital'));
  assert.ok(match.contactMessage.includes('9876501234'));

  success(await api(`/api/donors/${matchingDonor.id}/availability`, {
    method: 'PATCH', body: { available: false },
  }));
  list(await api(`/api/requests/${request.id}/matches`), 0);
});

test('closed requests stop matching and reopening permits matching again', async (t) => {
  const { api } = await (await fixture(t)).start();
  success(await api('/api/donors', { method: 'POST', body: donorInput() }), 201);
  const request = success(await api('/api/requests', { method: 'POST', body: requestInput() }), 201);

  for (const status of ['fulfilled', 'cancelled']) {
    const closed = success(await api(`/api/requests/${request.id}/status`, { method: 'PATCH', body: { status } }));
    assert.equal(closed.status, status);
    failure(await api(`/api/requests/${request.id}/matches`), 409);
    const reopened = success(await api(`/api/requests/${request.id}/status`, {
      method: 'PATCH', body: { status: 'open' },
    }));
    assert.equal(reopened.status, 'open');
    list(await api(`/api/requests/${request.id}/matches`), 1);
  }
});

test('invalid request creation and status updates preserve stored state', async (t) => {
  const { api } = await (await fixture(t)).start();
  for (const body of [
    requestInput({ patientName: '' }),
    requestInput({ bloodGroup: 'A' }),
    requestInput({ hospital: '' }),
    requestInput({ requesterName: '' }),
    requestInput({ city: '' }),
    requestInput({ phone: 'short' }),
    requestInput({ units: 0 }),
    requestInput({ units: 21 }),
    requestInput({ units: 1.5 }),
    requestInput({ units: '2' }),
    requestInput({ urgency: 'critical' }),
    requestInput({ message: 123 }),
    requestInput({ status: 'fulfilled' }),
    requestInput({ id: 'injected' }),
    null,
    [],
  ]) {
    failure(await api('/api/requests', { method: 'POST', body }), 400);
  }
  list(await api('/api/requests'), 0);
  const request = success(await api('/api/requests', { method: 'POST', body: requestInput() }), 201);
  for (const body of [{}, { status: 'closed' }, { status: 'open', units: 4 }, null, []]) {
    failure(await api(`/api/requests/${request.id}/status`, { method: 'PATCH', body }), 400);
  }
  assert.deepEqual(success(await api(`/api/requests/${request.id}`)), request);
});

test('deleted records disappear and missing resource operations return 404', async (t) => {
  const { api } = await (await fixture(t)).start();
  const donor = success(await api('/api/donors', { method: 'POST', body: donorInput() }), 201);
  const request = success(await api('/api/requests', { method: 'POST', body: requestInput() }), 201);
  assert.deepEqual(success(await api(`/api/donors/${donor.id}`, { method: 'DELETE' })), { id: donor.id });
  assert.deepEqual(success(await api(`/api/requests/${request.id}`, { method: 'DELETE' })), { id: request.id });
  list(await api('/api/donors'), 0);
  list(await api('/api/requests'), 0);
  for (const [path, options] of [
    [`/api/donors/${donor.id}`, {}],
    [`/api/donors/${donor.id}`, { method: 'DELETE' }],
    [`/api/donors/${donor.id}`, { method: 'PATCH', body: { city: 'Mumbai' } }],
    [`/api/donors/${donor.id}/availability`, { method: 'PATCH', body: { available: false } }],
    [`/api/requests/${request.id}`, {}],
    [`/api/requests/${request.id}`, { method: 'DELETE' }],
    [`/api/requests/${request.id}/matches`, {}],
    [`/api/requests/${request.id}/status`, { method: 'PATCH', body: { status: 'fulfilled' } }],
    ['/api/does-not-exist', {}],
    ['/api/v1/does-not-exist', {}],
    ['/api/donors/not-an-object-id', {}],
    ['/api/v1/requests/not-an-object-id', {}],
    ['/api/v1/donors/000000000000000000000000', {}],
  ]) {
    failure(await api(path, options), 404);
  }
});

test('donors, availability and request status persist across app instances', async (t) => {
  const environment = await fixture(t);
  const first = await environment.start();
  const donor = success(await first.api('/api/donors', { method: 'POST', body: donorInput() }), 201);
  const request = success(await first.api('/api/requests', { method: 'POST', body: requestInput() }), 201);
  success(await first.api(`/api/donors/${donor.id}/availability`, { method: 'PATCH', body: { available: false } }));
  success(await first.api(`/api/requests/${request.id}/status`, { method: 'PATCH', body: { status: 'fulfilled' } }));
  const storedDonor = await mongoose.connection.collection('donors').findOne({
    _id: new mongoose.Types.ObjectId(donor.id),
  });
  const storedRequest = await mongoose.connection.collection('bloodrequests').findOne({
    _id: new mongoose.Types.ObjectId(request.id),
  });
  assert.ok(storedDonor, 'A donor document must exist in MongoDB');
  assert.ok(storedRequest, 'A blood request document must exist in MongoDB');
  assert.equal(storedDonor.name, donor.name);
  assert.equal(storedDonor.available, false);
  assert.equal(storedRequest.status, 'fulfilled');
  assert.ok(storedDonor.createdAt instanceof Date);
  assert.ok(storedRequest.createdAt instanceof Date);
  first.server.closeAllConnections();
  await new Promise((resolve, reject) => first.server.close((error) => error ? reject(error) : resolve()));

  const second = await environment.start();
  assert.equal(success(await second.api(`/api/donors/${donor.id}`)).available, false);
  assert.equal(success(await second.api(`/api/requests/${request.id}`)).status, 'fulfilled');
  list(await second.api('/api/donors'), 1);
  list(await second.api('/api/requests'), 1);
});

test('concurrent donor writes retain every successful MongoDB record', async (t) => {
  const environment = await fixture(t);
  const first = await environment.start();
  const results = await Promise.all(Array.from({ length: 16 }, (_, index) => first.api('/api/donors', {
    method: 'POST', body: donorInput({ name: `Donor ${index + 1}` }),
  })));
  const createdIds = results.map((result) => success(result, 201).id);
  assert.equal(new Set(createdIds).size, 16);
  assert.deepEqual(new Set(list(await first.api('/api/donors'), 16).map((item) => item.id)), new Set(createdIds));

  first.server.closeAllConnections();
  await new Promise((resolve, reject) => first.server.close((error) => error ? reject(error) : resolve()));
  const second = await environment.start();
  assert.deepEqual(new Set(list(await second.api('/api/donors'), 16).map((item) => item.id)), new Set(createdIds));
});

test('React fallback serves browser pages while missing API routes and assets stay 404', async (t) => {
  const frontendDir = await mkdtemp(join(tmpdir(), 'blood-donor-react-test-'));
  t.after(() => rm(frontendDir, { recursive: true, force: true }));
  const markup = '<!doctype html><html><body><div id="root">Blood Donor Finder</div></body></html>';
  await writeFile(join(frontendDir, 'index.html'), markup);
  const { api, baseUrl } = await (await fixture(t, { frontendDir })).start();
  for (const path of ['/', '/donors', '/requests/new']) {
    const response = await fetch(`${baseUrl}${path}`, { headers: { Accept: 'text/html' } });
    assert.equal(response.status, 200);
    assert.match(response.headers.get('content-type') || '', /text\/html/);
    assert.equal(await response.text(), markup);
  }
  for (const path of ['/api/does-not-exist', '/api/v1/does-not-exist']) {
    const response = await fetch(`${baseUrl}${path}`, { headers: { Accept: 'text/html' } });
    assert.equal(response.status, 404);
    assert.match(response.headers.get('content-type') || '', /application\/json/);
    assert.equal((await response.json()).success, false);
  }
  failure(await api('/assets/does-not-exist.js'), 404);
  failure(await api('/requests/new', { method: 'POST', body: {} }), 404);
});
