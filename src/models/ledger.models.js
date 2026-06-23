import mongoose from "mongoose";

const ledgerSchema = new mongoose.Schema({
    account:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Account",
        required:[true, "Account is required for creating a ledger entry"],
        index:true,
        immutable:true
    },
    transaction:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Transaction",
        required:[true, "Transaction is required for creating a ledger entry"],
        index:true,
        immutable:true
    },
    amount:{
        type:Number,
        required:[true, "Amount is required for creating a ledger entry"],
        immutable:true
    },
    type:{
        type:String,
        enum:{
            values:["CREDIT", "DEBIT"],
            message:"Type can either be CREDIT or DEBIT"
        },
        required:"Type is required for creating a ledger entry",
        immutable:true
    }
},{
    timestamps:true
})

function preventLedgerModification(){
    throw new Error("Ledger entry is immutable and can not be updated or deleted")
}

ledgerSchema.pre("findOneAndUpdate", preventLedgerModification)
ledgerSchema.pre("findOneAndDelete", preventLedgerModification)
ledgerSchema.pre("updateOne", preventLedgerModification)
ledgerSchema.pre("deleteOne", preventLedgerModification)
ledgerSchema.pre("remove", preventLedgerModification)
ledgerSchema.pre("deleteMany", preventLedgerModification)
ledgerSchema.pre("updateMany", preventLedgerModification)
ledgerSchema.pre("findOneAndReplace", preventLedgerModification)


const Ledger = mongoose.model("Ledger", ledgerSchema)
export default Ledger



