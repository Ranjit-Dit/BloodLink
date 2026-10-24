const { Joi, text, bloodGroup, phone, city, strictBoolean } = require("../../utilities/request.helper");

const donorFields = {
    name: text(2, 80),
    bloodGroup,
    phone,
    city,
    area: text(0, 100).allow(""),
    available: strictBoolean,
};

const DonorCreateDTO = Joi.object({
    ...donorFields,
    name: donorFields.name.required(),
    bloodGroup: bloodGroup.required(),
    phone: phone.required(),
    city: city.required(),
    area: donorFields.area.default(""),
    available: strictBoolean.default(true),
}).unknown(false).required();

const DonorUpdateDTO = Joi.object(donorFields).min(1).unknown(false).required();

const DonorAvailabilityDTO = Joi.object({
    available: strictBoolean.required(),
}).unknown(false).required();

const DonorQueryDTO = Joi.object({
    bloodGroup,
    city,
    available: Joi.string().valid("true", "false"),
}).unknown(false);

module.exports = { DonorCreateDTO, DonorUpdateDTO, DonorAvailabilityDTO, DonorQueryDTO };
