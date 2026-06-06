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
      customer,
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

    // Filter by customer name — look up customerId first
    if (customer) {
      const customerDoc = await Customer.findOne({ name: customer });
      if (customerDoc) {
        filter.customerId = customerDoc._id;
      } else {
        return res.json({
          invoices: [],
          totalRecords: 0,
          totalPages: 0,
          currentPage: pageNum
        });
      }
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
