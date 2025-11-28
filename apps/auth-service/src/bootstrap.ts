/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/require-await */
import express, { Request, Response } from 'express';
import bodyParser from 'body-parser';
import { handler } from './lambda';

const PORT = process.env.PORT || 3002;

async function bootstrap() {
  const app = express();
  app.use(bodyParser.json());

  // Captura todas as requisições
  app.use(async (req: Request, res: Response) => {
    try {
      // Normaliza os headers
      const headers: Record<string, string> = {};
      for (const [key, value] of Object.entries(req.headers)) {
        if (typeof value === 'string') headers[key.toLowerCase()] = value;
      }
      const incoming = req.body || {};
      const realBody = incoming.body ?? null;

      const lambdaEvent = {
        resource: incoming.resource,
        path: incoming.path,
        httpMethod: incoming.httpMethod,
        headers,
        queryStringParameters: incoming.queryStringParameters ?? undefined,
        pathParameters: {},
        stageVariables: null,
        requestContext: {
          requestId: headers['x-request-id'] || 'local-request-id',
          http: {
            method: incoming.requestContext?.http?.method,
            path: incoming.path,
            sourceIp: req.ip,
            userAgent: headers['user-agent'] || 'local-client',
          },
        },
        body: realBody ? realBody : null,
        isBase64Encoded: false,
      };

      if (headers['cookie']) {
        console.log('Cookies recebidos:', headers['cookie']);
      }
      const result = await handler(lambdaEvent);

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
