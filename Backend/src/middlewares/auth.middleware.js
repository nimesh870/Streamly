import { ApiError } from "../utils/ApiError";
import { AsyncHandler } from "../utils/AsyncHandler";
import jwt from "jsonwebtoken";
import { User } from "../models/user.model";

export const verifyJWT = AsyncHandler( async (req , _ , next) => {
try {
        const token = req.cookies?.accessToken || req.header("Authorization")?.split(" ")[1];
    
        if (!token) {
            throw new ApiError(401 , "Unauthorized request.")
        }
    
        const decoded = jwt.verify(token , process.env.ACCESS_TOKEN_SECRET);
    
        const user = await User.findById(decoded?._id).select("-password -refreshToken");
    
        if (!user) {
            throw new ApiError(401 , "Invalid token.")
        }
    
        req.user = user;
        next();
} catch (error) {
    throw new ApiError(401 , error.message || "Invalid token.")
}
})