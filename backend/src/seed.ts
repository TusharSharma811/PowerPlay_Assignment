import mongoose from 'mongoose';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import Company from './models/Company';
import Customer from './models/Customer';
import Invoice from './models/Invoice';

dotenv.config();

interface SeedRecord {
  invoiceId: string;
  customer: string;
  company: string;
  amount: number;
  taxRate: number;
  tax: number;
  total: number;
  status: string;
  issueDate: string;
  dueDate: string;
}

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI as string);
    console.log('MongoDB connected');

    // Read seed data
    const filePath = path.join(__dirname, '..', 'seed-data.json');
    const rawData = fs.readFileSync(filePath, 'utf-8');
    const records: SeedRecord[] = JSON.parse(rawData);
    console.log(`Loaded ${records.length} records from seed-data.json`);

    // Clear existing data
    await Invoice.deleteMany({});
    await Customer.deleteMany({});
    await Company.deleteMany({});
    console.log('Cleared existing data');

    // Extract unique companies
    const uniqueCompanies = [...new Set(records.map(r => r.company))];
    const companyDocs = await Company.insertMany(
      uniqueCompanies.map(name => ({ name }))
    );
    const companyMap = new Map(companyDocs.map(c => [c.name, c._id]));
    console.log(`Inserted ${companyDocs.length} companies`);

    // Extract unique customers with their company
    const customerCompanyMap = new Map<string, string>();
    for (const r of records) {
      if (!customerCompanyMap.has(r.customer)) {
        customerCompanyMap.set(r.customer, r.company);
      }
    }

    const customerDocs = await Customer.insertMany(
      Array.from(customerCompanyMap.entries()).map(([name, company]) => ({
        name,
        companyId: companyMap.get(company)
      }))
    );
    const customerMap = new Map(customerDocs.map(c => [c.name, c._id]));
    console.log(`Inserted ${customerDocs.length} customers`);

    // Insert invoices
    const invoices = records.map(r => ({
      invoiceId: r.invoiceId,
      customerId: customerMap.get(r.customer),
      amount: r.amount,
      taxRate: r.taxRate,
      tax: r.tax,
      total: r.total,
      status: r.status,
      issueDate: new Date(r.issueDate),
      dueDate: new Date(r.dueDate)
    }));

    await Invoice.insertMany(invoices);
    console.log(`Inserted ${invoices.length} invoices`);

    console.log('Seeding completed successfully!');
  } catch (error: any) {
    console.error('Seeding failed:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('MongoDB connection closed');
  }
};

seed();
