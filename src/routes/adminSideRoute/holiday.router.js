// holiday-api/routes/holidayRoutes.js
const express = require('express');
const router = express.Router();
const holidayController = require('../../controllers/adminSideController/holiday.controller');

// GET all holidays
router.get('/', holidayController.getAllHolidays);

// POST a new holiday
router.post('/', holidayController.createHoliday);

// GET a specific holiday
// The holidayController.getHolidayById middleware will run first for routes with :id
router.get('/:id', holidayController.getHolidayById, holidayController.getHoliday);

// PUT update a holiday
router.put('/:id', holidayController.getHolidayById, holidayController.updateHoliday);

// DELETE a holiday
router.delete('/:id', holidayController.getHolidayById, holidayController.deleteHoliday);

module.exports = router;