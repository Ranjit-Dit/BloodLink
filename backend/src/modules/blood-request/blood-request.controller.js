const HttpResponse = require("../../constants/response-status.constant");
const HttpResponseCode = require("../../constants/http-status-code.constant");
const bloodRequestSvc = require("./blood-request.service");
const { send } = require("../../utilities/response.helper");

class BloodRequestController {
    storeBloodRequest = async (req, res, next) => {
        try {
            const data = await bloodRequestSvc.createBloodRequest(req.body);
            return send(res, data, HttpResponseCode.CREATED, "Blood request created successfully.", HttpResponse.bloodRequest.create_success);
        } catch (exception) {
            next(exception);
        }
    };

    listAllData = async (req, res, next) => {
        try {
            const data = await bloodRequestSvc.listAllRequests(req.query);
            return send(res, data, HttpResponseCode.SUCCESS_OK, "Blood request list.", HttpResponse.bloodRequest.list_success);
        } catch (exception) {
            next(exception);
        }
    };

    getById = async (req, res, next) => {
        try {
            const data = await bloodRequestSvc.getDataById(req.params.id);
            return send(res, data, HttpResponseCode.SUCCESS_OK, "Blood request detail.", HttpResponse.bloodRequest.detail_success);
        } catch (exception) {
            next(exception);
        }
    };

    updateStatus = async (req, res, next) => {
        try {
            const data = await bloodRequestSvc.updateStatus(req.params.id, req.body.status);
            return send(res, data, HttpResponseCode.SUCCESS_OK, "Blood request status updated.", HttpResponse.bloodRequest.update_success);
        } catch (exception) {
            next(exception);
        }
    };

    findMatches = async (req, res, next) => {
        try {
            const data = await bloodRequestSvc.findMatches(req.params.id);
            return send(res, data, HttpResponseCode.SUCCESS_OK, "Matching available donors.", HttpResponse.bloodRequest.matches_success);
        } catch (exception) {
            next(exception);
        }
    };

    deleteById = async (req, res, next) => {
        try {
            const data = await bloodRequestSvc.deleteById(req.params.id);
            return send(res, data, HttpResponseCode.SUCCESS_OK, "Blood request deleted successfully.", HttpResponse.bloodRequest.delete_success);
        } catch (exception) {
            next(exception);
        }
    };
}

const bloodRequestCtrl = new BloodRequestController();

module.exports = bloodRequestCtrl;
