import { Router } from 'express';
const router = Router();

// Authorize client requests
// TODO: Create
router.use('/client', (req, res, next) => {
  next();
});

export default router;
