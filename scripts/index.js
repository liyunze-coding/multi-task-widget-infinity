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
		} else {
			let addResponse = responses.taskAdded;
			params.task = addStatus.task;

			if (addStatus.tasksFailedToAdd !== "") {
				addResponse += ` | Failed to add task(s): "${addStatus.tasksFailedToAdd}"`;
			}

			// task added
			respond(addResponse, params);
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
			let deletedResponse = responses.taskDeleted;
			params.task = removeStatus.removedTasks;

			if (removeStatus.failedTasks !== "") {
				deletedResponse += ` | Failed to delete task(s): "${removeStatus.failedTasks}"`;
			}

			respond(deletedResponse, params);
		}
	} else if (commands.finishTaskCommands.includes(command)) {
		if (message === "all") {
			let finishAllStatus = markAllTasksAsDone(user);

			if (finishAllStatus === 0) {
				// user has no tasks
				respond(responses.noTask, params);
			} else {
				// all tasks finished
				let finishedResponse = responses.allTasksFinished;

				respond(finishedResponse, params);
			}

			return;
		}

		let finishStatus = markTaskDone(user, message);

		if (finishStatus === 0) {
			// user has no tasks
			respond(responses.noTask, params);
		} else if (finishStatus === 1) {
			// invalid input
			respond(responses.specifyTaskIndex, params);
		} else {
			// task finished
			let finishedResponse = responses.taskFinished;

			params.task = finishStatus.markedTasks;

			if (finishStatus.failedTasks !== "") {
				finishedResponse += ` | Failed to finish task(s): "${finishStatus.failedTasks}"`;
			}

			respond(finishedResponse, params);
		}
	} else if (commands.unfinishTaskCommands.includes(command)) {
		let unfinishStatus = markTaskUndone(user, message);

		if (unfinishStatus === 0) {
			// user has no tasks
			respond(responses.noTask, params);
		} else if (unfinishStatus === 1) {
			// invalid input
			respond(responses.specifyTaskIndex, params);
		} else {
			// task unfinished
			let unfinishedResponse = responses.taskUnfinished;

			params.task = unfinishStatus.markedTasks;

			if (unfinishStatus.failedTasks !== "") {
				unfinishedResponse += ` | Failed to unfinish task(s): "${unfinishStatus.failedTasks}"`;
			}

			respond(unfinishedResponse, params);
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
	} else if (commands.clearMyDoneCommands.includes(command)) {
		let response = clearOwnDoneTasks(user);

		if (response === 0) {
			// no tasks
			respond(responses.noTask, params);
			return;
		}

		respond(responses.clearedMyDone, params);
	} else if (commands.adminClearNotStreamerCommands.includes(command)) {
		clearAllExceptStreamer(auth.channel);
		respond(responses.clearTasksExceptBroadcaster, params);
	} else if (commands.helpCommands.includes(command)) {
		respond(responses.help, params);
	} else if (commands.listCommands.includes(command)) {
		let response = listTasks(user);
		if (response === 0) {
			respond(responses.noTask, params);
			return;
		}
		ComfyJS.Say(response);
	} else if (commands.additionalCommands[command]) {
		respond(commands.additionalCommands[command], params);
	} else {
		// command not found
	}
};

ComfyJS.Init(auth.username, `oauth:${auth.oauth}`, [auth.channel]);
