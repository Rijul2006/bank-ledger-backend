import dotenv from "dotenv";
dotenv.config({
    path:"./.env"
})
import connectDB from './src/config/db.js'
import app from "./src/app.js";

connectDB()

app.listen(3000, () => {
    console.log("Server is running on port 3000")
})