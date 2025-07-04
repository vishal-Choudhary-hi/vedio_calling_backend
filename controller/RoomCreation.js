const Joi = require("joi");
const { SuccessResponse, ErrorResponse } = require("../util/Apiresponse");
const CryptoJS = require("crypto-js");

const createRoom = (req, res) => {
  try {
    const validationJson=Joi.object({
        invites:Joi.array().items(
            Joi.object({
                uid:Joi.string().required(),
                name:Joi.string().required(),
                host:Joi.boolean().required(),
            })
        ).required()
    });
    const { error } = validationJson.validate(req.body);
    if (error) {
        throw new Error("Validation error:", error.details[0].message);
    }
    const { invites } = req.body;
    const inviteString=JSON.stringify({invites:invites});
    const encryptedRoomId=CryptoJS.AES.encrypt(inviteString, process.env.ENCRYPT_KEY).toString();
    const return_data={
        roomId:encryptedRoomId,
    };
    return SuccessResponse(res,return_data, "Room created successfully", 200);

  } catch (error) {
    console.error("Error in createRoom controller:", error);
    return ErrorResponse(res, "Failed to create room", errorCode||"ROOM_CREATION_FAILED", 500);
  }
};

module.exports={createRoom};