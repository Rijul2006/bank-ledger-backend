# Bank Ledger Backend API 🏦

A secure and robust backend system for a financial ledger. It handles user authentication, account management, and transactional processing while keeping a strict audit trail of all financial movements.

## 🚀 Key Features
* **Role-Based Security:** Separate system-level access and standard user access using custom authentication checks.
* **Account Management:** Support for creating user accounts and checking real-time balances using unique account identifiers.
* **Transaction Safety:** Safe processing for standard financial transfers and system-level initial funding.
* **Modular Routing:** Clean structure splitting the system into dedicated Auth, Account, and Transaction controllers.

## 🛠️ Tech Stack
* **Runtime:** Node.js
* **Framework:** Express.js (ES6 Module syntax)
* **Authentication:** Middleware-verified Session Tokens (JWT)

## 🔀 Core API Endpoints

### 1. Authentication Routes
* `POST /api/auth/register` - Registers a new user into the banking database.
* `POST /api/auth/login` - Validates credentials and returns an access token.
* `POST /api/auth/logout` - Logs out the user and clears the active session.

### 2. Account Routes
* `POST /api/account/create` - Opens and initializes a new financial ledger account.
* `GET /api/account/` - Fetches account information tied to the logged-in profile.
* `GET /api/account/balance/:accountId` - Dynamically retrieves the current balance for a specific account.

### 3. Transaction Routes
* `POST /api/transaction/system/initial-funds` - Requires system admin access to initialize baseline capital or float funds.
* `POST /api/transaction/` - Processes a standard financial movement (like a deposit or transfer).

## ⚙️ Setup and Installation

1. **Clone the repository:**
   ```bash
   git clone [https://github.com/Rijul2006/bank-ledger-backend.git](https://github.com/Rijul2006/bank-ledger-backend.git)
