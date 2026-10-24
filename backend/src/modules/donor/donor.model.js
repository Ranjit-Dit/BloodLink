const mongoose = require("mongoose");
const { BLOOD_GROUPS } = require("../../constants/domain.constant");

const DonorSchema = new mongoose.Schema({
    name: { type: String, required: true, minlength: 2, maxlength: 80 },
    bloodGroup: { type: String, required: true, enum: BLOOD_GROUPS },
    phone: { type: String, required: true },
    phoneKey: { type: String, required: true, unique: true, select: false },
    legacyId: { type: String, select: false },
    city: { type: String, required: true, minlength: 2, maxlength: 80 },
    cityKey: { type: String, required: true, index: true, select: false },
    area: { type: String, default: "", maxlength: 100 },
    available: { type: Boolean, default: true },
}, {
    timestamps: true,
    toJSON: {
        virtuals: true,
        transform: (document, result) => {
            delete result.__v;
            delete result.phoneKey;
            delete result.cityKey;
            delete result.legacyId;
            return result;
        },
    },
});

DonorSchema.index({ bloodGroup: 1, cityKey: 1, available: 1 });

const DonorModel = mongoose.models.Donor || mongoose.model("Donor", DonorSchema);

module.exports = DonorModel;
