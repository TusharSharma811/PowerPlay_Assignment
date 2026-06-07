import { Router } from 'express';
import { getInvoices, createInvoice, updateInvoice } from '../controllers/invoiceController';

const router = Router();

router.get('/', getInvoices);
router.post('/', createInvoice);
router.put('/:id', updateInvoice);

export default router;
