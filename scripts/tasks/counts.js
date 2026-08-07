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
 * Calculates the total points for a given user based on the number of completed tasks and the points per task setting.
 *
 * @param {string} username - The name of the user whose points are to be calculated.
 * @returns {number} The total points for the user.
 */
async function calculatePoints(username) {
	const counts = await DBHandler.get("counts");

	if (!counts.users[username.toLowerCase()]) {
		return 0;
	}

	return (
		counts.users[username.toLowerCase()].completeCount *
		getSetting("pointsPerTask")
	);
}

/**
 * Retrieves the points of a specific user from local storage.
 *
 * @param {string} username - The name of the user.
 * @returns {number} The points of the user. If the user does not exist, returns 0.
 */
async function getUserPoints(username) {
	const counts = await DBHandler.get("counts");

	if (!counts.users[username.toLowerCase()]) {
		return 0;
	}

	return counts.users[username.toLowerCase()].points;
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

	// check if user has points
	if (!counts.users[username.toLowerCase()].points) {
		counts.users[username.toLowerCase()].points = 0;
	}

	// add to points
	counts.users[username.toLowerCase()].points +=
		value * getSetting("pointsPerTask");

	// add to taskmaster
	addCountToTaskMasterUser(username, value);

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
 * Adds a specified number of points to a user's total in local storage.
 *
 * @param {string} username - The name of the user.
 * @param {number} value - The number of points to add.
 * @returns {Object} An object with a status and body. The status is 200 if successful, and the body contains a success message.
 */
async function addPoints(username, value) {
	const counts = await DBHandler.get("counts");

	if (!counts.users[username.toLowerCase()]) {
		counts.users[username.toLowerCase()] = {
			points: 0,
		};
	}

	if (!counts.users[username.toLowerCase()].points) {
		counts.users[username.toLowerCase()].points = 0;
	}

	counts.users[username.toLowerCase()].points += value;

	await DBHandler.set("counts", counts);

	return {
		status: 200,
		body: {
			message: `Successfully added ${value} points to ${username}`,
		},
	};
}

/**
 * Sets the points for a specific user in local storage.
 *
 * @param {string} username - The name of the user.
 * @param {number} pointsCount - The new points count for the user.
 * @returns {Object} An object with a status and body. The status is 200 if successful, and the body contains a success message.
 */
async function setUserPoints(username, pointsCount) {
	const counts = await DBHandler.get("counts");

	if (!counts.users[username.toLowerCase()]) {
		counts.users[username.toLowerCase()] = {
			points: 0,
		};
	}

	counts.users[username.toLowerCase()].points = pointsCount;

	await DBHandler.set("counts", counts);

	return {
		status: 200,
		body: {
			message: `Successfully set ${username}'s points to ${pointsCount}`,
		},
	};
}

/**
 * Reduces a specified number of points from a user's total in local storage.
 *
 * @param {string} username - The name of the user.
 * @param {number} value - The number of points to reduce.
 * @returns {Object} An object with a status and body. The status is 200 if successful, and the body contains a success message.
 */
async function reducePoints(username, value) {
	const counts = await DBHandler.get("counts");

	if (!counts.users[username.toLowerCase()]) {
		counts.users[username.toLowerCase()] = {
			points: 0,
		};
	}

	if (!counts.users[username.toLowerCase()].points) {
		counts.users[username.toLowerCase()].points = 0;
	}

	counts.users[username.toLowerCase()].points -= parseInt(value);

	await DBHandler.set("counts", counts);

	return {
		status: 200,
		body: {
			message: `Successfully reduced ${username}'s points by ${value}`,
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
 * Synchronizes the points of each user with their task count in local storage. After the synchronization, the function returns an object with a status of 200 and a success message.
 *
 * @returns {Object} An object with a status and body. The status is 200 if the synchronization is successful, and the body contains a success message.
 */
async function syncPointsToCount() {
	const counts = await DBHandler.get("counts");

	for (const user in counts.users) {
		counts.users[user].points = calculatePoints(user);
	}

	await DBHandler.set("counts", counts);

	return {
		status: 200,
		body: {
			message: "Successfully synced counts to points",
		},
	};
}

/**
 * Gets the leaderboard of users based on task count.
 *
 * @param {number} limit - The maximum number of users to include in the leaderboard.
 * @returns {Object} An object with a status and body. The status is 200 if successful, and the body contains an array of user objects, each with a username and task count, sorted in descending order of task count.
 */
async function leaderboardTaskCount(limit) {
	const counts = await DBHandler.get("counts");

	let leaderboardArray = [];

	for (const user in counts.users) {
		let userTaskCount = await completedTasksCount(user);

		leaderboardArray.push({
			username: user,
			taskCount: userTaskCount,
		});
	}

	leaderboardArray.sort((a, b) => b.taskCount - a.taskCount);

	// shorten to limit
	leaderboardArray = leaderboardArray.slice(0, limit);

	let leaderboardstring = "";

	leaderboardArray.map((user, index) => {
		leaderboardstring += `${index + 1}. @${user.username} : ${
			user.taskCount
		} | `;
	});

	leaderboardstring = leaderboardstring.slice(0, -3);

	return {
		status: 200,
		body: {
			leaderboard: leaderboardstring,
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
