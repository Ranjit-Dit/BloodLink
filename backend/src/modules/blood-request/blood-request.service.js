const mongoose = require("mongoose");
const BloodRequestModel = require("./blood-request.model");
const donorSvc = require("../donor/donor.service");
const { httpError } = require("../../utilities/http-error.helper");

class BloodRequestService {
    ensureValidId = (id) => {
        if (!mongoose.isObjectIdOrHexString(id)) throw httpError(404, "Blood request not found.");
    };

    createBloodRequest = async (input) => {
        const data = { ...input, cityKey: input.city.toLowerCase(), status: "open" };
        return BloodRequestModel.create(data);
    };

    listAllRequests = async (query = {}) => {
        const filter = {};
        for (const key of ["bloodGroup", "status", "urgency"]) {
            if (query[key] !== undefined) filter[key] = query[key];
        }
        if (query.city !== undefined) filter.cityKey = query.city.toLowerCase();
        const requests = await BloodRequestModel.find(filter);
        return requests.sort((first, second) => Number(second.urgency === "urgent") - Number(first.urgency === "urgent")
            || second.createdAt.getTime() - first.createdAt.getTime()
            || String(second._id).localeCompare(String(first._id)));
    };

    getDataById = async (id) => {
        this.ensureValidId(id);
        const request = await BloodRequestModel.findById(id);
        if (!request) throw httpError(404, "Blood request not found.");
        return request;
    };

    updateStatus = async (id, status) => {
        this.ensureValidId(id);
        const request = await BloodRequestModel.findByIdAndUpdate(id, { $set: { status } }, { new: true, runValidators: true });
        if (!request) throw httpError(404, "Blood request not found.");
        return request;
    };

    findMatches = async (id) => {
        const request = await this.getDataById(id);
        if (request.status !== "open") throw httpError(409, "Only open blood requests can find donors.");
        const donors = await donorSvc.listAllDonors({ bloodGroup: request.bloodGroup, city: request.city, available: true });
        return donors.map((donor) => ({
            ...donor.toJSON(),
            contactMessage: `Hello ${donor.name}, ${request.requesterName} is seeking ${request.units} unit(s) of ${request.bloodGroup} blood for ${request.patientName} at ${request.hospital}, ${request.city}. Urgency: ${request.urgency}. Please contact ${request.phone}.${request.message ? ` ${request.message}` : ""}`,
        }));
    };

    deleteById = async (id) => {
        this.ensureValidId(id);
        const request = await BloodRequestModel.findByIdAndDelete(id);
        if (!request) throw httpError(404, "Blood request not found.");
        return { id: request.id };
    };
}

const bloodRequestSvc = new BloodRequestService();

module.exports = bloodRequestSvc;
