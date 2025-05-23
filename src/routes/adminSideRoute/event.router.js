// src/routes/adminSideRoute/event.router.js
const express = require('express');
const router = express.Router();
const eventController = require('../../controllers/adminSideController/event.controller');

router.get('/', eventController.getAllEvents);
router.post('/', eventController.createEvent);
router.put('/:id', eventController.getEventByIdMiddleware, eventController.updateEvent); // Add update route if needed
router.delete('/:id', eventController.getEventByIdMiddleware, eventController.deleteEvent);

module.exports = router;