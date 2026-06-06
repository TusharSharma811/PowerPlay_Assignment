import { Router } from 'express';
import { getSummary, getTopCustomers } from '../controllers/dashboardController';

const router = Router();

router.get('/summary', getSummary);
router.get('/top-customers', getTopCustomers);

export default router;
