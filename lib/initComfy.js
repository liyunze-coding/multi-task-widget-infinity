// Usage
import TwitchAuth from "./handleDCF.js";
import credentials from "../auth.js";

const twitchAuth = new TwitchAuth(credentials.clientId, credentials.scopes);
twitchAuth.init().then((data) => {
	console.log(data);
	console.log(credentials);
	ComfyJS.Init(
		credentials.sender,
		`oauth:${twitchAuth.access_token}`,
		credentials.channel
	);
});
