import mongoose from 'mongoose'
import accountModel from './../models/account.models.js'
import transactionModel from './../models/transaction.models.js'
import ledgerModel from './../models/ledger.models.js'
import { sendingTransactionSuccessfulEmail } from './../services/email.services.js'

const createTransaction = async (req, res) => {
    const {fromAccount, toAccount, amount, idempotencyKey} = req.body

    if(!fromAccount || !toAccount || !amount || !idempotencyKey){
        return res.status(400).json({
            message:"fromAccount, toAccount, amount and idempotencyKey are required for creating a transaction"
        })
    }

    const fromAccountExists = await accountModel.findOne({
        _id:fromAccount
    })

    const toAccountExists = await accountModel.findOne({
        _id:toAccount
    })

    if(!fromAccountExists || !toAccountExists){
        return res.status(404).json({
            message:"Invalid fromAccount or toAccount"
        })
    }

    if(fromAccountExists.status !== "ACTIVE" || toAccountExists.status !== "ACTIVE"){
        return res.status(400).json({
            message:"Either fromAccount or toAccount is not active, please check the account status"
        })
    }

    const isIdempotencyKeyUsed = await transactionModel.findOne({
        idempotencyKey : idempotencyKey
    })
    
    if(isIdempotencyKeyUsed){
        if(isIdempotencyKeyUsed.status === "COMPLETED"){
            return res.status(200).json({
                message:"Transaction already completed with the provided idempotency key",
                transaction:isIdempotencyKeyUsed
            })
        }
        if(isIdempotencyKeyUsed.status === "PENDING"){
            return res.status(200).json({
                message:"Transaction is still pending with the provided idempotency key",
            })
        }
        if(isIdempotencyKeyUsed.status === "FAILED"){
            return res.status(200).json({
                message:"Transaction already failed with the provided idempotency key, please try again "
            })
        }
        if(isIdempotencyKeyUsed.status === "REVERSED"){
            return res.status(200).json({
                message:"Transaction already reversed with the provided idempotency key, please try again "
            })
        }
    }

    const balance = fromAccountExists.getBalance()

    if(balance < amount){
        return res.status(400).json({
            message:`Insufficient balance, current balance is ${balance}, requested amount is ${amount}`
        })
    }

    try{
        const session = await mongoose.startSession()
        session.startTransaction()

    const transaction = (await transactionModel.create([{
        fromAccount,
        toAccount,
        amount,
        idempotencyKey,
        status:"PENDING"
    }],{session}))[0]

    const debitLedgerEntry = await ledgerModel.create([{
        account:fromAccount,
        transaction:transaction._id,
        amount,
        type:"DEBIT"
    }],{session})

    await (()=>{
        return new Promise((resolve)=> setTimeout(resolve,10*1000))
    })()

    const creditLedgerEntry = await ledgerModel.create([{
        account:toAccount,
        transaction:transaction._id,
        amount,
        type:"CREDIT"
    }],{session})

    await transactionModel.findOneAndUpdate({
        _id:transaction._id
    },{
        status:"COMPLETED"
    },{session})

    await session.commitTransaction()
    session.endSession()

    try {
        await sendingTransactionSuccessfulEmail(req.user.email, fromAccount, toAccount, amount)
    } catch (emailError) {
        console.error('Transaction email could not be sent:', emailError)
    }

    return res.status(201).json({
        message:`Transaction of amount ${amount} from ${fromAccount} to ${toAccount} `,
        transaction:transaction
    })
    }catch(err){
        return res.status(400).json({
            message: "Transaction is Pending due to some issue, please retry after sometime",
        })
    }
    

}

const createInitialFundTransaction = async (req, res) => {
    const {toAccount, amount, idempotencyKey} = req.body

    if(!toAccount || !amount || !idempotencyKey){
        return res.status(400).json({
            message:" toAccount, amount and idempotencyKey are required for creating a transaction"
        })
    }

    const toAccountExist = await accountModel.findOne({
        _id:toAccount
    })

    if(!toAccountExist){
        return res.status(400).json({
            message:"Invalid toAccount"
        })
    }

    const fromAccount = await accountModel.findOne({
        userId:req.user._id
    })

    if(!fromAccount){
        return res.status(400).json({
            message:"System user not found"
        })
    }
    let transaction

    try{
    const session = await mongoose.startSession()
    session.startTransaction()

    transaction = (await transactionModel.create([{
        fromAccount:fromAccount._id,
        toAccount,
        amount,
        idempotencyKey,
        status:"PENDING"
    }],{session}))[0]

    const debitLedgerEntry = await ledgerModel.create([{
        account:fromAccount,
        transaction:transaction._id,
        amount,
        type:"DEBIT"
    }], {session})

    const creditLedgerEntry = await ledgerModel.create([{
        account:toAccount,
        transaction:transaction._id,
        amount,
        type:"CREDIT"
    }],{session})

    transaction.status = "COMPLETED"
    await transaction.save({session})

    await session.commitTransaction()
    session.endSession()

    res.status(201).json({
        message:`Transaction of amount ${amount} from ${fromAccount._id} to ${toAccount} `,
        transaction:transaction
    })
    }
    catch(err){
        return res.status(400).json({
            message: "Transaction is Pending due to some issue, please retry after sometime",
        })
    }
    
}


export {
    createTransaction,
    createInitialFundTransaction
}