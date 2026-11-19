/**
 * Counts the number of incomplete tasks for a given user.
 *
 * @param {string} username - The name of the user whose tasks are to be counted.
 * @returns {number} The number of incomplete tasks for the user.
 */
async function incompleteTasksCount(username) {
	const tasks = await DBHandler.get("tasks");
	if (!tasks[username]) {
		return 0;
	}
	return tasks[username].todos.filter((t) => !t.done).length;
}

/**
 * Counts the number of completed tasks for a given user.
 *
 * @param {string} username - The name of the user whose tasks are to be counted.
 * @returns {number} The number of completed tasks for the user.
 */
async function completedTasksCount(username) {
	const counts = await DBHandler.get("counts");
	if (!counts.users[username.toLowerCase()]) {
		return 0;
	}
	return counts.users[username.toLowerCase()].completeCount;
}

/**
 * Gets the total number of tasks for a given user.
 *
 * @param {string} username - The name of the user whose tasks are to be counted.
 * @returns {number} The total number of tasks for the user.
 */
async function getUserTotalTaskCount(username) {
	return (
		(await incompleteTasksCount(username)) +
		(await completedTasksCount(username))
	);
}

/**
 * Adds a specified value to the completed task count for a given user and the total completed task count.
 *
 * @param {string} username - The name of the user whose completed task count is to be incremented.
 * @param {number} value - The value to be added to the completed task count.
 */
async function addDoneCount(username, value) {
	const counts = await DBHandler.get("counts");

	if (!counts.users[username.toLowerCase()]) {
		counts.users[username.toLowerCase()] = {
			completeCount: 0,
		};
	}

	if (!counts.totalCompleteCount) {
		counts.totalCompleteCount = 0;
	}

	counts.users[username.toLowerCase()].completeCount += value;
	counts.totalCompleteCount += value;
	taskListMemory.doneTaskCount += value;

	await DBHandler.set("counts", counts);
}

/**
 * Sets the completed task count for a given user.
 *
 * @param {string} username
 * @param {int} value
 * @returns {Object} An object with a status and body. The status is 200 if successful, and the body contains a success message.
 */
async function setUserCompleteCount(username, value) {
	const counts = await DBHandler.get("counts");

	if (!counts.users[username.toLowerCase()]) {
		counts.users[username.toLowerCase()] = {
			completeCount: 0,
		};
	}

	counts.users[username.toLowerCase()].completeCount = parseInt(value);

	await DBHandler.set("counts", counts);

	return {
		status: 200,
		body: {
			message: `Successfully set ${username}'s complete count to ${value}`,
		},
	};
}

/**
 * Sets the total count of completed tasks in local storage.
 *
 * @param {number} value - The new total count of completed tasks.
 * @returns {Object} An object with a status and body. The status is 200 if successful, and the body contains a success message.
 */
async function setTotalCompleteCount(value) {
	const counts = await DBHandler.get("counts");

	counts.totalCompleteCount = parseInt(value);

	await DBHandler.set("counts", counts);

	return {
		status: 200,
		body: {
			message: `Successfully set total complete count to ${value}`,
		},
	};
}

/**
 * Retrieves the total count of tasks from the board.
 *
 * @returns {number} The total count of tasks. If no tasks are found, returns 0.
 */
async function getBoardTotalTaskCount() {
	const counts = await DBHandler.get("counts");

	if (!counts.totalCompleteCount) {
		return 0;
	}

	return counts.totalCompleteCount;
}

/**
 * Sets the task count for a specific user in local storage and returns a success message.
 *
 * @param {string} username - The name of the user.
 * @param {number} value - The new task count for the user.
 * @returns {Object} An object with a status and body. The status is 200 if successful, and the body contains a success message.
 */
async function setUserTaskCount(username, value) {
	const counts = await DBHandler.get("counts");

	if (!counts.users[username.toLowerCase()]) {
		counts.users[username.toLowerCase()] = {
			completeCount: 0,
		};
	}

	if (!counts.users[username.toLowerCase()].completeCount) {
		counts.users[username.toLowerCase()].completeCount = 0;
	}

	counts.users[username.toLowerCase()].completeCount = parseInt(value);

	await DBHandler.set("counts", counts);

	return {
		status: 200,
		body: {
			message: `Successfully set ${username}'s task count to ${value}`,
		},
	};
}

/**
 * Resets the total count of completed tasks in the board to zero.
 */
async function resetBoardCount() {
	const counts = await DBHandler.get("counts");

	counts.totalCompleteCount = 0;

	await DBHandler.set("counts", counts);

	return {
		status: 200,
		body: {
			message: "Successfully reset board count",
		},
	};
}

/**
 * Resets the task count for all users.
 */
async function resetUsersCount() {
	const counts = await DBHandler.get("counts");

	counts.users = {};

	await DBHandler.set("counts", counts);

	return {
		status: 200,
		body: {
			message: "Successfully reset users count",
		},
	};
}
