let params = {};

function respond(template, params, parentId = null) {
	if (getSetting("replyInChat")) {
		Object.keys(params).forEach((key) => {
			console.log(`{${key}}: ${params[key]}`);
			template = template.replaceAll(`{${key}}`, params[key]);
		});
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
	command = `!${command.toLowerCase()}`;

	processCommand(user, command, message, flags, extra);
};

const oauth_token = auth.oauth.includes("oauth:")
	? auth.oauth
	: `oauth:${auth.oauth}`;
const auth_username = auth.username ? auth.username : auth.channel;

ComfyJS.Init(auth_username, `${oauth_token}`, [auth.channel]);
