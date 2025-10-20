// endpoints/api1/index.ts
import { Router } from 'express';
const router = Router();

router.get('/', (req, res) => {
  const randomNum = Math.floor(Math.random() * 100);
  res.json({
    message: 'Hello from API 1!',
    randomNum
  });
});

export default router;
