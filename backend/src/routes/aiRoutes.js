import express from 'express';
import { predictWalkIn } from '../controllers/aiPredictorController.js';

const router = express.Router();

router.post('/predict', predictWalkIn);
router.post('/predict-walk-in', predictWalkIn);

export default router;
