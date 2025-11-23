function getFileInfos() {
	let e = new Error();
	let infos = e.stack.split("\n")[3].split(/\((.*):(\d+):(\d+)/gi);

	return `${infos[1]}:${infos[2]}:${infos[3]}`;
}

function LOG_INFO(str, ...args) {
	console.log("\033[0;33m[INFO]\033[39;49m", getFileInfos(), str, ...args);
}

function LOG_ERROR(str, ...args) {
	console.log("\033[0;31m[ERROR]", getFileInfos(), str, ...args, "\033[39;49m");
}

function LOG_WARNING(str, ...args) {
	console.log("\033[0;33m[WARNING]", getFileInfos(), str, ...args, "\033[39;49m");
}

module.exports = {
	LOG_INFO,
	LOG_ERROR,
	LOG_WARNING
}