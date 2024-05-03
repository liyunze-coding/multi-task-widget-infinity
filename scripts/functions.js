function getResponse(responseName) {
	return (
		configs.responses[responseName] ??
		defaultConfigs.responses[responseName]
	);
}

function getCommand(commandName) {
	console.log(configs.commands[commandName]);
	console.log(defaultConfigs.commands[commandName]);
	return (
		configs.commands[commandName] ?? defaultConfigs.commands[commandName]
	);
}
