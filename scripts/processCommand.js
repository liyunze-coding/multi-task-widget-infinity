var commands = configs.commands;
var openQuote = getSetting("openQuote");
var closeQuote = getSetting("closeQuote");

async function processCommand(user, command, message, flags, source, extra) {
	params = {
		user: user,
		message: message,
		pointName: getSetting("pointsName"),
		taskName: getSetting("taskName"),
		"source name": source,
	};

	if (getCommand("addTaskCommands").includes(command)) {
		let addRequest = await addTask(user, extra.userColor, message);

		if (addRequest.status !== 200) {
			respond(addRequest.body.error, params);
			return;
		}

		let addedResponse = getResponse("taskAdded");
		params.task = `${openQuote}${addRequest.body.task}${closeQuote}`;

		if (addRequest.body.tasksFailedToAdd !== "") {
			addedResponse += ` | Failed to add task(s): ${openQuote}${addRequest.body.tasksFailedToAdd}${closeQuote}`;
		}

		respond(addedResponse, params);
	} else if (getCommand("editTaskCommands").includes(command)) {
		let editRequest = await editTask(user, message);

		if (editRequest.status !== 200) {
			respond(editRequest.body.error, params);
			return;
		}

		let originalTask = editRequest.body.originalTask;
		let newTask = editRequest.body.newTask;

		params.task = `${openQuote}${newTask}${closeQuote}`;
		params.originalTask = `${openQuote}${originalTask}${closeQuote}`;

		respond(getResponse("taskEdited"), params);
	} else if (getCommand("deleteTaskCommands").includes(command)) {
		let removeRequest = await removeTask(user, message);

		if (removeRequest.status !== 200) {
			respond(removeRequest.body.error, params);
			return;
		}
		let deletedResponse = getResponse("taskDeleted");

		let removedTasks = `${openQuote}${removeRequest.body.removedTasks}${closeQuote}`;
		let failedTasks = removeRequest.body.failedTasks;

		params.task = removedTasks;

		if (failedTasks !== "") {
			deletedResponse += ` | Failed to delete {taskName}(s): ${openQuote}${failedTasks}${closeQuote}`;
		}

		respond(deletedResponse, params);
	} else if (getCommand("finishTaskCommands").includes(command)) {
		if (message === "all") {
			let finishAllRequest = await markAllTasksAsDone(user);

			if (finishAllRequest.status !== 200) {
				respond(finishAllRequest.body.error, params);
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

			respond(finishedAllResponse, params);
			return;
		}

		let finishRequest = await markTaskDone(user, message);

		if (finishRequest.status !== 200) {
			respond(finishRequest.body.error, params);
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

		respond(finishedResponse, params);
	} else if (getCommand("unfinishTaskCommands").includes(command)) {
		let unfinishRequest = await markTaskUndone(user, message);

		if (unfinishRequest.status !== 200) {
			respond(unfinishRequest.body.error, params);
			return;
		}

		// task unfinished
		let unfinishedResponse = getResponse("taskUnfinished");

		params.task = `${openQuote}${unfinishRequest.body.markedTasks}${closeQuote}`;

		if (unfinishRequest.body.failedTasks !== "") {
			unfinishedResponse += ` | Failed to unfinish task(s): "${unfinishRequest.body.failedTasks}"`;
		}

		respond(unfinishedResponse, params);
	} else if (getCommand("nextTaskCommands").includes(command)) {
		let nextRequest = await nextTask(user, message);

		if (nextRequest.status !== 200) {
			respond(nextRequest.body.error, params);
			return;
		}

		// task next
		let nextResponse = getResponse("taskNext");

		params.oldTask = `${openQuote}${nextRequest.body.oldTask}${closeQuote}`;
		params.newTask = `${openQuote}${nextRequest.body.newTask}${closeQuote}`;

		await respond(nextResponse, params);
	} else if (getCommand("nowTaskCommands").includes(command)) {
		let nowRequest = await nowTask(user, extra.userColor, message);

		if (nowRequest.status !== 200) {
			respond(nowRequest.body.error, params);
			return;
		}

		// task now
		let nowResponse = getResponse("nowTask");

		params.task = `${openQuote}${nowRequest.body.task}${closeQuote}`;

		respond(nowResponse, params);
	} else if (getCommand("focusTaskCommands").includes(command)) {
		let focusRequest = await focusTask(user, message);

		if (focusRequest.status !== 200) {
			respond(focusRequest.body.error, params);
			return;
		}

		// task focused
		let focusedResponse = getResponse("taskFocused");

		params.task = `${openQuote}${focusRequest.body.focusedTask}${closeQuote}`;

		respond(focusedResponse, params);
	} else if (getCommand("unfocusTaskCommands").includes(command)) {
		let unfocusRequest = await unfocusTask(user);

		if (unfocusRequest.status !== 200) {
			respond(unfocusRequest.body.error, params);
			return;
		}

		// task unfocused
		let unfocusedResponse = getResponse("clearFocused");

		respond(unfocusedResponse, params);
	} else if (getCommand("checkCommands").includes(command)) {
		if (message === "") {
			let checkRequest = await checkTasks(user);
			if (checkRequest.status !== 200) {
				// no tasks
				respond(checkRequest.body.error, params);
				return;
			}

			// array of incomplete tasks
			let incompleteTasks = checkRequest.body.reply.split(" | ");

			// respond every 10 tasks
			for (let i = 0; i < incompleteTasks.length; i += 10) {
				let tasks = incompleteTasks.slice(i, i + 10);
				params.tasks = tasks
					.join(" | ")
					.replaceAll("{taskName}", getSetting("taskName"));

				var checkingUser = user;
				params.checkingUser = checkingUser;

				await respond(`{checkingUser} {tasks}`, params);
				await sleep(200);
			}
		} else {
			let mentioned = message.replace("@", "");

			if (mentioned.toLowerCase() === "id") {
				await respond(getResponse("noTaskA"), params);
				return;
			}

			let checkRequest = await checkTasks(mentioned);

			// array of incomplete tasks
			let incompleteTasks = checkRequest.body.reply.split(" | ");

			if (checkRequest.status !== 200) {
				// no tasks
				respond(getResponse("noTaskA"), params);

				return;
			}

			// respond every 10 tasks
			for (let i = 0; i < incompleteTasks.length; i += 10) {
				let tasks = incompleteTasks.slice(i, i + 10);
				params.tasks = tasks
					.join(" | ")
					.replaceAll("{taskName}", getSetting("taskName"));

				var checkingUser = user;

				params.checkingUser = checkingUser;

				await respond(`{checkingUser} {tasks}`, params);
				await sleep(200);
			}
		}
	} else if (getCommand("adminDeleteCommands").includes(command)) {
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
	} else if (getCommand("adminClearDoneCommands").includes(command)) {
		if (!isStreamer(flags)) {
			respond(getResponse("notStreamer"), params);
			return;
		}

		await clearAllDoneTasks();
		respond(getResponse("clearedDone"), params);
		return;
	} else if (getCommand("adminClearAllCommands").includes(command)) {
		if (!isStreamer(flags)) {
			respond(getResponse("notStreamer"), params);
			return;
		}

		await clearAll();
		respond(getResponse("clearedAll"), params);
		return;
	} else if (getCommand("clearMyDoneCommands").includes(command)) {
		let clearOwnDoneResponse = await clearOwnDoneTasks(user);

		if (clearOwnDoneResponse.status !== 200) {
			// no tasks
			respond(getResponse("noTask"), params);
			return;
		}

		respond(getResponse("clearedMyDone"), params);
	} else if (getCommand("adminClearNotStreamerCommands").includes(command)) {
		if (!isStreamer(flags)) {
			respond(getResponse("notStreamer"), params);
			return;
		}
		clearMemory();

		await clearAllExceptStreamer(configs.StreamerUsernames);
		respond(getResponse("clearTasksExceptBroadcaster"), params);
	} else if (getCommand("adminClearTasksCommands").includes(command)) {
		if (!isStreamer(flags)) {
			respond(getResponse("notStreamer"), params);
			return;
		}
		clearMemory();

		await clearAllTasks();
		respond(getResponse("clearedTasks"), params);
	} else if (getCommand("listCommands").includes(command)) {
		let listTaskResponse = await listTasks(user);

		if (listTaskResponse.status !== 200) {
			// no tasks
			respond(listTaskResponse.body.error, params);
			return;
		}

		respond(listTaskResponse.body.reply, params);
	} else if (getCommand("checkCountCommands").includes(command)) {
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
	} else if (getCommand("checkAllCountCommands").includes(command)) {
		let count = await getBoardTotalTaskCount();

		if (count === 0) {
			respond(getResponse("noCountAll"), params);
			return;
		}

		params.doneCount = count;

		respond(getResponse("checkAllCount"), params);
	} else if (getCommand("checkMyPointsCommands").includes(command)) {
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
	} else if (getCommand("syncCountPointsCommands").includes(command)) {
		if (!isStreamer(flags)) {
			respond(getResponse("notStreamer"), params);
			return;
		}

		await syncPointsToCount();
		respond(getResponse("syncCountPoints"), params);
	} else if (getCommand("addPointsCommands").includes(command)) {
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
	} else if (getCommand("reducePointsCommands").includes(command)) {
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
	} else if (getCommand("setUserPointsCommands").includes(command)) {
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
	} else if (getCommand("setUserTaskCountCommands").includes(command)) {
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

		count = parseInt(count);

		let setUserTaskCountResponse = await setUserTaskCount(mentioned, count);

		if (setUserTaskCountResponse.status !== 200) {
			respond(setUserTaskCountResponse.body.message, params);
			return;
		}

		params.mentioned = mentioned;
		params.taskCount = count;

		respond(setUserTaskCountResponse.body.message, params);
	} else if (getCommand("leaderboardCommands").includes(command)) {
		let leaderboardResponse = await leaderboardTaskCount(5);

		if (leaderboardResponse.status !== 200) {
			respond(leaderboardResponse.body.error, params);
			return;
		}

		let leaderboard = leaderboardResponse.body.leaderboard;

		respond(leaderboard, params);
	} else if (getCommand("adminSetBoardCountCommands").includes(command)) {
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
	} else if (getCommand("adminResetBoardCountCommands").includes(command)) {
		if (!isStreamer(flags)) {
			respond(getResponse("notStreamer"), params);
			return;
		}

		await resetBoardCount();
		respond(getResponse("clearedBoardCount"), params);
	} else if (getCommand("adminResetUsersCountCommands").includes(command)) {
		if (!isStreamer(flags)) {
			respond(getResponse("notStreamer"), params);
			return;
		}

		await resetUsersCount();
		respond(getResponse("clearedUsersCount"), params);
	} else if (getCommand("taskMasterCommands").includes(command)) {
		if (!getSetting("enableTaskMaster")) {
			return;
		}

		let champion = await getTaskMasterChampion();

		if (champion === null) {
			respond(getResponse("noTaskMaster"), params);
			return;
		}

		params.taskMaster = champion.username;
		params.taskMasterCount = champion.count;

		respond(getResponse("taskMaster"), params);
	} else if (getCommand("resetTaskMasterCommands").includes(command)) {
		if (!getSetting("enableTaskMaster")) {
			return;
		}
		if (!isStreamer(flags)) {
			respond(getResponse("notStreamer"), params);
			return;
		}

		await resetTaskMaster();

		respond(getResponse("resetTaskMaster"), params);
	} else if (getCommand("helpCommands").includes(command)) {
		if (source.toLowerCase() === "youtube") {
			respond(getResponse("YTHelp"), params);
		} else {
			respond(getResponse("twitchHelp"), params);
		}
	} else if (["!transferdata"].includes(command)) {
		if (!isStreamer(flags)) {
			respond(getResponse("notStreamer"), params);
			return;
		}

		await transferLocalStorageToIndexedDB();
	} else if (getCommand("adminBackupCommands").includes(command)) {
		if (!isStreamer(flags)) {
			respond(getResponse("notStreamer"), params);
			return;
		}
		await backupStorage();

		respond(getResponse("backupStorage"), params);
	} else if (getCommand("adminLoadBackupCommands").includes(command)) {
		if (!isStreamer(flags)) {
			respond(getResponse("notStreamer"), params);
			return;
		}
		await loadBackup(message);

		// respond(getResponse("loadBackup"), params);
	} else if (command === "!clearlocalstorage") {
		if (!isStreamer(flags)) {
			respond(getResponse("notStreamer"), params);
			return;
		}

		await clearLocalStorage();

		respond(getResponse("clearLocalStorage"), params);
	} else if (commands.additionalCommands[command]) {
		respond(commands.additionalCommands[command], params);
	} else {
		// command not found
	}
}
