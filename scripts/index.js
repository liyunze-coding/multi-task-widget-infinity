const commands = configs.commands;

let params = {};

function respond(template, params) {
	Object.keys(params).forEach((key) => {
		template = template.replace(`{${key}}`, params[key]);
	});

	ComfyJS.Say(template);
}

function isMod(flags) {
	return flags.broadcaster || flags.mod;
}

function isStreamer(flags) {
	return flags.broadcaster;
}

ComfyJS.onCommand = (user, command, message, flags, extra) => {
	command = `!${command.toLowerCase()}`;

	params = {
		user: user,
		message: message,
		pointName: configs.settings.pointsName,
	};

	if (commands.addTaskCommands.includes(command)) {
		let addRequest = addTask(user, extra.userColor, message);

		if (addRequest.status !== 200) {
			respond(addRequest.body.error, params);
			return;
		}

		let addedResponse = responses.taskAdded;
		params.task = addRequest.body.task;

		if (addRequest.body.tasksFailedToAdd !== "") {
			addedResponse += ` | Failed to add task(s): "${addRequest.body.tasksFailedToAdd}"`;
		}

		respond(addedResponse, params);
	} else if (commands.editTaskCommands.includes(command)) {
		let editRequest = editTask(user, message);

		if (editRequest.status !== 200) {
			respond(editRequest.body.error, params);
			return;
		}

		let originalTask = editRequest.body.originalTask;
		let newTask = editRequest.body.newTask;

		params.task = newTask;
		params.originalTask = originalTask;

		respond(responses.taskEdited, params);
	} else if (commands.deleteTaskCommands.includes(command)) {
		let removeRequest = removeTask(user, message);

		if (removeRequest.status !== 200) {
			respond(removeRequest.body.error, params);
			return;
		}
		let deletedResponse = responses.taskDeleted;

		let removedTasks = removeRequest.body.removedTasks;
		let failedTasks = removeRequest.body.failedTasks;

		params.task = removedTasks;

		if (failedTasks !== "") {
			deletedResponse += ` | Failed to delete task(s): "${failedTasks}"`;
		}

		respond(deletedResponse, params);
	} else if (commands.finishTaskCommands.includes(command)) {
		if (message === "all") {
			let finishAllRequest = markAllTasksAsDone(user);

			if (finishAllRequest.status !== 200) {
				respond(finishAllRequest.body.error, params);
				return;
			}

			let finishedAllResponse = responses.allTasksFinished;
			params.doneCount = completedTasksCount(user);

			respond(finishedAllResponse, params);
			return;
		}

		let finishRequest = markTaskDone(user, message);

		if (finishRequest.status !== 200) {
			respond(finishRequest.body.error, params);
			return;
		}

		let finishedResponse = responses.taskFinished;

		params.task = finishRequest.body.markedTasks;
		params.doneCount = completedTasksCount(user);
		params.pointCount =
			finishRequest.body.markedTasksCount *
			configs.settings.pointsPerTask;

		if (finishRequest.body.failedTasks !== "") {
			finishedResponse += ` | Failed to finish task(s): "${finishRequest.body.failedTasks}"`;
		}

		respond(finishedResponse, params);
	} else if (commands.unfinishTaskCommands.includes(command)) {
		let unfinishRequest = markTaskUndone(user, message);

		if (unfinishRequest.status !== 200) {
			respond(unfinishRequest.body.error, params);
			return;
		}

		// task unfinished
		let unfinishedResponse = responses.taskUnfinished;

		params.task = unfinishRequest.body.markedTasks;

		if (unfinishRequest.body.failedTasks !== "") {
			unfinishedResponse += ` | Failed to unfinish task(s): "${unfinishRequest.body.failedTasks}"`;
		}

		respond(unfinishedResponse, params);
	} else if (commands.focusTaskCommands.includes(command)) {
		let focusRequest = focusTask(user, message);

		if (focusRequest.status !== 200) {
			respond(focusRequest.body.error, params);
			return;
		}

		// task focused
		let focusedResponse = responses.taskFocused;

		params.task = focusRequest.body.focusedTask;

		respond(focusedResponse, params);
	} else if (commands.unfocusTaskCommands.includes(command)) {
		let unfocusRequest = unfocusTask(user);

		if (unfocusRequest.status !== 200) {
			respond(unfocusRequest.body.error, params);
			return;
		}

		// task unfocused
		let unfocusedResponse = responses.clearFocused;

		respond(unfocusedResponse, params);
	} else if (commands.checkCommands.includes(command)) {
		if (message === "") {
			let checkRequest = checkTasks(user);
			if (checkRequest.status !== 200) {
				// no tasks
				respond(checkRequest.body.error, params);
				return;
			}

			return ComfyJS.Say(checkRequest.body.reply);
		} else {
			let mentioned = message.replace("@", "");
			let checkRequest = checkTasks(mentioned);

			if (checkRequest.status !== 200) {
				// no tasks
				respond(checkRequest.body.error, params);

				return;
			}
			return ComfyJS.Say(checkRequest.body.reply);
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

		let clearUserTaskResponse = clearUserTasks(mentioned);

		params.mentioned = mentioned;

		if (clearUserTaskResponse.status === 0) {
			// no tasks
			respond(responses.noTaskA, params);
			return;
		}

		respond(responses.adminDeleteTasks, params);
		return;
	} else if (commands.adminClearDoneCommands.includes(command)) {
		if (!isStreamer(flags)) {
			respond(responses.notStreamer, params);
			return;
		}

		clearAllDoneTasks();
		respond(responses.clearedDone, params);
		return;
	} else if (commands.adminClearAllCommands.includes(command)) {
		if (!isStreamer(flags)) {
			respond(responses.notStreamer, params);
			return;
		}

		clearAll();
		respond(responses.clearedAll, params);
		return;
	} else if (commands.clearMyDoneCommands.includes(command)) {
		let clearOwnDoneResponse = clearOwnDoneTasks(user);

		if (clearOwnDoneResponse.status === 0) {
			// no tasks
			respond(responses.noTask, params);
			return;
		}

		respond(responses.clearedMyDone, params);
	} else if (commands.adminClearNotStreamerCommands.includes(command)) {
		if (!isStreamer(flags)) {
			respond(responses.notStreamer, params);
			return;
		}

		clearAllExceptStreamer(auth.channel);
		respond(responses.clearTasksExceptBroadcaster, params);
	} else if (commands.adminClearTasksCommands.includes(command)) {
		if (!isStreamer(flags)) {
			respond(responses.notStreamer, params);
			return;
		}

		clearAllTasks();
		respond(responses.clearedTasks, params);
	} else if (commands.listCommands.includes(command)) {
		let listTaskResponse = listTasks(user);

		if (listTaskResponse.status !== 200) {
			// no tasks
			respond(listTaskResponse.body.error, params);
			return;
		}

		respond(listTaskResponse.body.reply, params);
	} else if (commands.checkCountCommands.includes(command)) {
		if (message === "") {
			let count = completedTasksCount(user);

			params.doneCount = count;

			return respond(responses.checkYourCount, params);
		} else {
			let mentioned = message.replace("@", "");
			let count = completedTasksCount(mentioned);

			params.doneCount = count;
			params.mentioned = mentioned;

			return respond(responses.checkUserCount, params);
		}
	} else if (commands.checkAllCountCommands.includes(command)) {
		let count = getBoardTotalTaskCount();

		if (count === 0) {
			respond(responses.noCountAll, params);
			return;
		}

		params.doneCount = count;

		respond(responses.checkAllCount, params);
	} else if (commands.checkMyPointsCommands.includes(command)) {
		if (message === "") {
			let points = getUserPoints(user);

			params.pointCount = points;

			return respond(responses.checkMyPoints, params);
		} else {
			let mentioned = message.replace("@", "");
			let points = getUserPoints(mentioned);

			params.pointCount = points;
			params.mentioned = mentioned;

			return respond(responses.checkUserPoints, params);
		}
	} else if (commands.syncCountPointsCommands.includes(command)) {
		if (!isStreamer(flags)) {
			respond(responses.notStreamer, params);
			return;
		}

		syncPointsToCount();
		respond(responses.syncCountPoints, params);
	} else if (commands.addPointsCommands.includes(command)) {
		// !addpoints @user 100

		if (!isMod(flags)) {
			respond(responses.notMod, params);
			return;
		}

		let mentioned = message.split(" ")[0].replace("@", "");

		if (mentioned === "") {
			respond(responses.specifyUser, params);
			return;
		}

		let points = message.split(" ")[1];

		if (points === undefined) {
			respond(responses.specifyPoints, params);
			return;
		}

		if (!/^\d+$/.test(points)) {
			respond(responses.invalidNumber, params);
			return;
		}

		points = parseInt(points);

		addPoints(mentioned, points);

		params.mentioned = mentioned;
		params.pointCount = points;

		respond(responses.addPoints, params);
	} else if (commands.reducePointsCommands.includes(command)) {
		if (!isMod(flags)) {
			respond(responses.notMod, params);
			return;
		}

		let mentioned = message.split(" ")[0].replace("@", "");

		if (mentioned === "") {
			respond(responses.specifyUser, params);
			return;
		}

		let points = message.split(" ")[1];

		if (points === undefined) {
			respond(responses.specifyPoints, params);
			return;
		}

		if (!/^\d+$/.test(points)) {
			respond(responses.invalidNumber, params);
			return;
		}

		reducePoints(mentioned, points);

		params.mentioned = mentioned;
		params.pointCount = points;

		respond(responses.reducePoints, params);
	} else if (commands.setUserPointsCommands.includes(command)) {
		if (!isMod(flags)) {
			respond(responses.notMod, params);
			return;
		}

		let mentioned = message.split(" ")[0].replace("@", "");

		if (mentioned === "") {
			respond(responses.specifyUser, params);
			return;
		}

		let points = message.split(" ")[1];

		if (points === undefined) {
			respond(responses.specifyPoints, params);
			return;
		}

		if (!/^\d+$/.test(points)) {
			respond(responses.invalidNumber, params);
			return;
		}

		points = parseInt(points);

		setUserPoints(mentioned, points);

		params.mentioned = mentioned;
		params.pointCount = points;

		respond(responses.setUserPoints, params);
	} else if (commands.setUserTaskCountCommands.includes(commands)) {
		if (!isMod(flags)) {
			respond(responses.notMod, params);
			return;
		}

		let mentioned = message.split(" ")[0].replace("@", "");

		if (mentioned === "") {
			respond(responses.specifyUser, params);
			return;
		}

		let count = message.split(" ")[1];

		if (count === undefined) {
			respond(responses.specifyCount, params);
			return;
		}

		if (!/^\d+$/.test(count)) {
			respond(responses.invalidNumber, params);
			return;
		}

		points = parseInt(points);

		setUserTaskCount(mentioned, count);

		params.mentioned = mentioned;
		params.pointCount = count;

		respond(responses.setUserTaskCount, params);
	} else if (commands.leaderboardCommands.includes(command)) {
		let leaderboardResponse = leaderboardTaskCount(5);

		if (leaderboardResponse.status !== 200) {
			respond(leaderboardResponse.body.error, params);
			return;
		}

		let leaderboard = leaderboardResponse.body.leaderboard;

		respond(leaderboard, params);
	} else if (commands.adminSetBoardCount.includes(command)) {
		if (!isStreamer(flags)) {
			respond(responses.notStreamer, params);
			return;
		}

		// check if message is a number using regex
		if (!/^\d+$/.test(message)) {
			respond(responses.invalidNumber, params);
			return;
		}

		params.count = message;

		setTotalCompleteCount(message);

		respond(responses.setBoardCount, params);
	} else if (commands.adminResetBoardCount.includes(command)) {
		if (!isStreamer(flags)) {
			respond(responses.notStreamer, params);
			return;
		}

		resetBoardCount();
		respond(responses.clearedBoardCount, params);
	} else if (commands.adminResetUsersCount.includes(command)) {
		if (!isStreamer(flags)) {
			respond(responses.notStreamer, params);
			return;
		}

		resetUsersCount();
		respond(responses.clearedUsersCount, params);
	} else if (commands.helpCommands.includes(command)) {
		respond(responses.help, params);
	} else if (commands.additionalCommands[command]) {
		respond(commands.additionalCommands[command], params);
	} else {
		// command not found
	}
};

ComfyJS.Init(auth.username, `oauth:${auth.oauth}`, [auth.channel]);
