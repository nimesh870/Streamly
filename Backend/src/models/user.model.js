import mongoose , {Schema} from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import "dotenv/config";

const userSchema = new Schema({
    username : {
        type : String,
        required : [true , "Username is required."],
        unique : true,
        lowercase : true,
        trim : true,
    },

    email : {
        type : String,
        required : [true , "Email is required."],
        unique : true,
        lowercase : true,
        trim : true,
        match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    },

    fullname : {
        type : String,
        required : [true , "Fullname is required."],
        index: true,
        index: true,
    },

    avatar : {
        url: {
            type: String,
            required: true
        },

        public_id: {
            type: String,
            required: true
        }
    },

    coverImg : {
        url: {
            type: String,
        },

        public_id: {
            type: String,
        }
    },

    watchHistory : [
        {
            type : Schema.Types.ObjectId,
            ref : "Video"
        }
    ],

    password : {
        type : String,
        required : [true , "Password is required."],
        select : false
    },

    refreshToken : {
        type : String
    }

},{timestamps : true})

userSchema.pre("save" , async function (next) {
    if (!this.isModified("password")) return;

    this.password = await bcrypt.hash(this.password , 10);
})

userSchema.methods.comparePassword = async function(password) {
    return await bcrypt.compare(password , this.password)
}

userSchema.methods.generateAccessToken = function () {
    return jwt.sign(
        {
            _id : this._id,
            email : this.email,
            username : this.username
        }, process.env.ACCESS_TOKEN_SECRET, {expiresIn : process.env.ACCESS_TOKEN_EXPIRY}
    )
}

userSchema.methods.generateRefreshToken = function () {
    return jwt.sign(
        {
            _id : this._id
        } , process.env.REFRESH_TOKEN_SECRET , {expiresIn : process.env.REFRESH_TOKEN_EXPIRY}
    )
}

export const User = mongoose.model("User" , userSchema)