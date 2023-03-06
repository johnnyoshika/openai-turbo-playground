import 'dotenv/config';
import express from 'express';
const app = express();
import * as fs from 'fs';
import * as path from 'path';
import { Configuration, OpenAIApi } from 'openai';

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

  res.send({
    message: response.data.choices[0].message?.content ?? null,
    usage: response.data.usage,
  });
});

const PORT = process.env.PORT || 8000;

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
