import { Request, Response } from 'express';
import Invoice from '../models/Invoice';

export const getSummary = async (req: Request, res: Response) => {
  try {
    const [summary] = await Invoice.aggregate([
      {
        $group: {
          _id: null,
          totalInvoices: { $sum: 1 },
          totalRevenue: { $sum: '$total' },
          paidRevenue: {
            $sum: { $cond: [{ $eq: ['$status', 'Paid'] }, '$total', 0] }
          },
          unpaidRevenue: {
            $sum: { $cond: [{ $eq: ['$status', 'Unpaid'] }, '$total', 0] }
          },
          overdueInvoices: {
            $sum: { $cond: [{ $eq: ['$status', 'Overdue'] }, 1, 0] }
          }
        }
      },
      {
        $project: {
          _id: 0,
          totalInvoices: 1,
          totalRevenue: { $round: ['$totalRevenue', 2] },
          paidRevenue: { $round: ['$paidRevenue', 2] },
          unpaidRevenue: { $round: ['$unpaidRevenue', 2] },
          overdueInvoices: 1
        }
      }
    ]);

    res.json(summary || {
      totalInvoices: 0,
      totalRevenue: 0,
      paidRevenue: 0,
      unpaidRevenue: 0,
      overdueInvoices: 0
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getTopCustomers = async (req: Request, res: Response) => {
  try {
    const topCustomers = await Invoice.aggregate([
      {
        $group: {
          _id: '$customerId',
          totalInvoiceValue: { $sum: '$total' },
          invoiceCount: { $sum: 1 }
        }
      },
      { $sort: { totalInvoiceValue: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: 'customers',
          localField: '_id',
          foreignField: '_id',
          as: 'customer'
        }
      },
      { $unwind: '$customer' },
      {
        $lookup: {
          from: 'companies',
          localField: 'customer.companyId',
          foreignField: '_id',
          as: 'company'
        }
      },
      { $unwind: '$company' },
      {
        $project: {
          _id: 0,
          customerId: '$_id',
          customerName: '$customer.name',
          companyName: '$company.name',
          totalInvoiceValue: { $round: ['$totalInvoiceValue', 2] },
          invoiceCount: 1
        }
      }
    ]);

    res.json(topCustomers);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
