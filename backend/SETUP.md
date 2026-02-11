# Backend Setup Guide

## Project Structure

```
backend/
├── config/
│   └── db.js                 # MongoDB connection configuration
├── controllers/
│   ├── fundController.js     # Fund CRUD operations
│   └── transactionController.js  # Transaction CRUD operations
├── middleware/
│   └── errorHandler.js       # Global error handling
├── models/
│   ├── Fund.js              # Fund schema
│   └── Transaction.js       # Transaction schema
├── routes/
│   ├── fundRoutes.js        # Fund API endpoints
│   └── transactionRoutes.js # Transaction API endpoints
├── .env                     # Environment variables (local copy)
├── .env.example             # Template for environment variables
├── .gitignore              # Git ignore rules
├── package.json            # Project dependencies
└── server.js               # Main server entry point
```

## Setup Instructions

### Option 1: MongoDB Atlas (Cloud - Recommended for Development)

1. **Create a MongoDB Atlas Account**
   - Go to https://www.mongodb.com/cloud/atlas
   - Sign up for a free tier account

2. **Create a Cluster**
   - Click "Create a Deployment"
   - Select "M0 Free" tier
   - Choose region (default is fine)
   - Complete the setup

3. **Create Database Credentials**
   - In the cluster dashboard, click "Database Access"
   - Add a new database user
   - Remember your username and password

4. **Get Connection String**
   - Click "Connect" on your cluster
   - Select "Drivers" > "Node.js"
   - Copy the connection string

5. **Update .env File**
   ```
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/family-fund-ledger?retryWrites=true&w=majority
   ```
   - Replace `username` with your database user
   - Replace `password` with your database password
   - Replace `cluster` with your actual cluster name

6. **Whitelist Your IP**
   - In MongoDB Atlas, go to "Network Access"
   - Add your IP address or allow all IPs (0.0.0.0/0) for development

### Option 2: Local MongoDB (Windows)

1. **Install MongoDB Community Edition**
   - Download from: https://www.mongodb.com/try/download/community
   - Run the installer
   - Select "Install MongoDB as a Service" during installation
   - MongoDB will start automatically

2. **Verify Installation**
   ```powershell
   mongosh
   ```
   Should open MongoDB shell

3. **Update .env File** (if not already set)
   ```
   MONGODB_URI=mongodb://localhost:27017/family-fund-ledger
   ```

## Running the Backend

1. **Navigate to backend directory**
   ```powershell
   cd backend
   ```

2. **Install dependencies** (if not already done)
   ```powershell
   npm install
   ```

3. **Create .env file** (if not already created)
   ```powershell
   Copy-Item .env.example .env
   # Then edit .env with your MongoDB connection string
   ```

4. **Start the server**
   ```powershell
   npm start
   ```
   Should see: `Server is running on port 5000`

5. **For development with auto-reload**
   ```powershell
   npm run dev
   ```

## API Endpoints

### Funds API

- `GET /api/funds` - Get all funds
- `GET /api/funds/:id` - Get a specific fund
- `POST /api/funds` - Create a new fund
- `PUT /api/funds/:id` - Update a fund
- `DELETE /api/funds/:id` - Delete a fund

### Transactions API

- `GET /api/transactions` - Get all transactions
- `GET /api/transactions/fund/:fundId` - Get transactions for a specific fund
- `POST /api/transactions` - Create a new transaction
- `PUT /api/transactions/:id` - Update a transaction
- `DELETE /api/transactions/:id` - Delete a transaction

### Health Check

- `GET /api/health` - Backend health status

## Example API Requests

### Create a Fund
```bash
POST http://localhost:5000/api/funds
Content-Type: application/json

{
  "name": "Emergency Fund",
  "description": "Family emergency fund"
}
```

### Create a Transaction
```bash
POST http://localhost:5000/api/transactions
Content-Type: application/json

{
  "fundId": "65a1b2c3d4e5f6g7h8i9j0k1",
  "type": "income",
  "amount": 5000,
  "category": "Salary",
  "description": "Monthly salary",
  "date": "2024-02-11",
  "createdBy": "John Doe"
}
```

## Troubleshooting

### MongoDB Connection Error
- Verify MongoDB is running
- Check MONGODB_URI in .env file is correct
- For MongoDB Atlas, ensure IP is whitelisted

### Port Already in Use
- Change PORT in .env file to another port (e.g., 5001)
- Or kill the process using port 5000

### Dependencies Not Installed
```powershell
rm -r node_modules
npm install
```

## Environment Variables

- `PORT` - Server port (default: 5000)
- `MONGODB_URI` - MongoDB connection string
- `NODE_ENV` - Environment (development/production)
