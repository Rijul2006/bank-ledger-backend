import express from "express";
import {authMiddleware, authSystemMiddleware } from './../middlewares/auth.middlewares.js'
import { createInitialFundTransaction, createTransaction } from "./../controllers/transaction.controllers.js";

const router = express.Router()

router.post ('/system/initial-funds', authSystemMiddleware, createInitialFundTransaction)
router.post('/', authMiddleware, createTransaction)

export default router