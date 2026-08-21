import express from 'express';
import { predictWalkIn } from '../controllers/aiPredictorController.js';

const router = express.Router();

router.post('/predict', predictWalkIn);

export default router;
