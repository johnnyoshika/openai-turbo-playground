# OpenAI Turbo Playground

Playground to experiment with OpenAI's Turbo (i.e. ChatGPT) API.

## Setup

- Clone this repo
- Run `npm ci` to install dependencies
- Copy `.env.example` to `.env` and add OpenAI API Key

## Start

```
npm start
```

## Debug in VS Code

<kbd>F5</kbd>

_Note: Re-compile on file change isn't available in debug mode, so stop/start is required to reflect code changes. Also, every time template/index.html is changed, `npm start` needs to run to copy the changed file to dist/templates folder._

## Build

```
npm run build
```

Deployable build will be in `dist` folder.

Command to run production app in Linux / macOS:

```
OPENAI_API_KEY={key}
node index.js
```

Command to run production app in Windows:

```
$env:OPENAI_API_KEY="{key}"
node index.js
```

## Deploy to Raspberry Pi

First make sure `projects/openai-turbo-playground` folder exists on the Raspberry Pi.

```
npm run build
npm run copyfiles
scp -rp dist/* pi:projects/openai-turbo-playground
scp -rp package* pi:projects/openai-turbo-playground
```

Inside Raspberry Pi:

```
curl https://raw.githubusercontent.com/creationix/nvm/master/install.sh | bash
source ~/.profile
nvm install 16.13.2
npm ci
```

Create Service:

```
sudo nano /etc/systemd/system/openai-turbo-playground.service
```

Set contents of the file to:

```
[Unit]
Description=OpenAI Turbo Playground
After=network.target

[Service]
User=pi
WorkingDirectory=/home/pi/projects/openai-turbo-playground
Environment=PORT=8888
Environment=OPENAI_API_KEY={key}
ExecStart=/home/pi/.nvm/versions/node/v16.13.2/bin/node /home/pi/projects/openai-turbo-playground/index.js
Restart=on-failure

[Install]
WantedBy=multi-user.target
```

Enable our service for autostart: `sudo systemctl enable openai-turbo-playground`
Start: `sudo systemctl start openai-turbo-playground`

## Data

Responses will be stored in data.sqlite. To get all chats that have been liked or disliked, execute this query:

```
sqlite> select id, temperature, top_p, like from chats where like is not null;
```

Query that returns id and first message content (pulling first content from messages JSON array):

```
SELECT id, json_extract(messages, '$[0].content') AS content FROM chats where like = 1 order by id;
```

Assuming a description column is added:

```
ALTER TABLE chats
ADD COLUMN column TEXT;
```

...tag all descriptions with `Bloom's taxonomy` if the `Bloom` appears in content of first message:

```
UPDATE chats
SET description = 'Bloom''s taxonomy'
WHERE like = 1
  AND description IS NULL
  AND json_extract(messages, '$[0].content') LIKE '%Bloom%'
```

Other useful queries:

```
.header on
.mode column
.width 10 30 10 10 200
SELECT id, description, temperature, top_p, json_extract(messages, '$[0].content') AS content FROM chats where like = 1 order by id;
```

```
.mode line
SELECT id, temperature, top_p, json_extract(messages, '$[0].role') AS role, json_extract(messages, '$[0].content') AS content FROM chats where id = {id};
```
