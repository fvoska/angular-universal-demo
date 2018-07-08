import { Request, Response } from 'express';
import * as express from 'express';
import * as http from 'http';

// Express server
const app = express();

const PORT = process.env.PORT || 4201;

const token = 'mock-token';
const id = 42;
const email = 'admin';
const password = 'admin';

app.use(express.json());

app.use((_req: Request, res: Response, next: any) => {
  res.header('Access-Control-Allow-Origin', '*');
  next();
});

// Login
app.post('/login', (req: Request, res: Response) => {
  if (req.body.email === email && req.body.password === password) {
    return res.send({
      token,
    });
  } else {
    return res.sendStatus(400);
  }
});

// User info
app.get('/self', (req: Request, res: Response) => {
  if (req.headers.authorization === token) {
    return res.send({ id, email });
  } else if (!req.query.token) {
    return res.sendStatus(401);
  } else if (req.query.token !== token) {
    return res.sendStatus(403);
  }

  return res.sendStatus(400);
});

// Handle CORS
app.options('/*', (_req: Request, res: Response) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', '*');
  res.header('Access-Control-Allow-Headers', '*');
  res.sendStatus(200);
});

const httpServer = http.createServer(app);

// Start up the Node server
httpServer.listen(PORT, () => {
  console.log(`Mock data HTTP server listening on http://localhost:${PORT}`);
});
