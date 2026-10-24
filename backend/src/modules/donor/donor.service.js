const mongoose = require("mongoose");
const DonorModel = require("./donor.model");
const { httpError } = require("../../utilities/http-error.helper");

class DonorService {
    transformDonorData = (input) => {
        const data = { ...input };
        if (data.city !== undefined) data.cityKey = data.city.toLowerCase();
        if (data.phone !== undefined) data.phoneKey = data.phone.replace(/\D/g, "");
        return data;
    };

    ensureValidId = (id) => {
        if (!mongoose.isObjectIdOrHexString(id)) throw httpError(404, "Donor not found.");
    };

    ensureUniquePhone = async (phoneKey, exceptId) => {
        const filter = { phoneKey };
        if (exceptId) filter._id = { $ne: exceptId };
        const existing = await DonorModel.findOne(filter).select("_id");
        if (existing) throw httpError(409, "A donor with this phone number already exists.");
    };

    createDonor = async (input) => {
        const data = this.transformDonorData(input);
        await this.ensureUniquePhone(data.phoneKey);
        return DonorModel.create(data);
    };

    listAllDonors = async (query = {}) => {
        const filter = {};
        if (query.bloodGroup !== undefined) filter.bloodGroup = query.bloodGroup;
        if (query.city !== undefined) filter.cityKey = query.city.toLowerCase();
        if (query.available !== undefined) filter.available = query.available === "true" || query.available === true;
        return DonorModel.find(filter).sort({ createdAt: 1, _id: 1 });
    };

    getDataById = async (id) => {
        this.ensureValidId(id);
        const donor = await DonorModel.findById(id);
        if (!donor) throw httpError(404, "Donor not found.");
        return donor;
    };

    updateDonor = async (id, input) => {
        await this.getDataById(id);
        const data = this.transformDonorData(input);
        if (data.phoneKey !== undefined) await this.ensureUniquePhone(data.phoneKey, id);
        const donor = await DonorModel.findByIdAndUpdate(id, { $set: data }, { new: true, runValidators: true });
        if (!donor) throw httpError(404, "Donor not found.");
        return donor;
    };

    updateAvailability = async (id, available) => this.updateDonor(id, { available });

    deleteById = async (id) => {
        this.ensureValidId(id);
        const donor = await DonorModel.findByIdAndDelete(id);
        if (!donor) throw httpError(404, "Donor not found.");
        return { id: donor.id };
    };
}

const donorSvc = new DonorService();

module.exports = donorSvc;
