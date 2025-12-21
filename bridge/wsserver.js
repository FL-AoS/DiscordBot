const { WebSocketServer } = require("ws");
const ServerConnection = require("./serverConnection.js");
const Discord = require("discord.js");
const { AOS_BRIDGE_TOKEN, AOS_BRIDGE_PORT } = require("../config.json");
const { LOG_INFO, LOG_ERROR, LOG_WARNING } = require("../utils/logger.js");

class WSServer {
	constructor(discord) {
		this.connections = [];

		this.discord = discord;

		this.wss = new WebSocketServer({
			port: AOS_BRIDGE_PORT
		});

		this.wss.on("connection", (c, req) => {
			let server = new ServerConnection(c);
			this.connections.push(server);
			LOG_INFO(`Connection received from: ${req.socket.remoteAddress}`);

			c.on("message", (msg) => {
				let data = JSON.parse(msg.toString());
				let args = data.args;

				if (data.token != AOS_BRIDGE_TOKEN) {
					LOG_WARNING(`${req.socket.remoteAddress} sent wrong token, disconnecting...`);
					c.close();
					return;
				}

				switch(data.event){
					case "nice_to_meet_you":
						server.max_players = args.max_players;

						server.chat_channel.push(args.chat_channel);
						server.cmd_channel.push(args.cmd_channel);
						server.prefix = args.prefix;
						server.webhook = args.webhook;

						LOG_INFO(`Connection ${req.socket.remoteAddress} registered as ${server.prefix}`);
					break;

					case "login":
						server.post_discord(`\`${server.prefix}\` ${args.name.replace(/@/g, '@ ')} joined on the game. (${args.online_players}/${server.max_players} Online)`);
						break;

					case "disconnect":
						server.post_discord(`\`${server.prefix}\` ${args.name.replace(/@/g, '@ ')} left from the server. (${args.online_players}/${server.max_players} Online)`);
						break;

					case "message":
						server.post_discord(`\`${server.prefix}\` <${args.name.replace(/@/g,'@ ')}> ${args.msg.replace(/@/g, '@ ')}`, `${args.name} (#${args.player_id})`, args.team);
						break;

					case "command":
						try {
							let cmdch = this.discord.channels.cache.get(server.cmd_channel[0]);

							if(args.cmd == "admin") {
								if (!args.params[0]) return;

								let embed = new Discord.EmbedBuilder()
								.setTitle("NEW REPORT!!")
								.addFields([
									{
										name: "**Reporter**",
										value: `**- Name:** _${args.name}_\n**- Id:** _#${args.player_id}_\n**- Ip:** _${args.ip}_`
									},
									{
										name: "**Report**",
										value: `**-** _${args.params.join(" ")}_`
									}
								])
								.setColor([217, 23, 9])
								.setTimestamp();

								cmdch.send({
									embeds: [embed]
								});
							}
						} catch (e){
							LOG_ERROR(`${server.prefix} - Is throwing errors.`, e);
						}
						break;

					case "msg_reply":
						try {
							let cmdch = this.discord.channels.cache.get(server.cmd_channel[0]);

							cmdch.send(args.msg);
						} catch (e){
							LOG_ERROR(`${server.prefix} - Is throwing errors.`, e);
						}
						break;
				}
			});

			c.on("close", () => {
				LOG_INFO(`${req.socket.remoteAddress} - ${server.prefix} disconnected!`);
				const index = this.connections.indexOf(server);
				if (index > -1) {
					LOG_INFO(`${req.socket.remoteAddress} - ${server.prefix} got removed from the array.`);
					this.connections.splice(index, 1);
				}
			})
		});
	}
}

module.exports = WSServer;