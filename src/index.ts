import 'dotenv/config';
import express from 'express';
const app = express();
import * as fs from 'fs';
import * as path from 'path';
import { Configuration, OpenAIApi } from 'openai';
import { db } from './database';

app.use(express.json());

const openai = new OpenAIApi(
  new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
  }),
);

const html = fs.readFileSync(
  path.resolve(__dirname, './templates/index.html'),
  'utf8',
);

app.get('/', (req, res) => {
  res.set('Content-Type', 'text/html');
  res.send(Buffer.from(html));
});

app.post('/chat', async (req, res) => {
  const response = await openai.createChatCompletion({
    model: 'gpt-3.5-turbo',
    temperature: req.body.temperature,
    top_p: req.body.top_p,
    messages: req.body.messages,
  });

  const message = response.data.choices[0].message?.content ?? null;

  db.run(
    'INSERT INTO chats (temperature, top_p, messages, response, usage) VALUES (?, ?, ?, ?, ?)',
    [
      req.body.temperature,
      req.body.top_p,
      JSON.stringify(req.body.messages),
      message,
      JSON.stringify(response.data.usage),
    ],
    function (err) {
      if (err) throw new Error('Error inserting chat into database');
      res.send({
        id: this.lastID,
        message,
        usage: response.data.usage,
      });
    },
  );
});

app.put('/like/:id', (req, res) => {
  db.run(
    `UPDATE chats
      SET like = ?
      WHERE id = ?`,
    [req.body.like, parseInt(req.params.id, 10)],
    function (err) {
      if (err) {
        res.status(400).json({ message: 'Error saving feedback' });
        return;
      }
      res.sendStatus(204);
    },
  );
});

const PORT = process.env.PORT || 8000;

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
