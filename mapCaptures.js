const fs = require("fs");
const request = require("request");
const {createCanvas} = require("canvas");
const { WAR_IP, MAP_SAVE_INTERVAL_MIN } = require("./config.json");
const { LOG_INFO, LOG_ERROR } = require("./utils/logger.js");

const aos = require("aos.js");
let client = new aos.Client({
				name: "Alice,The Camera"
			});

let last_shot = 0;

function trackMap() {
	LOG_INFO("Starting to save war map");
	request("https://services.buildandshoot.com/serverlist.json", (err, res, body) => {
		if (err)
			return LOG_ERROR("Error on getting servers:", err);
		if (res.statusCode != 200)
			return LOG_ERROR("Error non 200 statusCode:", res.statusCode);

		for (let server of JSON.parse(body)) {
			if (server.identifier == WAR_IP) {
				if (server.players_current < 1)
					break;

				client.once("StateData", () => {
					LOG_INFO("Saving map...");
					//client.joinGame({team: -1});

					let canvas = createCanvas(512, 512);
					let ctx = canvas.getContext("2d");

					for (let x = 0; x < 512; x++) {
						for (let y = 0; y < 512; y++) {
							let block = client.game.map.getTopBlock(x,y);

							ctx.fillStyle = `rgb(${block.color.r}, ${block.color.g}, ${block.color.b})`;
							ctx.fillRect(x, y, 1, 1);
						}
					}

					let timestamp = Date.now();
					let b = canvas.toBuffer('image/png');
					if (last_shot != 0) {
						let data = fs.readFileSync(`./maps/putz.png`);
						if (Buffer.compare(data,b)==0) {
							client.disconnect();
							return;
						}
					}
					fs.writeFileSync(`./maps/putz.png`, b);
					last_shot=timestamp;
					LOG_INFO(`Created map: ./maps/putz.png`);

					client.disconnect();
				});

				client.connect(WAR_IP);
			}
		}
	})
}

module.exports = () => {
	trackMap();
	setInterval(trackMap, 1000*60*MAP_SAVE_INTERVAL_MIN);
}
