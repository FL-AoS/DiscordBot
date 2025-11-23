const request = require("request");

class ServerConnection {
	constructor(socket) {
		this.max_players = 32;

		this.chat_channel = [];
		this.cmd_channel = [];
		this.socket = socket;
		this.prefix;
		this.webhook;
	}

	send_msg(msg) {
		this.socket.send(JSON.stringify(msg));
	}

	post_discord(msg, name, team) {
		let pic = "https://www.buildandshoot.com/assets/images/logo.png";
		if (team === 0){
			pic = "https://i.imgur.com/mjm3Ble.png";
		} else if (team === 1){
			pic = "https://i.imgur.com/Uov3IJg.png";
		} else if (team === -1){
			pic = "https://www.buildandshoot.com/assets/images/logo.png";
		}

		let loJSON = {
			username: name || "SERVER LOGS",
			avatar_url: pic,
			content: msg
		}

		request({
			url: this.webhook,
			method: "POST",
			json: loJSON
		});
	}
}

module.exports = ServerConnection;