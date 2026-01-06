let params = {};

function respond(template, params, parentId = null) {
	if (getSetting("replyInChat")) {
		Object.keys(params).forEach((key) => {
			console.log(`{${key}}: ${params[key]}`);
			template = template.replaceAll(`{${key}}`, params[key]);
		});

		template = template.charAt(0).toUpperCase() + template.slice(1);

		if (!parentId) {
			ComfyJS.Say(template);
		} else {
			ComfyJS.Reply(parentId, template);
		}
	}
}

function isMod(flags) {
	return flags.broadcaster || flags.mod;
}

function isStreamer(flags) {
	return flags.broadcaster;
}

ComfyJS.onCommand = (user, command, message, flags, extra) => {
	if (!getSetting("listenAcrossSharedChat")) {
		// Reject messages from another chat during shared chat if room information
		// is present and doesn't match the current chat.
		const { roomId, userState } = extra;
		const sourceRoomId = userState["source-room-id"];
		if (roomId && sourceRoomId && roomId !== sourceRoomId) return;
	}

	command = `!${command.toLowerCase()}`;

	processCommand(user, command, message, flags, extra);
};

const oauth_token = auth.oauth.includes("oauth:")
	? auth.oauth
	: `oauth:${auth.oauth}`;
const auth_username = auth.username ? auth.username : auth.channel;

ComfyJS.Init(auth_username, `${oauth_token}`, [auth.channel]);
