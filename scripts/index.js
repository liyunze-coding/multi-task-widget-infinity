const commands = configs.commands;

let params = {};

const client = new StreamerbotClient({
	port: 6968,
});

client.on("Twitch.ChatMessage", onData);
client.on("YouTube.Message", onData);
client.on("General.Custom", onCustom);

function onCustom(data) {
	console.log(data);
	if (data.data.custom && data.data.custom.toLowerCase() === "backup") {
		console.log("Backup received");
		backupStorage();
	} else if (data.data.backupFileContent) {
		console.log("File received");
		console.log(data.data.backupFileContent);
		loadDataToDB(data.data.backupFileContent);
	}
}

async function respond(template, params = {}) {
	Object.keys(params).forEach((key) => {
		template = template.replace(`{${key}}`, params[key]);
	});

	const source = params["source name"].toLowerCase();

	if (source === "youtube") {
		const streamerYTBotResponse = await client.doAction(
			"390ff8f2-7945-4eba-be2a-a1c0e4ba535d",
			{
				response: template,
			}
		);

		// console.log(streamerYTBotResponse);
	} else {
		const streamerTwitchBotResponse = await client.doAction(
			"8ff809be-e269-4f06-9528-021ef58df436",
			{
				response: template,
			}
		);

		// console.log(streamerTwitchBotResponse);
	}
}

/**
 * Handles incoming data, processes it if it's a YouTube message event.
 *
 * @param {Object} data - The incoming data object.
 * @param {Object} data.event - The event details.
 * @param {string} data.event.source - The source of the event.
 * @param {string} data.event.type - The type of the event.
 * @param {Object} data.data - The payload of the event.
 * @param {string} data.data.message - The message from the event.
 * @param {Object} data.data.user - The user who triggered the event.
 * @param {string} data.data.user.name - The name of the user.
 * @param {boolean} data.data.user.isOwner - Flag indicating if the user is the owner.
 * @param {boolean} data.data.user.isModerator - Flag indicating if the user is a moderator.
 */
function onData(data) {
	if (!data.event) return;

	if (data.event.source === "YouTube" && data.event.type === "Message") {
		const payload = data.data;

		// check if message starts with prefix
		if (!payload.message.startsWith("!")) return;

		const command = payload.message.split(" ")[0];

		// remove first word from message
		const message = payload.message.split(" ").slice(1).join(" ");

		// get user from payload
		const user = payload.user.name;

		// set flags
		const flags = {
			broadcaster: payload.user.isOwner,
			mod: payload.user.isModerator,
		};

		let extra = {
			userColor: "pink",
		};

		processCommand(user, command, message, flags, data.event.source, extra);
	} else if (
		data.event.source === "Twitch" &&
		data.event.type === "ChatMessage"
	) {
		const payload = data.data;

		const command = payload.message.message.split(" ")[0];

		const user = payload.message.displayName;

		const message = payload.message.message.split(" ").slice(1).join(" ");

		// iterate through payload.message.badges
		// each iteration has name in an object
		// if name is "moderator" or "broadcaster", set flags.mod or flags.broadcaster to true
		const badges = payload.message.badges;

		const flags = {
			broadcaster: false,
			mod: false,
		};

		badges.forEach((badge) => {
			if (badge.name === "broadcaster") {
				flags.broadcaster = true;
			} else if (badge.name === "moderator") {
				flags.mod = true;
			}
		});

		let extra = {
			userColor: payload.message.color,
		};

		processCommand(user, command, message, flags, data.event.source, extra);
	}
}

/**
 * Checks if the user is a moderator or broadcaster.
 *
 * @param {Object} flags - The flags object.
 * @param {boolean} flags.broadcaster - Flag indicating if the user is the broadcaster.
 * @param {boolean} flags.mod - Flag indicating if the user is a moderator.
 * @returns {boolean} Returns true if the user is a moderator or broadcaster, false otherwise.
 */
function isMod(flags) {
	return flags.broadcaster || flags.mod;
}

function isStreamer(flags) {
	return flags.broadcaster;
}

async function processCommand(user, command, message, flags, source, extra) {
	params = {
		user: user,
		message: message,
		pointName: configs.settings.pointsName,
		"source name": source,
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
			let points = getUserPoints(user);

			params.pointCount = points;

			return respond(getResponse("checkMyPoints"), params);
		} else {
			let mentioned = message.replace("@", "");
			let points = getUserPoints(mentioned);

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
	} else if (commands.adminBackupCommands.includes(command)) {
		if (!isStreamer(flags)) {
			respond(getResponse("notStreamer"), params);
			return;
		}
		await backupStorage();

		respond(getResponse("backupStorage"), params);
	} else if (commands.adminLoadBackupCommands.includes(command)) {
		if (!isStreamer(flags)) {
			respond(getResponse("notStreamer"), params);
			return;
		}
		await loadBackup(message);

		respond(getResponse("loadBackup"), params);
	} else if (command === "!clearlocalstorage") {
		if (!isStreamer(flags)) {
			respond(getResponse("notStreamer"), params);
			return;
		}

		clearLocalStorage();

		respond(getResponse("clearLocalStorage"), params);
	} else if (commands.additionalCommands[command]) {
		respond(commands.additionalCommands[command], params);
	} else {
		// command not found
	}
}
