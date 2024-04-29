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

async function processCommand(user, command, message, flags, extra) {
	params = {
		user: user,
		message: message,
		pointName: configs.settings.pointsName,
	};

	if (commands.addTaskCommands.includes(command)) {
		let addRequest = await addTask(user, extra.userColor, message);

		if (addRequest.status !== 200) {
			respond(addRequest.body.error, params);
			return;
		}

		let addedResponse = getResponse("taskAdded");
		params.task = addRequest.body.task;

		if (addRequest.body.tasksFailedToAdd !== "") {
			addedResponse += ` | Failed to add task(s): "${addRequest.body.tasksFailedToAdd}"`;
		}

		respond(addedResponse, params);
	} else if (commands.editTaskCommands.includes(command)) {
		let editRequest = await editTask(user, message);

		if (editRequest.status !== 200) {
			respond(editRequest.body.error, params);
			return;
		}

		let originalTask = editRequest.body.originalTask;
		let newTask = editRequest.body.newTask;

		params.task = newTask;
		params.originalTask = originalTask;

		respond(getResponse("taskEdited"), params);
	} else if (commands.deleteTaskCommands.includes(command)) {
		let removeRequest = await removeTask(user, message);

		if (removeRequest.status !== 200) {
			respond(removeRequest.body.error, params);
			return;
		}
		let deletedResponse = getResponse("taskDeleted");

		let removedTasks = removeRequest.body.removedTasks;
		let failedTasks = removeRequest.body.failedTasks;

		params.task = removedTasks;

		if (failedTasks !== "") {
			deletedResponse += ` | Failed to delete task(s): "${failedTasks}"`;
		}

		respond(deletedResponse, params);
	} else if (commands.finishTaskCommands.includes(command)) {
		if (message === "all") {
			let finishAllRequest = await markAllTasksAsDone(user);

			if (finishAllRequest.status !== 200) {
				respond(finishAllRequest.body.error, params);
				return;
			}

			let finishedAllResponse = getResponse("allTasksFinished");
			params.doneCount = await completedTasksCount(user);

			respond(finishedAllResponse, params);
			return;
		}

		let finishRequest = await markTaskDone(user, message);

		if (finishRequest.status !== 200) {
			respond(finishRequest.body.error, params);
			return;
		}

		let finishedResponse = getResponse("taskFinished");

		params.task = finishRequest.body.markedTasks;
		params.doneCount = await completedTasksCount(user);
		params.pointCount =
			finishRequest.body.markedTasksCount *
			configs.settings.pointsPerTask;

		if (finishRequest.body.failedTasks !== "") {
			finishedResponse += ` | Failed to finish task(s): "${finishRequest.body.failedTasks}"`;
		}

		respond(finishedResponse, params);
	} else if (commands.unfinishTaskCommands.includes(command)) {
		let unfinishRequest = await markTaskUndone(user, message);

		if (unfinishRequest.status !== 200) {
			respond(unfinishRequest.body.error, params);
			return;
		}

		// task unfinished
		let unfinishedResponse = getResponse("taskUnfinished");

		params.task = unfinishRequest.body.markedTasks;

		if (unfinishRequest.body.failedTasks !== "") {
			unfinishedResponse += ` | Failed to unfinish task(s): "${unfinishRequest.body.failedTasks}"`;
		}

		respond(unfinishedResponse, params);
	} else if (commands.nextTaskCommands.includes(command)) {
		let nextRequest = await nextTask(user, message);

		if (nextRequest.status !== 200) {
			respond(nextRequest.body.error, params);
			return;
		}

		// task next
		let nextResponse = getResponse("taskNext");

		params.oldTask = nextRequest.body.oldTask;
		params.newTask = nextRequest.body.newTask;

		respond(nextResponse, params);
	} else if (commands.nowTaskCommands.includes(command)) {
		let nowRequest = await nowTask(user, extra.userColor, message);

		if (nowRequest.status !== 200) {
			respond(nowRequest.body.error, params);
			return;
		}

		// task now
		let nowResponse = getResponse("nowTask");

		params.task = nowRequest.body.task;

		respond(nowResponse, params);
	} else if (commands.focusTaskCommands.includes(command)) {
		let focusRequest = await focusTask(user, message);

		if (focusRequest.status !== 200) {
			respond(focusRequest.body.error, params);
			return;
		}

		// task focused
		let focusedResponse = getResponse("taskFocused");

		params.task = focusRequest.body.focusedTask;

		respond(focusedResponse, params);
	} else if (commands.unfocusTaskCommands.includes(command)) {
		let unfocusRequest = await unfocusTask(user);

		if (unfocusRequest.status !== 200) {
			respond(unfocusRequest.body.error, params);
			return;
		}

		// task unfocused
		let unfocusedResponse = getResponse("clearFocused");

		respond(unfocusedResponse, params);
	} else if (commands.checkCommands.includes(command)) {
		if (message === "") {
			let checkRequest = await checkTasks(user);
			if (checkRequest.status !== 200) {
				// no tasks
				respond(checkRequest.body.error, params);
				return;
			}

			return respond(checkRequest.body.reply, params);
		} else {
			let mentioned = message.replace("@", "");
			let checkRequest = await checkTasks(mentioned);

			if (checkRequest.status !== 200) {
				// no tasks
				respond(checkRequest.body.error, params);

				return;
			}
			return respond(checkRequest.body.reply, params);
		}
	} else if (commands.adminDeleteCommands.includes(command)) {
		if (!isMod(flags)) {
			respond(getResponse("notMod"), params);
			return;
		}
		let mentioned = message.replace("@", "");

		if (mentioned === "") {
			respond(getResponse("specifyUser"), params);
			return;
		}

		let clearUserTaskResponse = await clearUserTasks(mentioned);

		params.mentioned = mentioned;

		if (clearUserTaskResponse.status === 0) {
			// no tasks
			respond(getResponse("noTaskA"), params);
			return;
		}

		respond(getResponse("adminDeleteTasks"), params);
		return;
	} else if (commands.adminClearDoneCommands.includes(command)) {
		if (!isStreamer(flags)) {
			respond(getResponse("notStreamer"), params);
			return;
		}

		clearAllDoneTasks();
		respond(getResponse("clearedDone"), params);
		return;
	} else if (commands.adminClearAllCommands.includes(command)) {
		if (!isStreamer(flags)) {
			respond(getResponse("notStreamer"), params);
			return;
		}

		clearAll();
		respond(getResponse("clearedAll"), params);
		return;
	} else if (commands.clearMyDoneCommands.includes(command)) {
		let clearOwnDoneResponse = await clearOwnDoneTasks(user);

		if (clearOwnDoneResponse.status !== 200) {
			// no tasks
			respond(getResponse("noTask"), params);
			return;
		}

		respond(getResponse("clearedMyDone"), params);
	} else if (commands.adminClearNotStreamerCommands.includes(command)) {
		if (!isStreamer(flags)) {
			respond(getResponse("notStreamer"), params);
			return;
		}
		await clearMemory();

		await clearAllExceptStreamer(configs.StreamerUsernames);
		respond(getResponse("clearTasksExceptBroadcaster"), params);
	} else if (commands.adminClearTasksCommands.includes(command)) {
		if (!isStreamer(flags)) {
			respond(getResponse("notStreamer"), params);
			return;
		}
		await clearMemory();

		await clearAllTasks();
		respond(getResponse("clearedTasks"), params);
	} else if (commands.listCommands.includes(command)) {
		let listTaskResponse = await listTasks(user);

		if (listTaskResponse.status !== 200) {
			// no tasks
			respond(listTaskResponse.body.error, params);
			return;
		}

		respond(listTaskResponse.body.reply, params);
	} else if (commands.checkCountCommands.includes(command)) {
		if (message === "") {
			let count = await completedTasksCount(user);

			params.doneCount = count;

			return respond(getResponse("checkYourCount"), params);
		} else {
			let mentioned = message.replace("@", "");
			let count = await completedTasksCount(mentioned);

			params.doneCount = count;
			params.mentioned = mentioned;

			return respond(getResponse("checkUserCount"), params);
		}
	} else if (commands.checkAllCountCommands.includes(command)) {
		let count = getBoardTotalTaskCount();

		if (count === 0) {
			respond(getResponse("noCountAll"), params);
			return;
		}

		params.doneCount = count;

		respond(getResponse("checkAllCount"), params);
	} else if (commands.checkMyPointsCommands.includes(command)) {
		if (message === "") {
			let points = await getUserPoints(user);

			params.pointCount = points;

			return respond(getResponse("checkMyPoints"), params);
		} else {
			let mentioned = message.replace("@", "");
			let points = await getUserPoints(mentioned);

			params.pointCount = points;
			params.mentioned = mentioned;

			return respond(getResponse("checkUserPoints"), params);
		}
	} else if (commands.syncCountPointsCommands.includes(command)) {
		if (!isStreamer(flags)) {
			respond(getResponse("notStreamer"), params);
			return;
		}

		await syncPointsToCount();
		respond(getResponse("syncCountPoints"), params);
	} else if (commands.addPointsCommands.includes(command)) {
		// !addpoints @user 100

		if (!isMod(flags)) {
			respond(getResponse("notMod"), params);
			return;
		}

		let mentioned = message.split(" ")[0].replace("@", "");

		if (mentioned === "") {
			respond(getResponse("specifyUser"), params);
			return;
		}

		let points = message.split(" ")[1];

		if (points === undefined) {
			respond(getResponse("specifyPoints"), params);
			return;
		}

		if (!/^\d+$/.test(points)) {
			respond(getResponse("invalidNumber"), params);
			return;
		}

		points = parseInt(points);

		await addPoints(mentioned, points);

		params.mentioned = mentioned;
		params.pointCount = points;

		respond(getResponse("addPoints"), params);
	} else if (commands.reducePointsCommands.includes(command)) {
		if (!isMod(flags)) {
			respond(getResponse("notMod"), params);
			return;
		}

		let mentioned = message.split(" ")[0].replace("@", "");

		if (mentioned === "") {
			respond(getResponse("specifyUser"), params);
			return;
		}

		let points = message.split(" ")[1];

		if (points == undefined) {
			respond(getResponse("specifyPoints"), params);
			return;
		}

		if (!/^\d+$/.test(points)) {
			respond(getResponse("invalidNumber"), params);
			return;
		}

		await reducePoints(mentioned, points);

		params.mentioned = mentioned;
		params.pointCount = points;

		respond(getResponse("reducePoints"), params);
	} else if (commands.setUserPointsCommands.includes(command)) {
		if (!isMod(flags)) {
			respond(getResponse("notMod"), params);
			return;
		}

		let mentioned = message.split(" ")[0].replace("@", "");

		if (mentioned === "") {
			respond(getResponse("specifyUser"), params);
			return;
		}

		let points = message.split(" ")[1];

		if (points === undefined) {
			respond(getResponse("specifyPoints"), params);
			return;
		}

		if (!/^\d+$/.test(points)) {
			respond(getResponse("invalidNumber"), params);
			return;
		}

		points = parseInt(points);

		await setUserPoints(mentioned, points);

		params.mentioned = mentioned;
		params.pointCount = points;

		respond(getResponse("setUserPoints"), params);
	} else if (commands.setUserTaskCountCommands.includes(commands)) {
		if (!isMod(flags)) {
			respond(getResponse("notMod"), params);
			return;
		}

		let mentioned = message.split(" ")[0].replace("@", "");

		if (mentioned === "") {
			respond(getResponse("specifyUser"), params);
			return;
		}

		let count = message.split(" ")[1];

		if (count === undefined) {
			respond(getResponse("specifyCount"), params);
			return;
		}

		if (!/^\d+$/.test(count)) {
			respond(getResponse("invalidNumber"), params);
			return;
		}

		points = parseInt(points);

		await setUserTaskCount(mentioned, count);

		params.mentioned = mentioned;
		params.pointCount = count;

		respond(getResponse("setUserTaskCount"), params);
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
			respond(getResponse("notStreamer"), params);
			return;
		}

		// check if message is a number using regex
		if (!/^\d+$/.test(message)) {
			respond(getResponse("invalidNumber"), params);
			return;
		}

		params.count = message;

		await setTotalCompleteCount(message);

		respond(getResponse("setBoardCount"), params);
	} else if (commands.adminResetBoardCount.includes(command)) {
		if (!isStreamer(flags)) {
			respond(getResponse("notStreamer"), params);
			return;
		}

		await resetBoardCount();
		respond(getResponse("clearedBoardCount"), params);
	} else if (commands.adminResetUsersCount.includes(command)) {
		if (!isStreamer(flags)) {
			respond(getResponse("notStreamer"), params);
			return;
		}

		await resetUsersCount();
		respond(getResponse("clearedUsersCount"), params);
	} else if (commands.helpCommands.includes(command)) {
		respond(getResponse("help"), params);
	} else if (command === "!clearlocalstorage") {
		if (!isStreamer(flags)) {
			respond(getResponse("notStreamer"), params);
			return;
		}

		clearLocalStorage();

		respond(getResponse("clearLocalStorage"), params);
	} else if (["!transferdata"].includes(command)) {
		if (!isStreamer(flags)) {
			respond(getResponse("notStreamer"), params);
			return;
		}

		await transferLocalStorageToIndexedDB();
	} else if (commands.additionalCommands[command]) {
		respond(commands.additionalCommands[command], params);
	} else {
		// command not found
	}
}

ComfyJS.onCommand = (user, command, message, flags, extra) => {
	command = `!${command.toLowerCase()}`;

	processCommand(user, command, message, flags, extra);
};

ComfyJS.Init(auth.username, `oauth:${auth.oauth}`, [auth.channel]);
