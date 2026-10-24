const mongoose = require("mongoose");
const { BLOOD_GROUPS, REQUEST_STATUSES, URGENCIES } = require("../../constants/domain.constant");

const BloodRequestSchema = new mongoose.Schema({
    patientName: { type: String, required: true, minlength: 2, maxlength: 80 },
    legacyId: { type: String, unique: true, sparse: true, select: false },
    bloodGroup: { type: String, required: true, enum: BLOOD_GROUPS },
    city: { type: String, required: true, minlength: 2, maxlength: 80 },
    cityKey: { type: String, required: true, index: true, select: false },
    hospital: { type: String, required: true, minlength: 2, maxlength: 120 },
    requesterName: { type: String, required: true, minlength: 2, maxlength: 80 },
    phone: { type: String, required: true },
    units: { type: Number, required: true, min: 1, max: 20, validate: Number.isInteger },
    urgency: { type: String, enum: URGENCIES, default: "urgent" },
    message: { type: String, maxlength: 500, default: "" },
    status: { type: String, enum: REQUEST_STATUSES, default: "open" },
}, {
    timestamps: true,
    toJSON: {
        virtuals: true,
        transform: (document, result) => {
            delete result.__v;
            delete result.cityKey;
            delete result.legacyId;
            return result;
        },
    },
});

BloodRequestSchema.index({ bloodGroup: 1, cityKey: 1, status: 1 });

const BloodRequestModel = mongoose.models.BloodRequest || mongoose.model("BloodRequest", BloodRequestSchema);

module.exports = BloodRequestModel;
