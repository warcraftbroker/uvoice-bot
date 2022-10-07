const path = require('node:path');
const fs = require('node:fs');
require('dotenv').config();
// Require the necessary discord.js classes
const { Client, Intents, NewsChannel } = require('discord.js');

global.customChannelList = [];

// Create a new client instance
const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_VOICE_STATES] });

const eventsPath = path.join(__dirname, 'events');
const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

for (const file of eventFiles) {
	const filePath = path.join(eventsPath, file);
	const event = require(filePath);
	if (event.once) {
		client.once(event.name, (...args) => event.execute(...args));
	} else {
		client.on(event.name, (...args) => event.execute(...args));
	}
}

client.on('channelDelete', c => {

	console.log(c.id);

	console.log('channel delete event registered!');
	global.customChannelList = global.customChannelList.filter(channel => channel.channelId != c.id);

	console.log(global.customChannelList);
  
  })

client.on('interactionCreate', async interaction => {


	if (!interaction.isCommand()) return;
	await interaction.deferReply({ ephemeral: true });

	if(interaction.commandName == 'voice') {

		let channelName = interaction.options.getString('name');
		if(!channelName) channelName = interaction.member.displayName + '\'s channel';

		if(!await channelExists(interaction)) {
			console.log('creating channel');
			let newVoiceChannel = await createVoiceChannel(interaction, channelName, client);
			let newCustom = {ownerId: interaction.member.user.id, channelId: newVoiceChannel.id, initiateDeletion: (channel) => {return setTimeout(() => {channel.delete().catch(() => {});}, 15000);}}
			newCustom.timeoutRef = newCustom.initiateDeletion(newVoiceChannel);

			global.customChannelList.push(newCustom);
			interaction.editReply({ content: 'Dein Voice channel wurde erstellt! Aber Achtung, leere Kanäle werden nach kurzer Zeit automatisch gelöscht.', ephemeral: true, components: [] });

		}
	}

});

async function channelExists(interaction) {
	// Check if owner is present in channel list
	let owner = global.customChannelList.find(channel => channel.ownerId == interaction.member.user.id);

	if(owner != null) {
		interaction.editReply({ content: 'Dein Voice Channel existiert bereits!', ephemeral: true, components: [] });
		console.log('channel exists');
		return true;
	} else {
		console.log('channel doesnt exist');
		return false;
	}


}

async function createVoiceChannel(interaction, voiceChannelName, client) {

	const guild = await client.guilds.fetch(process.env.GUILD_ID);
	const categoryChannel = await guild.channels.fetch(process.env.CHANNEL_CATEGORY_ID);


	const permissions = [
		{
			// set default permissions
			id: guild.roles.everyone,
			allow: ['VIEW_CHANNEL','CONNECT', 'SPEAK', 'USE_VAD'],
		},
		{
			id: interaction.member.user.id,
			allow: ['MANAGE_CHANNELS', 'MANAGE_ROLES'],
		},
	];

	const voiceChannel = await categoryChannel.createChannel(voiceChannelName, {
		type: 'GUILD_VOICE',
        position: 0,
		permissionOverwrites: permissions,
	});

	return voiceChannel;
}

// Login to Discord with your client's token
client.login(process.env.CLIENT_TOKEN);
