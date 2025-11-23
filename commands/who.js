module.exports = {
	name: "who",
	exec: async (client, msg, args) => {
		let results = {}
		for await (let sv of client.aosBridge.connections) {
			sv.send_msg({
				type: "who_cmd"
			});

			let waitfor = () => {
				return new Promise((res, rej) => {
					sv.socket.once("message", (data) => {
						res(JSON.parse(data.toString()));
					})
				});
			};

			let getinfos = await waitfor();
			results[getinfos.args.server_id] = getinfos.args.players;
		}

		let msg_send = "**PLAYERS ONLINE IN ALL SERVERS**\n";

		for (let sv_name in results) {
			msg_send += `\`${sv_name}\`: ${results[sv_name].join(", ").replace(/@/g, "@ ")}`;
		}

		msg.reply(msg_send);
	}
}