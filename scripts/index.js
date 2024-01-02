const commands = configs.commands;

let params = {};

const client = new StreamerbotClient({
	host: "127.0.0.1",
	port: 6968,
	subscribe: {
		YouTube: ["Message"],
		Twitch: ["ChatMessage"],
	},
	onData: onData,
});

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

		console.log(streamerYTBotResponse);
	} else {
		const streamerTwitchBotResponse = await client.doAction(
			"8ff809be-e269-4f06-9528-021ef58df436",
			{
				response: template,
			}
		);

		console.log(streamerTwitchBotResponse);
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

		procressCommand(
			user,
			command,
			message,
			flags,
			data.event.source,
			extra
		);
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

		procressCommand(
			user,
			command,
			message,
			flags,
			data.event.source,
			extra
		);
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

function procressCommand(user, command, message, flags, source, extra) {
	params = {
		user: user,
		message: message,
		pointName: configs.settings.pointsName,
		"source name": source,
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

			return respond(checkRequest.body.reply, params);
		} else {
			let mentioned = message.replace("@", "");
			let checkRequest = checkTasks(mentioned);

			if (checkRequest.status !== 200) {
				// no tasks
				respond(checkRequest.body.error, params);

				return;
			}
			return respond(checkRequest.body.reply, params);
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

		clearAllExceptStreamer(configs.StreamerUsernames);
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
}
