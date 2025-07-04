const Joi = require("joi");
const { SuccessResponse, ErrorResponse } = require("../util/Apiresponse");
const CryptoJS = require("crypto-js");
const validateUserInRoom = (req, res) => {
    try {
        const validationJson=Joi.object({
            roomID:Joi.string().required(),
            inviteUid:Joi.string().required(),
        });
        const { error } = validationJson.validate(req.query);
        if (error) {
            throw new Error("Validation error:", error.details[0].message);
        }
        const { roomID, inviteUid } = req.query;
        const matchedInvite = validateUserToJoinRoom(roomID, inviteUid);
        if (!matchedInvite) {
            throw new Error("User not invited for the meet.");
        }
        return SuccessResponse(res, matchedInvite, "Validation Successful", 200);
    } catch (error) {
        console.error("Error in validateUserInRoom controller:", error);
        return ErrorResponse(res, "Failed to validate user in room", errorCode || "USER_VALIDATION_FAILED", 500);
    }
}

const validateUserToJoinRoom=(roomID, inviteUid)=> {
    const decryptedRoomId = CryptoJS.AES.decrypt(roomID, process.env.ENCRYPT_KEY).toString(CryptoJS.enc.Utf8);
    const roomData = JSON.parse(decryptedRoomId);
    const invites = roomData.invites || [];
    return invites.find(invite => invite.uid === inviteUid);
}
module.exports = { validateUserInRoom,validateUserToJoinRoom };