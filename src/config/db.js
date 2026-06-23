import mongoose from "mongoose";
import dns from "dns"
dns.setServers(["1.1.1.1","8.8.8.8"])

const connectDB = async () => {
    await mongoose.connect(process.env.MONGOOSE_URI)
    .then(() => {
        console.log("DB CONNECTED SUCCESSFULLY");
    })
    .catch((error) => {
        console.log("DB CONNECTION FAILED: ", error);
    })
}

export default connectDB