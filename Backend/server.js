import app from "./src/app.js"
import connectDB from "./src/config/database.js"
import dotenv from "dotenv"

dotenv.config()

connectDB()
.then(() => {
    app.listen(process.env.PORT , (error) => {
        if (error) console.log("Error while starting server." , error)
        console.log("Server is listening...")
    })
})
.catch((error) => {
    console.log("Mongo db connection failed.", error)
})