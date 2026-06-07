# Invoice Management Dashboard

## Overview

A full-stack invoice management dashboard built with React, Node.js, Express, and MongoDB. Allows users to manage invoices, view customer profiles, and track financial metrics through a clean dashboard interface.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, TypeScript, Tailwind CSS v4, Vite |
| Backend | Node.js, Express 5, TypeScript |
| Database | MongoDB, Mongoose ODM |
| HTTP Client | Axios |



## Data Modeling

### Relationships

```
Company (1) ──> Customer (1)
Customer (1) ──> Invoice (Many)
```

Data is normalized into three separate collections:
- **Avoids data duplication** — company/customer info isn't repeated across every invoice.
- **Easier updates** — changing a company name updates it in one place.
- **Better querying** — allows independent queries on companies, customers, and invoices.
- **Scalability** — collections can grow independently.

## API Endpoints

### Invoices
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/invoices` | List invoices (pagination, sorting, filtering) |
| POST | `/api/invoices` | Create invoice (server computes tax & total) |
| PUT | `/api/invoices/:id` | Update invoice (recalculates tax & total) |

**Query params:** `page`, `limit`, `sortBy`, `order`, `status`, `customer`, `issueDateFrom`, `issueDateTo`, `dueDateFrom`, `dueDateTo`

### Customers
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/customers` | List all customers with company info |
| GET | `/api/customers/:id` | Customer detail with metrics & invoice history |

### Dashboard
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/dashboard/summary` | Total billed, paid, unpaid, overdue (aggregation) |
| GET | `/api/dashboard/top-customers` | Top 5 customers by invoice value (aggregation) |

## Setup Instructions

### Prerequisites
- Node.js (v18+)
- MongoDB (running locally or cloud instance)

### Backend

```bash
cd backend
npm install
```

Create a `.env` file in the `backend` directory:

```
PORT=5000
MONGO_URI=mongodb://localhost:27017/invoice-dashboard
```

Seed the database:

```bash
npm run seed
```

Start the server:

```bash
npm run dev
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

The frontend runs on `http://localhost:5173` and the backend on `http://localhost:5000`.

## Assumptions

- One customer belongs to exactly one company.
- One customer can have many invoices.
- Invoice statuses are: Draft, Sent, Paid, Unpaid, Overdue, Void.
- Tax and total are always calculated server-side to prevent frontend tampering.
- Tax rates are restricted to: 0%, 3%, 5%, 18%, 28%.
