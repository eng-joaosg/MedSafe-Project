/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/require-await */
import express from 'express';
import bodyParser from 'body-parser';
import { handler } from './lambda';

const PORT = process.env.PORT || 3002;

async function bootstrap() {
  const app = express();

  // Middleware para parsear JSON
  app.use(bodyParser.json());

  // Middleware principal para capturar todas as requisições
  app.use(async (req, res) => {
    try {
      // Normaliza headers
      const headers: Record<string, string> = {};
      for (const [key, value] of Object.entries(req.headers)) {
        if (typeof value === 'string') headers[key.toLowerCase()] = value;
      }

      // Chama o handler do Lambda
      const result = await handler(req.body);

      // Normaliza o body para envio
      let responseBody = result.body;
      if (typeof result.body === 'object') {
        responseBody = JSON.stringify(result.body);
      }

      res
        .status(result.statusCode)
        .set(result.headers || {})
        .send(responseBody);
    } catch (err: any) {
      console.error('Erro no handler local:', err);
      res.status(500).json({
        error: err instanceof Error ? err.message : 'Erro desconhecido',
        requestId: req.headers['x-request-id'] || null,
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
