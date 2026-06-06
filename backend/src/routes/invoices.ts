import { Router } from 'express';
import { getInvoices } from '../controllers/invoiceController';

const router = Router();

router.get('/', getInvoices);

export default router;
