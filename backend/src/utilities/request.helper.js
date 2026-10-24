const Joi = require('joi');
const { BLOOD_GROUPS } = require('../constants/domain.constant');

const normalizeText = value => value.trim().replace(/\s+/g, ' ');

// Custom normalizers retain strict type checks: strings cannot become numbers/booleans.
const text = (min = 1, max = 100) => Joi.string().custom((value, helpers) => {
  const result = normalizeText(value);
  if (result.length < min || result.length > max) return helpers.message(`{{#label}} must contain ${min} to ${max} characters.`);
  return result;
});

const bloodGroup = Joi.string().custom((value, helpers) => {
  const result = normalizeText(value).toUpperCase();
  return BLOOD_GROUPS.includes(result) ? result : helpers.message(`{{#label}} must be one of: ${BLOOD_GROUPS.join(', ')}.`);
});

const phone = Joi.string().custom((value, helpers) => {
  const raw = value.trim();
  const result = raw.replace(/[ ()-]/g, '');
  if (raw.length > 30 || !/^\+?[0-9 ()-]+$/.test(raw) || !/^\+?\d{7,15}$/.test(result)) {
    return helpers.message('{{#label}} must contain 7 to 15 digits with an optional leading +.');
  }
  return result;
});

const city = text(2, 80);
const strictBoolean = Joi.boolean().strict();

module.exports = { Joi, text, bloodGroup, phone, city, strictBoolean, normalizeText };
