# Invoice Management Dashboard

## Overview

A full-stack invoice management dashboard built with React, Node.js, Express, and MongoDB. Allows users to manage invoices, view customer profiles, and track financial metrics through a clean dashboard interface.

## Tech Stack

- **Frontend:** React
- **Backend:** Node.js, Express
- **Database:** MongoDB, Mongoose

## Data Modeling

### Company
Stores company information. Each company has a unique name.

### Customer
Stores customer details with a reference to their company (`companyId`).

### Invoice
Stores invoice records with a reference to the customer (`customerId`). Contains financial fields (amount, taxRate, tax, total), status, and date fields.

### Relationships

```
Company (1) ──> Customer (1)
Customer (1) ──> Invoice (Many)
```

Data is normalized into separate collections instead of embedding everything in a single collection because:
- **Avoids data duplication** — company/customer info isn't repeated across every invoice.
- **Easier updates** — changing a company name updates it in one place.
- **Better querying** — allows independent queries on companies, customers, and invoices.
- **Scalability** — collections can grow independently.

## Setup Instructions

### Prerequisites
- Node.js (v18+)
- MongoDB (running locally or a cloud instance)

### Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file in the `backend` directory:

```
PORT=5000
MONGO_URI=mongodb://localhost:27017/invoice-dashboard
```

Start the development server:

```bash
npm run dev
```

### Health Check

Once the server is running, verify at:

```
GET http://localhost:5000/api/health
```

## Seed Data

Place `seed-data.json` in the `backend` directory, then run:

```bash
cd backend
npm run seed
```

This will:
- Clear existing data
- Insert 61 companies
- Insert 61 customers (mapped to their companies)
- Insert 2000 invoices (mapped to their customers)


## Assumptions

- One customer belongs to exactly one company.
- One customer can have many invoices.
- Invoice statuses are: Draft, Sent, Paid, Unpaid, Overdue, Void.
- Tax and total are calculated server-side.

