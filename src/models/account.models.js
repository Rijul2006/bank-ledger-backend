import mongoose from 'mongoose'
import ledgerModel from './../models/ledger.models.js'

const accountSchema =  new mongoose.Schema({
    userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:[true, "Account must be associated with a user"],
        index:true
    },
    status:{
        type:String,
        enum:{
            values:["ACTIVE", "FROZEN", "CLOSED"],
            message:"Status can be active, frozen or pending"
        },
        default:"ACTIVE"
    },
    currency:{
        type:String,
        required: [ true, "Currency is required for creating an account" ],
        default:"INR"
    }
},{
    timestamps:true
})

accountSchema.index({userId : 1, status : 1})

accountSchema.methods.getBalance = async function(){
    const balance = await ledgerModel.aggregate([
        {
            $match:{account:this._id}
        },
        {
            $group:{
                _id:null,
                totalDebit:{
                    $sum:{
                        $cond:[
                            {$eq:["$type","DEBIT"]},
                            "$amount",
                            0
                        ]
                    }
                },
                totalCredit:{
                    $sum:{
                        $cond:[
                            {$eq:["$type","CREDIT"]},
                            "$amount",
                            0
                        ]
                    }
                }
            }
        },
        {
            $project:{
            _id:0,
            balanceAmt:{$subtract:["$totalCredit","$totalDebit"]}
        }
        }
        
    ])
    if(balance.length === 0){
        return 0
    }
    return balance[0].balanceAmt
}


const Account = mongoose.model("Account", accountSchema)

export default Account