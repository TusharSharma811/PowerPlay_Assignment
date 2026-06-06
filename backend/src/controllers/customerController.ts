import { Request, Response } from 'express';
import Customer from '../models/Customer';
import Invoice from '../models/Invoice';
import '../models/Company';

export const getCustomers = async (req: Request, res: Response) => {
  try {
    const customers = await Customer.find()
      .populate('companyId', 'name')
      .sort({ name: 1 });

    res.json(customers);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getCustomerById = async (req: Request, res: Response) => {
  try {
    const customer = await Customer.findById(req.params.id)
      .populate('companyId', 'name');

    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }

    // Get invoice history
    const invoices = await Invoice.find({ customerId: customer._id })
      .sort({ issueDate: -1 });

    // Calculate metrics
    const totalInvoices = invoices.length;
    const totalBilledAmount = invoices.reduce((sum, inv) => sum + inv.total, 0);
    const paidInvoices = invoices.filter(inv => inv.status === 'Paid').length;
    const unpaidInvoices = invoices.filter(inv => inv.status === 'Unpaid').length;
    const overdueInvoices = invoices.filter(inv => inv.status === 'Overdue').length;

    res.json({
      customer,
      invoices,
      metrics: {
        totalInvoices,
        totalBilledAmount: Math.round(totalBilledAmount * 100) / 100,
        paidInvoices,
        unpaidInvoices,
        overdueInvoices
      }
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
