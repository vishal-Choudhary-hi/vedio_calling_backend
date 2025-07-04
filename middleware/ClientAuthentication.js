const {ErrorResponse}= require("../util/Apiresponse");
const clientAuthentication=(req,res,next)=>{
    let showErrorResponse=false;
    try {
        const authHeader = req.headers["authorization"];
        if(authHeader!=process.env.CLIENT_AUTH_ACCESS_TOKEN){
            showErrorResponse=true;
            throw new Error("Un authorized client access");
        }
        next();
    } catch (error) {
        console.error("Error in clientAuthentication middleware:", error);
        if(showErrorResponse){
            errorMessage=error.message;
        }else{
            errorMessage="Client authentication failed";
        }
        return ErrorResponse(res,errorMessage,"AUTH_FAILED",500);

    }
}
module.exports={clientAuthentication}