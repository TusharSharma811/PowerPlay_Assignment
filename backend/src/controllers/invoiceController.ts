import { Request, Response } from 'express';
import Invoice from '../models/Invoice';
import Customer from '../models/Customer';
import '../models/Company';

export const getInvoices = async (req: Request, res: Response) => {
  try {
    const {
      page = '1',
      limit = '10',
      sortBy = 'issueDate',
      order = 'desc',
      status,
      customerId,
      issueDateFrom,
      issueDateTo,
      dueDateFrom,
      dueDateTo
    } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    // Build filter
    const filter: any = {};

    if (status) {
      filter.status = status;
    }

    // Filter by customer ID
    if (customerId) {
      filter.customerId = customerId;
    }

    // Issue date range
    if (issueDateFrom || issueDateTo) {
      filter.issueDate = {};
      if (issueDateFrom) filter.issueDate.$gte = new Date(issueDateFrom as string);
      if (issueDateTo) filter.issueDate.$lte = new Date(issueDateTo as string);
    }

    // Due date range
    if (dueDateFrom || dueDateTo) {
      filter.dueDate = {};
      if (dueDateFrom) filter.dueDate.$gte = new Date(dueDateFrom as string);
      if (dueDateTo) filter.dueDate.$lte = new Date(dueDateTo as string);
    }

    // Build sort
    const sortField = ['amount', 'dueDate', 'issueDate', 'total'].includes(sortBy as string)
      ? sortBy as string
      : 'issueDate';
    const sortOrder = order === 'asc' ? 1 : -1;

    const totalRecords = await Invoice.countDocuments(filter);
    const totalPages = Math.ceil(totalRecords / limitNum);

    const invoices = await Invoice.find(filter)
      .populate({
        path: 'customerId',
        select: 'name companyId',
        populate: {
          path: 'companyId',
          select: 'name'
        }
      })
      .sort({ [sortField]: sortOrder })
      .skip(skip)
      .limit(limitNum);

    res.json({
      invoices,
      totalRecords,
      totalPages,
      currentPage: pageNum
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const createInvoice = async (req: Request, res: Response) => {
  try {
    const { invoiceId, customerId, amount, taxRate, status, issueDate, dueDate } = req.body;

    if (!invoiceId || !customerId || amount == null || taxRate == null || !status || !issueDate || !dueDate) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const customerExists = await Customer.findById(customerId);
    if (!customerExists) {
      return res.status(400).json({ message: 'Customer not found' });
    }

    // Backend calculates tax and total
    const tax = Math.round(amount * (taxRate / 100) * 100) / 100;
    const total = Math.round((amount + tax) * 100) / 100;

    const invoice = await Invoice.create({
      invoiceId,
      customerId,
      amount,
      taxRate,
      tax,
      total,
      status,
      issueDate: new Date(issueDate),
      dueDate: new Date(dueDate)
    });

    res.status(201).json(invoice);
  } catch (error: any) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Invoice ID already exists' });
    }
    res.status(500).json({ message: error.message });
  }
};

export const updateInvoice = async (req: Request, res: Response) => {
  try {
    const invoice = await Invoice.findById(req.params.id);
    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found' });
    }

    const { customerId, amount, taxRate, status, issueDate, dueDate } = req.body;

    if (customerId) {
      const customerExists = await Customer.findById(customerId);
      if (!customerExists) {
        return res.status(400).json({ message: 'Customer not found' });
      }
      invoice.customerId = customerId;
    }

    if (amount != null) invoice.amount = amount;
    if (taxRate != null) invoice.taxRate = taxRate;
    if (status) invoice.status = status;
    if (issueDate) invoice.issueDate = new Date(issueDate);
    if (dueDate) invoice.dueDate = new Date(dueDate);

    // Recalculate tax and total
    invoice.tax = Math.round(invoice.amount * (invoice.taxRate / 100) * 100) / 100;
    invoice.total = Math.round((invoice.amount + invoice.tax) * 100) / 100;

    await invoice.save();
    res.json(invoice);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
