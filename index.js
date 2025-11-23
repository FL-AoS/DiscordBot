const Discord = require("discord.js");

const {DISCORD_TOKEN, SUGGESTIONS_CHAT} = require("./config.json");
const fs = require("fs");
const mapCapture = require("./mapCaptures.js");
const wssBridge = require("./bridge/wsserver.js");

const { LOG_INFO, LOG_ERROR } = require("./utils/logger.js");

// start map  tracking
mapCapture();

class Alice extends Discord.Client {
	constructor(cfg) {
		super(cfg);

		this.commands = {};

		this.on("clientReady", this.handleReady);
		this.on("messageCreate", this.handleMessage);

		this.aosBridge = new wssBridge(this);

		this.loadCommands();
	}

	loadCommands() {
		let cmdDir = fs.readdirSync("./commands");
		for (let file of cmdDir) {
			let cmd = require("./commands/"+file);
			this.commands[cmd.name] = cmd.exec;

			LOG_INFO(`Loaded command: ${cmd.name}`);
		}
	}

	handleReady() {
		LOG_INFO("Discord bot is ready!");
	}

	async handleMessage(msg) {
		if (msg.channel.id == SUGGESTIONS_CHAT) {
			msg.react("👍");
			msg.react("👎");
			return;
		}

		this.aosBridge.connections.forEach(c => {
			if (!c.chat_channel.includes(msg.channel.id) &&
				!c.cmd_channel.includes(msg.channel.id)) return;

			if (msg.author.bot)
				return;

			let msg_array = msg.content.split("!");

			if (!msg_array[1] && c.chat_channel.includes(msg.channel.id)){
				c.send_msg({
					server_id: "all",
					user: (msg.member != null) ? msg.member.displayName : msg.author.username,
					content: msg.content
				});

				return;
			} else if (msg_array[1] && c.cmd_channel.includes(msg.channel.id)) {
				if (msg_array[0] != c.prefix) return;
				if (!msg.member.permissions.has("BAN_MEMBERS")) return msg.reply("You cant use this.");

				c.send_msg({
					server_id: msg_array[0],
					user: (msg.member != null) ? msg.member.displayName : msg.author.username,
					content: `/${msg_array[1]}`
				});
			}
		})

		if (!msg.content.startsWith("!"))
			return;

		let args = msg.content.split(" ");
		let cmd = args.pop().substr(1);

		if (cmd in this.commands)
			this.commands[cmd](this, msg, args);
	}
}

const client = new Alice({
    intents: [Discord.GatewayIntentBits.Guilds, Discord.GatewayIntentBits.GuildMessages, Discord.GatewayIntentBits.MessageContent],
    presence: {
    	status: "idle",
    	activities: [{name: "Ace of Spades"}]
    }
});

client.login(DISCORD_TOKEN)
