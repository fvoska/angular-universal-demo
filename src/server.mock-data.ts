import { Request, Response } from 'express';
import * as express from 'express';
import * as http from 'http';
import { IHomepageContent } from './app/interfaces/homepage-content.interface';

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

// Homepage data

app.get('/homepage', (req: Request, res: Response) => {
  console.log('/homepage', new Date(Date.now()).toLocaleString());

  const homepage: IHomepageContent = {
    title: 'Welcome',
    text: 'Angular Universal Demo',
    time: Date.now(),
  };

  return res.send(homepage);
});

// Login
app.post('/login', (req: Request, res: Response) => {
  console.log('/login', new Date(Date.now()).toLocaleString());

  if (req.body.email === email && req.body.password === password) {
    return res.send({
      token,
    });
  } else {
    return res.sendStatus(400);
  }
});

// User info
app.get('/user', (req: Request, res: Response) => {
  console.log('/user', new Date(Date.now()).toLocaleString());

  if (req.headers.authorization === token) {
    return res.send({ id, email });
  } else if (!req.query.token) {
    return res.sendStatus(401);
  } else if (req.query.token !== token) {
    return res.sendStatus(403);
  }

  return res.sendStatus(400);
});

// Login status check
app.get('/login-check', (req: Request, res: Response) => {
  console.log('/login-check', new Date(Date.now()).toLocaleString());

  if (req.headers.authorization === token) {
    return res.sendStatus(204);
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
