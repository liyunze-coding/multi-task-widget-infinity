/**
 * Clears all completed tasks for a given user. If the tasks are successfully cleared, the function returns an object with a status of 200. If the tasks are not cleared due to the user having no tasks, the function returns an object with a status indicating the error and an error message.
 *
 * @param {string} username - The name of the user whose completed tasks are to be cleared.
 * @returns {Object} An object with a status and body. The status is 200 if the tasks are successfully cleared. If the tasks are not cleared, the status indicates the error and the body contains an error message.
 */
async function clearOwnDoneTasks(username) {
	const tasks = await DBHandler.get("tasks");

	if (!tasks[username] || tasks[username].todos.length === 0) {
		return createErrorResponse(
			`@${username} has no tasks`,
			getResponse("noTask")
		);
	}

	let incompleteUserTasks = tasks[username].todos.filter((t) => !t.done);

	// replace user's task with incomplete tasks
	tasks[username].todos = incompleteUserTasks;

	await DBHandler.set("tasks", tasks);
	if (!scrolling) {
		await renderTaskListToDOM();
	}

	return {
		status: 200,
	};
}

/**
 * Clears all tasks for a given user. If the tasks are successfully cleared, the function returns an object with a status of 200.
 * If the tasks are not cleared due to the user having no tasks, the function returns an object with a status indicating the error and an error message.
 *
 * @param {string} username - The name of the user whose tasks are to be cleared.
 * @returns {Object} An object with a status and body. The status is 200 if the tasks are successfully cleared. If the tasks are not cleared, the status indicates the error and the body contains an error message.
 */
async function clearUserTasks(username) {
	const tasks = await DBHandler.get("tasks");
	// find username where lowercase matches username
	username = Object.keys(tasks).find(
		(user) => user.toLowerCase() === username.toLowerCase()
	);

	if (!username) {
		return {
			status: 0,
			body: {
				"error message": `@${username} has no tasks`,
				error: getResponse("noTask"),
			},
		};
	}

	tasks[username].todos = [];

	await DBHandler.set("tasks", tasks);

	if (!scrolling) {
		await renderTaskListToDOM();
	}

	return {
		status: 200,
	};
}

/**
 * Clears all completed tasks for all users. If the tasks are successfully cleared, the function returns an object with a status of 200. If there are no tasks to clear, the function still returns an object with a status of 200 as it's considered a successful operation.
 *
 * @returns {Object} An object with a status. The status is 200 if the tasks are successfully cleared.
 */
async function clearAllDoneTasks() {
	const tasks = await DBHandler.get("tasks");
	for (const user in tasks) {
		if (!tasks[user].todos) continue;
		if (user.toLowerCase() === "id") continue;
		tasks[user].todos = tasks[user].todos.filter((t) => !t.done);
	}
	cancelAnimation();
	await DBHandler.set("tasks", tasks);
	await renderTaskListToDOM();

	return {
		status: 200,
	};
}

async function clearAllTasks() {
	await DBHandler.set("tasks", {});
	await setupDB();
	cancelAnimation();
	await renderTaskListToDOM();

	return {
		status: 200,
	};
}

async function clearAll() {
	await resetDB();
	cancelAnimation();
	checkToAnimate();
	await renderTaskListToDOM();

	return {
		status: 200,
	};
}

/**
 * Clears all tasks from the local storage except for those belonging to specified streamer usernames.
 * After clearing, it also clears all done tasks, cancels any ongoing animation and re-renders the task list to the DOM.
 *
 * @param {string[]} streamerUsername - An array of streamer usernames whose tasks should not be cleared.
 * @returns {Object} An object with a status property indicating the success of the operation (200 for success).
 */
async function clearAllExceptStreamer(streamerUsername) {
	const tasks = await DBHandler.get("tasks");

	for (const user in tasks) {
		if (user.toLowerCase() === "id") continue;
		if (user.toLowerCase() !== streamerUsername.toLowerCase()) {
			tasks[user].todos = [];
		}
	}

	await DBHandler.set("tasks", tasks);

	await clearAllDoneTasks();

	cancelAnimation();

	await renderTaskListToDOM();

	return {
		status: 200,
	};
}
