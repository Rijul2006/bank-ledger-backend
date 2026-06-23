import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema({
    fromAccount:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Account",
        required:[true, "Transaction must be associated with a from account"],
        index:true
    },
    toAccount:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Account",
        required:[true, "Transaction must be associated with a to account"],
        index:true
    },
    amount:{
        type:Number,
        required:[true, "Amount is required for the transaction"],
        min:[0, "Transacction amount can not be negative"]
    },
    idempotencyKey:{
        type:String,
        required:[true,"Idempotency key is required for creating a transaction"],
        unique:true,
        index:true
    },
    status:{
        type:String,
        enum:{
            values:["PENDING", "COMPLETED", "FAILED", "REVERSED"],
            message:"Status can either be PENDING, COMPLETED, FAILED or REVERSED"
        },
        default:"PENDING"
    }
},{
    timestamps:true
})


const Transaction = mongoose.model("Transaction", transactionSchema)
export default Transaction

