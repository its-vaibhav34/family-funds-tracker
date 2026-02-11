<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Family Fund Ledger

A full-stack application for managing family finances with separate frontend (React) and backend (Node.js + Express) servers.

## Prerequisites

- **Node.js** (v14 or higher)
- **MongoDB** (local or MongoDB Atlas cloud)

## Project Structure

```
family-fund-ledger/
├── (Frontend React files)
├── package.json (Frontend)
├── vite.config.ts
├── tsconfig.json
└── backend/
    ├── server.js
    ├── package.json (Backend)
    ├── .env
    └── (API code)
```

## Quick Start

### 1. Setup Backend

1. Navigate to backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create `.env` file:
   - Copy `.env.example` to `.env`
   - Add your MongoDB connection string

4. Test MongoDB connection:
   ```bash
   npm run test-connection
   ```

5. Start backend server (runs on port 5000):
   ```bash
   npm start
   ```
   
   Or for development with auto-reload:
   ```bash
   npm run dev
   ```

### 2. Setup Frontend

1. From root directory, install dependencies:
   ```bash
   npm install
   ```

2. Start frontend dev server (runs on port 3000):
   ```bash
   npm run dev
   ```

## MongoDB Setup

### Option A: MongoDB Atlas (Cloud - Recommended)

- Create free account: https://www.mongodb.com/cloud/atlas
- Create a free M0 cluster
- Get connection string and add to `.env`

### Option B: Local MongoDB

- Download: https://www.mongodb.com/try/download/community
- Install and run MongoDB service
- Use connection string: `mongodb://localhost:27017/family-fund-ledger`

For detailed setup instructions, see [backend/SETUP.md](backend/SETUP.md)

## API Endpoints

**Base URL**: `http://localhost:5000/api`

### Funds
- `GET /funds` - Get all funds
- `POST /funds` - Create fund
- `GET /funds/:id` - Get fund details
- `PUT /funds/:id` - Update fund
- `DELETE /funds/:id` - Delete fund

### Transactions
- `GET /transactions` - Get all transactions
- `POST /transactions` - Create transaction
- `GET /transactions/fund/:fundId` - Get fund transactions
- `PUT /transactions/:id` - Update transaction
- `DELETE /transactions/:id` - Delete transaction

### Health Check
- `GET /health` - Backend status

## Troubleshooting

**MongoDB Connection Error**
- Verify MongoDB is running
- Check `.env` MONGODB_URI is correct
- Run `npm run test-connection` in backend folder

**Port 5000 Already in Use**
- Change PORT in `.env` file

**Frontend/Backend Connection Issues**
- Ensure backend is running on port 5000
- Check CORS configuration in `backend/server.js`
- Verify network connectivity

## Technology Stack

**Frontend:**
- React 19
- TypeScript
- Vite
- Tailwind CSS
- React Router
- Lucide Icons

**Backend:**
- Node.js
- Express.js
- MongoDB
- Mongoose
- CORS
