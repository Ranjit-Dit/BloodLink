const fs = require('node:fs');
const path = require('node:path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env'), quiet: true });
const mongoose = require('mongoose');
const { connectDatabase } = require('../src/config/db.config');
const DonorModel = require('../src/modules/donor/donor.model');
const BloodRequestModel = require('../src/modules/blood-request/blood-request.model');
const { DonorCreateDTO } = require('../src/modules/donor/donor.request');
const { BloodRequestCreateDTO } = require('../src/modules/blood-request/blood-request.request');
const { REQUEST_STATUSES } = require('../src/constants/domain.constant');

const validateRecord = (record, dto, fields) => {
  const input = Object.fromEntries(fields.filter(key => record[key] !== undefined).map(key => [key, record[key]]));
  const { value, error } = dto.validate(input, { convert: false, abortEarly: false });
  if (error) throw new Error(`Cannot import record ${record.id || '(missing id)'}: ${error.message}`);
  if (typeof record.id !== 'string' || !record.id) throw new Error('Legacy records must have an id.');
  const createdAt = new Date(record.createdAt);
  const updatedAt = new Date(record.updatedAt);
  if (!Number.isFinite(createdAt.getTime()) || !Number.isFinite(updatedAt.getTime())) throw new Error('Legacy record has an invalid timestamp.');
  return { ...value, legacyId: record.id, cityKey: value.city.toLowerCase(), createdAt, updatedAt };
};

const migrate = async () => {
  const file = path.resolve(process.argv[2] || path.join(__dirname, '../data/db.json'));
  const source = JSON.parse(fs.readFileSync(file, 'utf8'));
  if (!Array.isArray(source.donors) || !Array.isArray(source.requests)) throw new Error('Expected donors and requests arrays.');
  // Validate the complete source before writing anything. The source stays untouched.
  const donors = source.donors.map(record => {
    const data = validateRecord(record, DonorCreateDTO, ['name', 'bloodGroup', 'phone', 'city', 'area', 'available']);
    return { ...data, phoneKey: data.phone.replace(/\D/g, '') };
  });
  const requests = source.requests.map(record => {
    const data = validateRecord(record, BloodRequestCreateDTO, ['patientName', 'bloodGroup', 'city', 'hospital', 'requesterName', 'phone', 'units', 'urgency', 'message']);
    if (!REQUEST_STATUSES.includes(record.status)) throw new Error('Legacy request has an invalid status.');
    return { ...data, status: record.status };
  });
  await connectDatabase();
  await Promise.all([DonorModel.createIndexes(), BloodRequestModel.createIndexes()]);
  let donorsAdded = 0;
  let requestsAdded = 0;
  for (const donor of donors) {
    const result = await DonorModel.updateOne({ phoneKey: donor.phoneKey }, { $setOnInsert: donor }, { upsert: true, timestamps: false, runValidators: true });
    donorsAdded += result.upsertedCount;
  }
  for (const request of requests) {
    const result = await BloodRequestModel.updateOne({ legacyId: request.legacyId }, { $setOnInsert: request }, { upsert: true, timestamps: false, runValidators: true });
    requestsAdded += result.upsertedCount;
  }
  console.log(`Migration complete: ${donorsAdded} donor(s), ${requestsAdded} request(s) added. Existing records were preserved.`);
};

migrate().catch(error => { console.error(error.message); process.exitCode = 1; }).finally(() => mongoose.disconnect());
