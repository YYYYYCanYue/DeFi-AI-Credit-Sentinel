// app.ts
import express from 'express';
import { signClaim } from './signer';

const app = express();
app.use(express.json());

// 例：你的后端已经拿到风控分数
function mapScoreToTier(score: number) {
  // 示例：600/700/750/800
  if (score >= 800) return 4;
  if (score >= 750) return 3;
  if (score >= 700) return 2;
  if (score >= 600) return 1;
  throw new Error('score too low for any tier');
}

app.post('/sign-claim', async (req, res) => {
  try {
    const { to, score } = req.body as { to: string; score: number };
    const tierId = mapScoreToTier(score);

    // 生产建议：为每个地址生成/分配唯一 nonce，并在数据库中标记“已用/未用”
    const result = await signClaim({ to, score, tierId });

    // 返回给前端
    res.json({
      value: result.value,
      signature: result.signature,
      // 可选：你也可以不把 domain/types 暴露给前端，前端只需要 value+signature 就够了
    });
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

app.listen(3000, () => console.log('signer up on :3000'));
