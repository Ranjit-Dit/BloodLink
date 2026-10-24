const HttpResponse = require("../../constants/response-status.constant");
const HttpResponseCode = require("../../constants/http-status-code.constant");
const donorSvc = require("./donor.service");
const { send } = require("../../utilities/response.helper");

class DonorController {
    storeDonor = async (req, res, next) => {
        try {
            const data = await donorSvc.createDonor(req.body);
            return send(res, data, HttpResponseCode.CREATED, "Donor registered successfully.", HttpResponse.donor.create_success);
        } catch (exception) {
            next(exception);
        }
    };

    listAllData = async (req, res, next) => {
        try {
            const data = await donorSvc.listAllDonors(req.query);
            return send(res, data, HttpResponseCode.SUCCESS_OK, "Donor list.", HttpResponse.donor.list_success);
        } catch (exception) {
            next(exception);
        }
    };

    getById = async (req, res, next) => {
        try {
            const data = await donorSvc.getDataById(req.params.id);
            return send(res, data, HttpResponseCode.SUCCESS_OK, "Donor detail.", HttpResponse.donor.detail_success);
        } catch (exception) {
            next(exception);
        }
    };

    updateDonor = async (req, res, next) => {
        try {
            const data = await donorSvc.updateDonor(req.params.id, req.body);
            return send(res, data, HttpResponseCode.SUCCESS_OK, "Donor updated successfully.", HttpResponse.donor.update_success);
        } catch (exception) {
            next(exception);
        }
    };

    updateAvailability = async (req, res, next) => {
        try {
            const data = await donorSvc.updateAvailability(req.params.id, req.body.available);
            return send(res, data, HttpResponseCode.SUCCESS_OK, "Donor availability updated.", HttpResponse.donor.availability_success);
        } catch (exception) {
            next(exception);
        }
    };

    deleteById = async (req, res, next) => {
        try {
            const data = await donorSvc.deleteById(req.params.id);
            return send(res, data, HttpResponseCode.SUCCESS_OK, "Donor deleted successfully.", HttpResponse.donor.delete_success);
        } catch (exception) {
            next(exception);
        }
    };
}

const donorCtrl = new DonorController();

module.exports = donorCtrl;
