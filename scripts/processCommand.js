var commands = configs.commands;
var openQuote = getSetting("openQuote");
var closeQuote = getSetting("closeQuote");

async function processCommand(user, command, message, flags, extra) {
	params = {
		user: user,
		message: message,
		pointName: getSetting("pointsName"),
		taskName: getSetting("taskName"),
	};

	command = command.toLowerCase();

	if (getCommand("addTaskCommands").includes(command)) {
		let addRequest = await addTask(user, extra.userColor, message);

		if (addRequest.status !== 200) {
			params.task = `${openQuote}${message}${closeQuote}`;
			respond(addRequest.body.error, params, extra.id);
			return;
		}

		let addedResponse = getResponse("taskAdded");
		params.task = `${openQuote}${addRequest.body.task}${closeQuote}`;

		if (addRequest.body.tasksFailedToAdd !== "") {
			addedResponse += ` | Failed to add task(s): "${addRequest.body.tasksFailedToAdd}"`;
		}

		await respond(addedResponse, params, extra.id);
	} else if (getCommand("editTaskCommands").includes(command)) {
		let editRequest = await editTask(user, message);

		if (editRequest.status !== 200) {
			respond(editRequest.body.error, params, extra.id);
			return;
		}

		let originalTask = editRequest.body.originalTask;
		let newTask = editRequest.body.newTask;

		params.task = `${openQuote}${newTask}${closeQuote}`;
		params.originalTask = `${openQuote}${originalTask}${closeQuote}`;

		respond(getResponse("taskEdited"), params, extra.id);
	} else if (getCommand("deleteTaskCommands").includes(command)) {
		let removeRequest = await removeTask(user, message);

		if (removeRequest.status !== 200) {
			respond(removeRequest.body.error, params, extra.id);
			return;
		}
		let deletedResponse = getResponse("taskDeleted");

		let removedTasks = `${openQuote}${removeRequest.body.removedTasks}${closeQuote}`;
		let failedTasks = removeRequest.body.failedTasks;

		params.task = removedTasks;

		if (failedTasks !== "") {
			deletedResponse += ` | Failed to delete task(s): ${openQuote}${failedTasks}${closeQuote}`;
		}

		respond(deletedResponse, params, extra.id);
	} else if (getCommand("finishTaskCommands").includes(command)) {
		if (message === "all") {
			let finishAllRequest = await markAllTasksAsDone(user);

			if (finishAllRequest.status !== 200) {
				respond(finishAllRequest.body.error, params, extra.id);
				return;
			}

			let finishedAllResponse = getResponse("allTasksFinished");
			params.doneCount = await completedTasksCount(user);
			finishedAllResponse = finishedAllResponse.replaceAll(
				"{pointName}",
				getSetting("pointsName")
			);

			finishedAllResponse = finishedAllResponse.replaceAll(
				"{taskName}",
				getSetting("taskName")
			);

			respond(finishedAllResponse, params, extra.id);
			return;
		}

		let finishRequest = await markTaskDone(user, message);

		if (finishRequest.status !== 200) {
			respond(finishRequest.body.error, params, extra.id);
			return;
		}

		let finishedResponse = getResponse("taskFinished");
		params.task = `${openQuote}${finishRequest.body.markedTasks}${closeQuote}`;
		params.doneCount = await completedTasksCount(user);
		params.pointCount =
			finishRequest.body.markedTasksCount * getSetting("pointsPerTask");

		if (finishRequest.body.failedTasks !== "") {
			finishedResponse += ` | Failed to finish {taskName}(s): "${finishRequest.body.failedTasks}"`;
		}

		finishedResponse = finishedResponse.replaceAll(
			"{pointName}",
			getSetting("pointsName")
		);

		finishedResponse = finishedResponse.replaceAll(
			"{taskName}",
			getSetting("taskName")
		);

		respond(finishedResponse, params, extra.id);
	} else if (getCommand("unfinishTaskCommands").includes(command)) {
		let unfinishRequest = await markTaskUndone(user, message);

		if (unfinishRequest.status !== 200) {
			respond(unfinishRequest.body.error, params, extra.id);
			return;
		}

		// task unfinished
		let unfinishedResponse = getResponse("taskUnfinished");

		params.task = `${openQuote}${unfinishRequest.body.markedTasks}${closeQuote}`;

		if (unfinishRequest.body.failedTasks !== "") {
			unfinishedResponse += ` | Failed to unfinish task(s): "${unfinishRequest.body.failedTasks}"`;
		}

		respond(unfinishedResponse, params, extra.id);
	} else if (getCommand("nextTaskCommands").includes(command)) {
		let nextRequest = await nextTask(user, message);

		if (nextRequest.status !== 200) {
			params.task = `${openQuote}${nextRequest.body.task}${closeQuote}`;
			await respond(nextRequest.body.error, params, extra.id);
			return;
		}

		// task next
		let nextResponse = getResponse("taskNext");

		params.oldTask = `${openQuote}${nextRequest.body.oldTask}${closeQuote}`;
		params.newTask = `${openQuote}${nextRequest.body.newTask}${closeQuote}`;

		respond(nextResponse, params, extra.id);
	} else if (getCommand("logTaskCommands").includes(command)) {
		let logRequest = await logTask(user, extra.userColor, message);

		if (logRequest.status !== 200) {
			respond(logRequest.body.error, params, extra.id);
			return;
		}

		// task logged
		let loggedResponse = await getResponse("taskLogged");

		params.task = `${openQuote}${logRequest.body.task}${closeQuote}`;

		if (logRequest.body.tasksFailedToLog !== "") {
			loggedResponse += ` | Failed to log task(s): ${openQuote}${logRequest.body.tasksFailedToLog}${closeQuote}`;
		}

		await respond(loggedResponse, params, extra.id);
	} else if (
		getCommand("focusTaskCommands").includes(command) ||
		getCommand("nowTaskCommands").includes(command)
	) {
		let focusRequest = await focusTask(user, extra.userColor, message);

		if (focusRequest.status !== 200) {
			respond(focusRequest.body.error, params, extra.id);
			return;
		}

		// task focused
		let focusedResponse = getResponse("nowTask");

		params.task = `${openQuote}${focusRequest.body.focusedTask}${closeQuote}`;

		respond(focusedResponse, params, extra.id);
	} else if (getCommand("focusedTaskCommands").includes(command)) {
		let focusedRequest = await focusedTask(user);

		if (focusedRequest.status !== 200) {
			respond(focusedRequest.body.error, params, extra.id);
			return;
		}

		// task focused
		let focusedResponse = getResponse("focusedTask");

		params.task = `${openQuote}${focusedRequest.body.focusedTask}${closeQuote}`;

		await respond(focusedResponse, params, extra.id);
	} else if (getCommand("unfocusTaskCommands").includes(command)) {
		let unfocusRequest = await unfocusTask(user);

		if (unfocusRequest.status !== 200) {
			respond(unfocusRequest.body.error, params, extra.id);
			return;
		}

		// task unfocused
		let unfocusedResponse = getResponse("clearFocused");

		respond(unfocusedResponse, params, extra.id);
	} else if (
		getCommand("checkCommands").includes(command) ||
		getCommand("checkCompletedCommands").includes(command)
	) {
		let completed = getCommand("checkCompletedCommands").includes(command);

		if (message === "") {
			let checkRequest = await checkTasks(user, completed);
			if (checkRequest.status !== 200) {
				// no tasks
				respond(checkRequest.body.error, params, extra.id);
				return;
			}

			// array of filtered tasks
			let filteredTasks = checkRequest.body.reply.split(" | ");

			// respond every 10 tasks
			for (let i = 0; i < filteredTasks.length; i += 10) {
				let tasks = filteredTasks.slice(i, i + 10);
				params.tasks = tasks
					.join(" | ")
					.replaceAll("{taskName}", getSetting("taskName"));

				var checkingUser = user;
				params.checkingUser = checkingUser;

				await respond(`{tasks}`, params, extra.id);
				await sleep(200);
			}
		} else {
			let mentioned = message.replace("@", "");

			if (mentioned.toLowerCase() === "id") {
				await respond(getResponse("noTaskA"), params, extra.id);
				return;
			}

			let checkRequest = await checkTasks(mentioned, completed);

			// array of incomplete tasks
			let filteredTasks = checkRequest.body.reply.split(" | ");

			if (checkRequest.status !== 200) {
				// no tasks
				respond(getResponse("noTaskA"), params, extra.id);

				return;
			}

			// respond every 10 tasks
			for (let i = 0; i < filteredTasks.length; i += 10) {
				let tasks = filteredTasks.slice(i, i + 10);
				params.tasks = tasks
					.join(" | ")
					.replaceAll("{taskName}", getSetting("taskName"));

				var checkingUser = user;

				params.checkingUser = checkingUser;

				await respond(`{checkingUser} {tasks}`, params, extra.id);
				await sleep(200);
			}
		}
	} else if (getCommand("adminDeleteCommands").includes(command)) {
		if (!isMod(flags)) {
			respond(getResponse("notMod"), params, extra.id);
			return;
		}
		let mentioned = message.replace("@", "");

		if (mentioned === "") {
			respond(getResponse("specifyUser"), params, extra.id);
			return;
		}

		let clearUserTaskResponse = await clearUserTasks(mentioned);

		params.mentioned = mentioned;

		if (clearUserTaskResponse.status === 0) {
			// no tasks
			respond(getResponse("noTaskA"), params, extra.id);
			return;
		}

		respond(getResponse("adminDeleteTasks"), params, extra.id);
		return;
	} else if (getCommand("adminClearDoneCommands").includes(command)) {
		if (!isStreamer(flags)) {
			respond(getResponse("notStreamer"), params, extra.id);
			return;
		}

		await clearAllDoneTasks();
		respond(getResponse("clearedDone"), params, extra.id);
		return;
	} else if (getCommand("adminClearAllCommands").includes(command)) {
		if (!isStreamer(flags)) {
			respond(getResponse("notStreamer"), params, extra.id);
			return;
		}

		await clearAll();
		respond(getResponse("clearedAll"), params, extra.id);
		return;
	} else if (getCommand("clearMyDoneCommands").includes(command)) {
		let clearOwnDoneResponse = await clearOwnDoneTasks(user);

		if (clearOwnDoneResponse.status !== 200) {
			// no tasks
			respond(getResponse("noTask"), params, extra.id);
			return;
		}

		respond(getResponse("clearedMyDone"), params, extra.id);
	} else if (getCommand("adminClearNotStreamerCommands").includes(command)) {
		if (!isStreamer(flags)) {
			respond(getResponse("notStreamer"), params, extra.id);
			return;
		}
		await clearMemory();

		await clearAllExceptStreamer(auth.channel);
		respond(getResponse("clearTasksExceptBroadcaster"), params, extra.id);
	} else if (getCommand("adminClearTasksCommands").includes(command)) {
		if (!isStreamer(flags)) {
			respond(getResponse("notStreamer"), params, extra.id);
			return;
		}
		await clearMemory();

		await clearAllTasks();
		respond(getResponse("clearedTasks"), params, extra.id);
	} else if (getCommand("listCommands").includes(command)) {
		const interval = 100;
		if (message === "") {
			let listTaskResponse = await listTasks(user);

			if (listTaskResponse.status !== 200) {
				// no tasks
				respond(listTaskResponse.body.error, params, extra.id);
				return;
			}

			for (reply of listTaskResponse.body.replies) {
				params.tasks = reply;
				await respond("{tasks}", params, extra.id);
				await sleep(interval);
			}
		} else {
			let separator = ",";
			let args = message.split(" ");
			let anotherUser = true;

			// separate separator from mentioned user
			if (args[0].length === 1) {
				// args[0] is separator
				separator = args[0];
				args.shift();
			} else if (args[1] && args[1].length === 1) {
				// args[1] is separator
				separator = args[1];
				args.splice(1, 1);
			} else {
				// default, no separator specified
			}

			let mentioned = args.join(" ").replace("@", "");

			if (args.length === 0) {
				// no user specified
				mentioned = user;
				anotherUser = false;
				// noTaskA
			}

			if (mentioned.toLowerCase() === "id") {
				await respond(getResponse("noTaskA"), params, extra.id);
				return;
			}

			let listTaskResponse = await listTasks(mentioned, separator);

			if (listTaskResponse.status !== 200 && anotherUser) {
				// no tasks
				respond(getResponse("noTaskA"), params, extra.id);
				return;
			} else if (listTaskResponse.status !== 200 && !anotherUser) {
				respond(getResponse("noTask"), params, extra.id);
				return;
			}

			for (reply of listTaskResponse.body.replies) {
				params.tasks = reply;
				await respond("{tasks}", params, extra.id);
				await sleep(interval);
			}
		}
	} else if (getCommand("checkCountCommands").includes(command)) {
		if (message === "") {
			let count = await completedTasksCount(user);

			params.doneCount = count;

			return respond(getResponse("checkYourCount"), params, extra.id);
		} else {
			let mentioned = message.replace("@", "");
			let count = await completedTasksCount(mentioned);

			params.doneCount = count;
			params.mentioned = mentioned;

			return respond(getResponse("checkUserCount"), params, extra.id);
		}
	} else if (getCommand("checkAllCountCommands").includes(command)) {
		let count = await getBoardTotalTaskCount();

		if (count === 0) {
			respond(getResponse("noCountAll"), params, extra.id);
			return;
		}

		params.doneCount = count;

		respond(getResponse("checkAllCount"), params, extra.id);
	} else if (getCommand("checkMyPointsCommands").includes(command)) {
		if (message === "") {
			let points = await getUserPoints(user);

			params.pointCount = points;

			return respond(getResponse("checkMyPoints"), params, extra.id);
		} else {
			let mentioned = message.replace("@", "");
			let points = await getUserPoints(mentioned);

			params.pointCount = points;
			params.mentioned = mentioned;

			return respond(getResponse("checkUserPoints"), params, extra.id);
		}
	} else if (getCommand("syncCountPointsCommands").includes(command)) {
		if (!isStreamer(flags)) {
			respond(getResponse("notStreamer"), params, extra.id);
			return;
		}

		await syncPointsToCount();
		respond(getResponse("syncCountPoints"), params, extra.id);
	} else if (getCommand("addPointsCommands").includes(command)) {
		if (!isMod(flags)) {
			respond(getResponse("notMod"), params, extra.id);
			return;
		}

		let mentioned = message.split(" ")[0].replace("@", "");

		if (mentioned === "") {
			respond(getResponse("specifyUser"), params, extra.id);
			return;
		}

		let points = message.split(" ")[1];

		if (points === undefined) {
			respond(getResponse("specifyPoints"), params, extra.id);
			return;
		}

		if (!/^\d+$/.test(points)) {
			respond(getResponse("invalidNumber"), params, extra.id);
			return;
		}

		points = parseInt(points);

		await addPoints(mentioned, points);

		params.mentioned = mentioned;
		params.pointCount = points;

		respond(getResponse("addPoints"), params, extra.id);
	} else if (getCommand("reducePointsCommands").includes(command)) {
		if (!isMod(flags)) {
			respond(getResponse("notMod"), params, extra.id);
			return;
		}

		let mentioned = message.split(" ")[0].replace("@", "");

		if (mentioned === "") {
			respond(getResponse("specifyUser"), params, extra.id);
			return;
		}

		let points = message.split(" ")[1];

		if (points == undefined) {
			respond(getResponse("specifyPoints"), params, extra.id);
			return;
		}

		if (!/^\d+$/.test(points)) {
			respond(getResponse("invalidNumber"), params, extra.id);
			return;
		}

		await reducePoints(mentioned, points);

		params.mentioned = mentioned;
		params.pointCount = points;

		respond(getResponse("reducePoints"), params, extra.id);
	} else if (getCommand("setUserPointsCommands").includes(command)) {
		if (!isMod(flags)) {
			respond(getResponse("notMod"), params, extra.id);
			return;
		}

		let mentioned = message.split(" ")[0].replace("@", "");

		if (mentioned === "") {
			respond(getResponse("specifyUser"), params, extra.id);
			return;
		}

		let points = message.split(" ")[1];

		if (points === undefined) {
			respond(getResponse("specifyPoints"), params, extra.id);
			return;
		}

		if (!/^\d+$/.test(points)) {
			respond(getResponse("invalidNumber"), params, extra.id);
			return;
		}

		points = parseInt(points);

		await setUserPoints(mentioned, points);

		params.mentioned = mentioned;
		params.pointCount = points;

		respond(getResponse("setUserPoints"), params, extra.id);
	} else if (getCommand("setUserTaskCountCommands").includes(command)) {
		if (!isMod(flags)) {
			respond(getResponse("notMod"), params, extra.id);
			return;
		}

		let mentioned = message.split(" ")[0].replace("@", "");

		if (mentioned === "") {
			respond(getResponse("specifyUser"), params, extra.id);
			return;
		}

		let count = message.split(" ")[1];

		if (count === undefined) {
			respond(getResponse("specifyCount"), params, extra.id);
			return;
		}

		if (!/^\d+$/.test(count)) {
			respond(getResponse("invalidNumber"), params, extra.id);
			return;
		}

		let setUserTaskCountResponse = await setUserTaskCount(mentioned, count);

		if (setUserTaskCountResponse.status !== 200) {
			respond(setUserTaskCountResponse.body.message, params, extra.id);
			return;
		}

		params.mentioned = mentioned;
		params.taskCount = count;

		respond(setUserTaskCountResponse.body.message, params, extra.id);
	} else if (getCommand("leaderboardCommands").includes(command)) {
		let leaderboardResponse = await leaderboardTaskCount(5);

		if (leaderboardResponse.status !== 200) {
			respond(leaderboardResponse.body.error, params, extra.id);
			return;
		}

		let leaderboard = leaderboardResponse.body.leaderboard;

		await respond(leaderboard, params, extra.id);
	} else if (getCommand("adminSetBoardCountCommands").includes(command)) {
		if (!isStreamer(flags)) {
			respond(getResponse("notStreamer"), params, extra.id);
			return;
		}

		// check if message is a number using regex
		if (!/^\d+$/.test(message)) {
			respond(getResponse("invalidNumber"), params, extra.id);
			return;
		}

		params.count = message;

		await setTotalCompleteCount(message);

		respond(getResponse("setBoardCount"), params, extra.id);
	} else if (getCommand("adminResetBoardCountCommands").includes(command)) {
		if (!isStreamer(flags)) {
			respond(getResponse("notStreamer"), params, extra.id);
			return;
		}

		await resetBoardCount();
		respond(getResponse("clearedBoardCount"), params, extra.id);
	} else if (getCommand("adminResetUsersCountCommands").includes(command)) {
		if (!isStreamer(flags)) {
			respond(getResponse("notStreamer"), params, extra.id);
			return;
		}

		await resetUsersCount();
		respond(getResponse("clearedUsersCount"), params, extra.id);
	} else if (getCommand("taskMasterCommands").includes(command)) {
		if (!getSetting("enableTaskMaster")) {
			return;
		}

		let champion = await getTaskMasterChampion();

		if (champion === null) {
			respond(getResponse("noTaskMaster"), params, extra.id);
			return;
		}

		params.taskMaster = champion.username;
		params.taskMasterCount = champion.count;

		respond(getResponse("taskMaster"), params, extra.id);
	} else if (getCommand("resetTaskMasterCommands").includes(command)) {
		if (!getSetting("enableTaskMaster")) {
			return;
		}
		if (!isStreamer(flags)) {
			respond(getResponse("notStreamer"), params, extra.id);
			return;
		}

		await resetTaskMaster();

		respond(getResponse("resetTaskMaster"), params, extra.id);
	} else if (getCommand("helpCommands").includes(command)) {
		respond(getResponse("help"), params, extra.id);
	} else if (command === "!clearlocalstorage") {
		if (!isStreamer(flags)) {
			respond(getResponse("notStreamer"), params, extra.id);
			return;
		}

		clearLocalStorage();

		respond(getResponse("clearLocalStorage"), params, extra.id);
	} else if (["!transferdata"].includes(command)) {
		if (!isStreamer(flags)) {
			respond(getResponse("notStreamer"), params, extra.id);
			return;
		}

		await transferLocalStorageToIndexedDB();
	} else if (commands.additionalCommands[command]) {
		respond(commands.additionalCommands[command], params, extra.id);
	} else {
		// command not found
	}
}
