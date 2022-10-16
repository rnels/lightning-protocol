import * as model from '../models/exampleModel';
import { Router } from 'express';
const router = Router();

// NOTE: Always handle errors on model functions

// GET REQUESTS //

router.get('/example', (req, res, next) => {
  res.sendStatus(200);
});

// POST REQUESTS //

router.post('/example', (req, res, next) => {
  res.sendStatus(201);
});

// PUT / PATCH REQUESTS //

router.put('/example', (req, res, next) => {
  res.sendStatus(204);
});

router.patch('/example', (req, res, next) => {
  res.sendStatus(204);
});

// DELETE REQUESTS //

router.delete('/example', (req, res, next) => {
  res.sendStatus(204);
});

export default router;
