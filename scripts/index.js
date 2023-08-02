const commands = configs.commands;
const responses = configs.responses;

let params = {};

function respond(template, params) {
	ComfyJS.Say(
		template
			.replace("{user}", `@${params.user}`)
			.replace("{message}", params.message)
			.replace("{mentioned}", `@${params.mentioned}`)
			.replace("{task}", params.task)
			.replace("{originalTask}", params.originalTask)
	);
}

function isMod(flags) {
	return flags.broadcaster || flags.mod;
}

ComfyJS.onCommand = (user, command, message, flags, extra) => {
	command = `!${command.toLowerCase()}`;

	params = {
		user: user,
		message: message,
		mentioned: "",
		task: "",
		originalTask: "",
	};

	if (commands.addTaskCommands.includes(command)) {
		let addStatus = addTask(user, extra.userColor, message);

		if (addStatus === 0) {
			// limit has reached
			respond(responses.noTaskAdded, params);
		} else if (addStatus === 1) {
			// duplicate task
			respond(responses.duplicateTask, params);
		} else if (addStatus === 2) {
			// task has no content
			respond(responses.noTaskContent, params);
		} else if (addStatus === 3) {
			// task added
			respond(responses.taskAdded, params);
		}
	} else if (commands.editTaskCommands.includes(command)) {
		let editStatus = editTask(user, message);

		if (editStatus === 0) {
			// no task
			respond(responses.noTask, params);
		} else if (editStatus === 1) {
			// invalid input
			respond(responses.noTaskEdit, params);
		} else {
			// task edited
			params.task = editStatus[1];
			params.originalTask = editStatus[0];
			respond(responses.taskEdited, params);
		}
	} else if (commands.deleteTaskCommands.includes(command)) {
		let removeStatus = removeTask(user, message);
		if (removeStatus === 0) {
			// no task
			respond(responses.noTask, params);
		} else if (removeStatus === 1) {
			// invalid input
			respond(responses.specifyTaskIndex, params);
		} else {
			// task deleted
			params.task = removeStatus;
			respond(responses.taskDeleted, params);
		}
	} else if (commands.finishTaskCommands.includes(command)) {
		let finishStatus = markTaskDone(user, message);

		if (finishStatus === 0) {
			// user has no tasks
			respond(responses.noTask, params);
		} else if (finishStatus === 1) {
			// invalid input
			respond(responses.specifyTaskIndex, params);
		} else {
			// task finished
			params.task = finishStatus;
			respond(responses.taskFinished, params);
		}
	} else if (commands.checkCommands.includes(command)) {
		if (message === "") {
			let response = checkTasks(user);
			if (response === 0) {
				return respond(responses.noTask, params);
			}
			return ComfyJS.Say(response);
		} else {
			let mentioned = message.replace("@", "");
			let response = checkTasks(mentioned);
			if (response === 0) {
				// no tasks
				return respond(responses.noTaskA, params);
			}
			return ComfyJS.Say(response);
		}
	} else if (commands.adminDeleteCommands.includes(command)) {
		if (!isMod(flags)) {
			respond(responses.notMod, params);
			return;
		}
		let mentioned = message.replace("@", "");

		if (mentioned === "") {
			respond(responses.specifyUser, params);
			return;
		}

		clearUserTasks(mentioned);
		params.mentioned = mentioned;
		respond(responses.adminDeleteTasks, params);
		return mentioned;
	} else if (commands.adminClearDoneCommands.includes(command)) {
		if (!isMod(flags)) {
			respond(responses.notMod, params);
			return;
		} else {
			clearAllDoneTasks();
			respond(responses.clearedDone, params);
		}
	} else if (commands.adminClearAllCommands.includes(command)) {
		if (!isMod(flags)) {
			respond(responses.notMod, params);
			return;
		} else {
			clearAllTasks();
			respond(responses.clearedAll, params);
		}
	} else if (commands.helpCommands.includes(command)) {
		respond(responses.help, params);
	} else if (commands.additionalCommands[command]) {
		respond(commands.additionalCommands[command], params);
	} else {
		// command not found
	}
};

ComfyJS.Init(auth.username, `oauth:${auth.oauth}`, [auth.channel]);
