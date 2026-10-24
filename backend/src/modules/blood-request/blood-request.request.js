const { Joi, text, bloodGroup, phone, city } = require("../../utilities/request.helper");
const { REQUEST_STATUSES, URGENCIES } = require("../../constants/domain.constant");

const BloodRequestCreateDTO = Joi.object({
    patientName: text(2, 80).required(),
    bloodGroup: bloodGroup.required(),
    city: city.required(),
    hospital: text(2, 120).required(),
    requesterName: text(2, 80).required(),
    phone: phone.required(),
    units: Joi.number().integer().min(1).max(20).strict().required(),
    urgency: Joi.string().valid(...URGENCIES).default("urgent"),
    message: text(0, 500).allow("").default(""),
}).unknown(false).required();

const BloodRequestStatusDTO = Joi.object({
    status: Joi.string().valid(...REQUEST_STATUSES).required(),
}).unknown(false).required();

const BloodRequestQueryDTO = Joi.object({
    bloodGroup,
    city,
    status: Joi.string().valid(...REQUEST_STATUSES),
    urgency: Joi.string().valid(...URGENCIES),
}).unknown(false);

module.exports = { BloodRequestCreateDTO, BloodRequestStatusDTO, BloodRequestQueryDTO };
