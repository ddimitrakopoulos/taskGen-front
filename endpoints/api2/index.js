// endpoints/api2/index.ts
import { Router } from 'express';
const router = Router();

router.get('/', (req, res) => {
  const randomNum = Math.floor(Math.random() * 1000);
  res.json({
    message: 'Hello from API 2!',
    randomNum
  });
});

export default router;
