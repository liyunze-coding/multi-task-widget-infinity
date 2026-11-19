const auth = (function () {
	// Authentication and channels - required
	const channel = ""; // your channel
	const username = ""; // bot account

	// OBTAIN FROM https://sarayalth.github.io/TwitchOAuthGenerator
	// select Default Scopes
	const oauth = ""; // should be oauth:xxxxxxxxxxxx from the bot account

	return {
		channel,
		username,
		oauth,
	};
})();
