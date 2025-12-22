/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/require-await */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import express, { Request, Response } from 'express';
import bodyParser from 'body-parser';
import { handler } from './lambda';

const PORT = process.env.PORT || 4000;

interface LambdaResult {
  statusCode: number;
  headers?: Record<string, string>;
  multiValueHeaders?: Record<string, string[]>;
  body: string;
}

async function bootstrap() {
  const app = express();
  app.use(bodyParser.json());

  app.use(async (req: Request, res: Response) => {
    try {
      const lambdaEvent = req.body;

      const result = await handler(lambdaEvent);
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  app.listen(PORT, () => console.log(`Auth-Service local rodando na porta ${PORT}`));
}

bootstrap().catch((err) => {
  console.error('Erro ao iniciar bootstrap:', err);
});
