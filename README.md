# uvoice-bot

uvoice is a minimalist Discord-Bot that features a single slash command:

/voice [optional channel name]

This command will create a new Voice channel in the channel category specified by CHANNEL_CATEGORY_ID.
It will also grant elevated permissions to the user who created the voice channel.

## Project setup
```
1. clone repository 
2. npm install
3. setup .env file for CLIENT_TOKEN, CLIENT_ID, GUILD_ID and CHANNEL_CATEGORY_ID
4. execute 'node deploy-commands.js'
5. execute 'node index.js'
```
