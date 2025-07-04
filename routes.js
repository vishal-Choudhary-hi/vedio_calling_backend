const express = require('express');
const { clientAuthentication } = require('./middleware/ClientAuthentication');
const { createRoom } = require('./controller/RoomCreation');
const { validateUserInRoom } = require('./controller/ValidateUserInRoom');
const router = express.Router();

//Routes Needed
//create a room
//validate user entry

router.post('/create-room',clientAuthentication,createRoom);
router.get('/validateUserInRoom',clientAuthentication,validateUserInRoom);

module.exports = router;
