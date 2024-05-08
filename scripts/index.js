var commands = configs.commands;

let params = {};

const client = new StreamerbotClient({
	port: 6968,
});

client.on("Twitch.ChatMessage", onData);
client.on("YouTube.Message", onData);
client.on("General.Custom", onCustom);

function onCustom(data) {
	console.log(data);
	if (data.data.custom && data.data.custom.toLowerCase() === "backup") {
		console.log("Backup received");
		backupStorage();
	} else if (data.data.backupFileContent) {
		console.log("File received");
		console.log(data.data.backupFileContent);
		loadDataToDB(data.data.backupFileContent);
	}
}

async function respond(template, params = {}) {
	Object.keys(params).forEach((key) => {
		template = template.replace(`{${key}}`, params[key]);
	});

	// capitalize first letter of template
	template = template.charAt(0).toUpperCase() + template.slice(1);

	const source = params["source name"].toLowerCase();

	if (source === "youtube") {
		const streamerYTBotResponse = await client.doAction(
			"390ff8f2-7945-4eba-be2a-a1c0e4ba535d",
			{
				response: template,
			}
		);

		// console.log(streamerYTBotResponse);
	} else {
		const streamerTwitchBotResponse = await client.doAction(
			"8ff809be-e269-4f06-9528-021ef58df436",
			{
				response: template,
			}
		);

		// console.log(streamerTwitchBotResponse);
	}
}

/**
 * Handles incoming data, processes it if it's a YouTube message event.
 *
 * @param {Object} data - The incoming data object.
 * @param {Object} data.event - The event details.
 * @param {string} data.event.source - The source of the event.
 * @param {string} data.event.type - The type of the event.
 * @param {Object} data.data - The payload of the event.
 * @param {string} data.data.message - The message from the event.
 * @param {Object} data.data.user - The user who triggered the event.
 * @param {string} data.data.user.name - The name of the user.
 * @param {boolean} data.data.user.isOwner - Flag indicating if the user is the owner.
 * @param {boolean} data.data.user.isModerator - Flag indicating if the user is a moderator.
 */
function onData(data) {
	if (!data.event) return;

	if (data.event.source === "YouTube" && data.event.type === "Message") {
		const payload = data.data;

		// check if message starts with prefix
		if (!payload.message.startsWith("!")) return;

		const command = payload.message.split(" ")[0];

		// remove first word from message
		const message = payload.message.split(" ").slice(1).join(" ");

		// get user from payload
		const user = payload.user.name;

		// set flags
		const flags = {
			broadcaster: payload.user.isOwner,
			mod: payload.user.isModerator,
		};

		let extra = {
			userColor: "pink",
		};

		processCommand(user, command, message, flags, data.event.source, extra);
	} else if (
		data.event.source === "Twitch" &&
		data.event.type === "ChatMessage"
	) {
		const payload = data.data;

		const command = payload.message.message.split(" ")[0];

		const user = payload.message.displayName;

		const message = payload.message.message.split(" ").slice(1).join(" ");

		// iterate through payload.message.badges
		// each iteration has name in an object
		// if name is "moderator" or "broadcaster", set flags.mod or flags.broadcaster to true
		const badges = payload.message.badges;

		const flags = {
			broadcaster: false,
			mod: false,
		};

		badges.forEach((badge) => {
			if (badge.name === "broadcaster") {
				flags.broadcaster = true;
			} else if (badge.name === "moderator") {
				flags.mod = true;
			}
		});

		let extra = {
			userColor: payload.message.color,
		};

		processCommand(user, command, message, flags, data.event.source, extra);
	}
}

/**
 * Checks if the user is a moderator or broadcaster.
 *
 * @param {Object} flags - The flags object.
 * @param {boolean} flags.broadcaster - Flag indicating if the user is the broadcaster.
 * @param {boolean} flags.mod - Flag indicating if the user is a moderator.
 * @returns {boolean} Returns true if the user is a moderator or broadcaster, false otherwise.
 */
function isMod(flags) {
	return flags.broadcaster || flags.mod;
}

function isStreamer(flags) {
	return flags.broadcaster;
}
