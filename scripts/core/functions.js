function getResponse(responseName) {
	return (
		configs.responses[responseName] ??
		defaultConfigs.responses[responseName]
	);
}

function getCommand(commandName) {
	return (
		configs.commands[commandName] ?? defaultConfigs.commands[commandName]
	);
}

function getSetting(settingName) {
	return (
		configs.settings[settingName] ?? defaultConfigs.settings[settingName]
	);
}
