const fs = require("fs");

module.exports = {
	name: "warmap",
	exec: (client, msg, args) => {
		let maps = fs.readdirSync("./maps");
		let mapLength = maps.length;
		if (!mapLength) {
			msg.reply("We didn't saved any map yet.");
			return;
		}

		msg.reply({files: [`./maps/${maps[mapLength-1]}`]});
	}
}