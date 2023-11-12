const commands = configs.commands;
const responses = configs.responses;

let params = {};

function isMod(flags) {
	return flags.broadcaster || flags.mod;
}

ComfyJS.onCommand = (user, command, message, flags, extra) => {
	command = `!${command.toLowerCase()}`;

	if (commands.addTaskCommands.includes(command)) {
		addTask(user, extra.userColor, message);
	} else if (commands.editTaskCommands.includes(command)) {
		return editTask(user, message);
	} else if (commands.deleteTaskCommands.includes(command)) {
		removeTask(user, message);
	} else if (commands.finishTaskCommands.includes(command)) {
		if (message === "all") {
			return markAllTasksAsDone(user);
		}

		return markTaskDone(user, message);
	} else if (commands.unfinishTaskCommands.includes(command)) {
		markTaskUndone(user, message);
	} else if (commands.adminDeleteCommands.includes(command)) {
		if (!isMod(flags)) {
			return;
		}
		let mentioned = message.replace("@", "");

		if (mentioned === "") {
			return;
		}

		clearUserTasks(mentioned);
	} else if (commands.adminClearDoneCommands.includes(command)) {
		if (!isMod(flags)) {
			return;
		} else {
			clearAllDoneTasks();
		}
	} else if (commands.adminClearAllCommands.includes(command)) {
		if (!isMod(flags)) {
			return;
		} else {
			clearAllTasks();
		}
	} else if (commands.clearMyDoneCommands.includes(command)) {
		clearOwnDoneTasks(user);
	} else if (commands.adminClearNotStreamerCommands.includes(command)) {
		if (!isMod(flags)) {
			return;
		} else {
			clearAllExceptStreamer(auth.channel);
		}
	}
};

if (configs.settings.modifyLocalStorage) {
	ComfyJS.Init(auth.username, `oauth:${auth.oauth}`, [auth.channel]);
}
