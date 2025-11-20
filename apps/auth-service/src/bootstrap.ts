/* eslint-disable @typescript-eslint/require-await */
import express, { Request, Response } from 'express';
import bodyParser from 'body-parser';
import { handler } from './lambda';
import { v4 as uuidv4 } from 'uuid';

const PORT = process.env.PORT || 3002;

async function bootstrap() {
  const app = express();

  app.use(bodyParser.json());

  app.all(/.*/, async (req: Request, res: Response) => {
    try {
      const requestId = (req.headers['x-request-id'] as string) || uuidv4();
      const { action, ...payload } = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;

      const event = {
        requestId,
        headers: req.headers as Record<string, string>,
        action: action ?? 'unknown',
        body: payload ?? {},
      };

      const result = await handler(event);
      res.json(result);
    } catch (err: any) {
      console.error('Erro no handler local:', err);
      res.status(500).json({
        error: err instanceof Error ? err.message : 'Erro desconhecido',
        requestId: req.headers['x-request-id'],
      });
    }
  });

  app.listen(PORT, () => {
    console.log(`Lambda handler rodando localmente em http://localhost:${PORT}`);
  });
}

bootstrap().catch((err) => {
  console.error('Erro ao iniciar bootstrap:', err);
});
