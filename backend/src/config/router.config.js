const router = require('express').Router();
const donorRouter = require('../modules/donor/donor.router');
const bloodRequestRouter = require('../modules/blood-request/blood-request.router');
const { send } = require('../utilities/response.helper');

router.get('/health', (_req, res) => send(res, { status: 'ok' }));
router.use('/donors', donorRouter);
router.use('/requests', bloodRequestRouter);

module.exports = router;
