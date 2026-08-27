import mongoose from "mongoose";

const connectDB = async() => {
    try {
        const connectionObj = await mongoose.connect(`${process.env.MONGO_DB_URI}`)
        console.log(`Database connected successfully !! DB host ${connectionObj.connection.host}`)
    } catch (error) {
        console.error("Cannot connect database.", error);
        process.exit(1);
    }
}

export default connectDB;