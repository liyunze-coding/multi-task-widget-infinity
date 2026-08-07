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

function showOAuthExpiredModal() {
	const modal = document.getElementById("oauth-expired-modal");
	if (modal) modal.classList.remove("hidden");
}

async function validateOAuthToken() {
	const bareToken = oauth_token.replace(/^oauth:/i, "");
	const response = await fetch("https://id.twitch.tv/oauth2/validate", {
		headers: { Authorization: `OAuth ${bareToken}` },
	});
	return response.ok;
}

async function initChat() {
	try {
		const valid = await validateOAuthToken();
		if (!valid) {
			showOAuthExpiredModal();
			return;
		}
	} catch (err) {
		console.warn("Could not validate OAuth token; connecting anyway.", err);
	}

	ComfyJS.Init(auth_username, oauth_token, [auth.channel]);
}

initChat();
