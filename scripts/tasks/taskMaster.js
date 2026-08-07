/**
 * adds a count to user for 'taskmaster'
 *
 * @param {string} username
 */
async function addCountToTaskMasterUser(username, count) {
	const taskmaster = await DBHandler.get("taskmaster");

	if (!taskmaster.users[username.toLowerCase()]) {
		taskmaster.users[username.toLowerCase()] = {
			taskMasterCompleteCount: 0,
		};
	}

	taskmaster.users[username.toLowerCase()].taskMasterCompleteCount +=
		parseInt(count);

	await DBHandler.set("taskmaster", taskmaster);
}

/**
 * gets the count of a user from 'taskmaster'
 *
 * @param {string} username
 * @returns {number} the count of the user
 */
async function getUserTaskMasterCount(username) {
	const taskmaster = await DBHandler.get("taskmaster");

	if (!taskmaster.users[username.toLowerCase()]) {
		return 0;
	}

	return taskmaster.users[username.toLowerCase()].taskMasterCompleteCount;
}

async function getTaskMasterChampion() {
	const taskmaster = await DBHandler.get("taskmaster");

	if (!taskmaster.users) {
		return null;
	}

	let champion = {
		username: "",
		count: 0,
	};

	for (const user in taskmaster.users) {
		if (
			user.toLowerCase() !== auth.channel.toLowerCase() &&
			taskmaster.users[user].taskMasterCompleteCount > champion.count
		) {
			champion.username = user;
			champion.count = taskmaster.users[user].taskMasterCompleteCount;
		}
	}

	if (champion.count === 0) {
		return null;
	}

	return champion;
}

async function resetTaskMaster() {
	await DBHandler.set("taskmaster", {
		users: {},
		startDate: new Date(),
		totalCompleteCount: 0,
	});
}
