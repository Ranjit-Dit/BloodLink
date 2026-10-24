const bloodRequestCtrl = require("./blood-request.controller");
const { bodyValidator, queryValidator } = require("../../middlewares/request-validator.middleware");
const { BloodRequestCreateDTO, BloodRequestStatusDTO, BloodRequestQueryDTO } = require("./blood-request.request");

const bloodRequestRouter = require("express").Router();

bloodRequestRouter.route("/")
    .post(bodyValidator(BloodRequestCreateDTO), bloodRequestCtrl.storeBloodRequest)
    .get(queryValidator(BloodRequestQueryDTO), bloodRequestCtrl.listAllData);

bloodRequestRouter.get("/:id/matches", bloodRequestCtrl.findMatches);
bloodRequestRouter.patch("/:id/status", bodyValidator(BloodRequestStatusDTO), bloodRequestCtrl.updateStatus);

bloodRequestRouter.route("/:id")
    .get(bloodRequestCtrl.getById)
    .delete(bloodRequestCtrl.deleteById);

module.exports = bloodRequestRouter;
