const donorCtrl = require("./donor.controller");
const { bodyValidator, queryValidator } = require("../../middlewares/request-validator.middleware");
const { DonorCreateDTO, DonorUpdateDTO, DonorAvailabilityDTO, DonorQueryDTO } = require("./donor.request");

const donorRouter = require("express").Router();

donorRouter.route("/")
    .post(bodyValidator(DonorCreateDTO), donorCtrl.storeDonor)
    .get(queryValidator(DonorQueryDTO), donorCtrl.listAllData);

donorRouter.patch("/:id/availability", bodyValidator(DonorAvailabilityDTO), donorCtrl.updateAvailability);

donorRouter.route("/:id")
    .get(donorCtrl.getById)
    .patch(bodyValidator(DonorUpdateDTO), donorCtrl.updateDonor)
    .delete(donorCtrl.deleteById);

module.exports = donorRouter;
