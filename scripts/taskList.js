/*
DB structure:

- tasks
    - [username]:
		- todos (array)
            - [{text, done, focus}, {text, done, focus}]
		- userColor
- counts
	- users
		- [username]:
			- completeCount
			- points
	- totalCompleteCount

- taskmaster
	- users
		- [username]:
			- taskMasterCompleteCount
	- startDate
*/

const styles = configs.styles;
const scrollSpeed = configs.animation.scrollSpeed;
var openQuote = getSetting("openQuote");
var closeQuote = getSetting("closeQuote");
let visible = false;
let scrolling = false;
let primaryAnimation, secondaryAnimation;
const taskSeparator = getSetting("taskSeparator");

var taskListMemory = {
	doneTaskCount: 0,
	totalTaskCount: 0,
};

const DBHandler = {
	db: null,
	open: function () {
		return new Promise((resolve, reject) => {
			let request = indexedDB.open("tasksDB", 1);

			request.onupgradeneeded = function (e) {
				let db = e.target.result;
				if (!db.objectStoreNames.contains("tasks")) {
					db.createObjectStore("tasks", { autoIncrement: true });
				}
			};

			request.onsuccess = function (e) {
				DBHandler.db = e.target.result;
				resolve();
			};

			request.onerror = function (e) {
				console.log("Error opening db", e);
				reject(e);
			};
		});
	},
	get: function (key) {
		return new Promise((resolve, reject) => {
			let transaction = DBHandler.db.transaction(["tasks"], "readonly");
			let store = transaction.objectStore("tasks");
			let request = store.get(key);

			request.onsuccess = function (e) {
				resolve(e.target.result);
			};

			request.onerror = function (e) {
				reject("Error getting item", e);
			};
		});
	},
	set: function (key, value) {
		return new Promise((resolve, reject) => {
			let transaction = DBHandler.db.transaction(["tasks"], "readwrite");
			let store = transaction.objectStore("tasks");
			let request = store.put(value, key);

			request.onsuccess = function (e) {
				resolve(e.target.result);
			};

			request.onerror = function (e) {
				reject("Error setting item", e);
			};
		});
	},
	remove: function (key) {
		return new Promise((resolve, reject) => {
			let transaction = DBHandler.db.transaction(["tasks"], "readwrite");
			let store = transaction.objectStore("tasks");
			let request = store.delete(key);

			request.onsuccess = function (e) {
				resolve(e.target.result);
			};

			request.onerror = function (e) {
				reject("Error removing item", e);
			};
		});
	},
	clear: function () {
		return new Promise((resolve, reject) => {
			let transaction = DBHandler.db.transaction(["tasks"], "readwrite");
			let store = transaction.objectStore("tasks");
			let request = store.clear();

			request.onsuccess = function (e) {
				resolve(e.target.result);
			};

			request.onerror = function (e) {
				reject("Error clearing store", e);
			};
		});
	},
};

async function transferLocalStorageToIndexedDB() {
	// Get all keys in localStorage
	let keys = Object.keys(localStorage);

	// For each key, get the value from localStorage, parse it as JSON, and store it in IndexedDB
	for (let key of keys) {
		let value = JSON.parse(localStorage.getItem(key));
		await DBHandler.set(key, value);
	}

	console.log("Transfer complete");

	await renderTaskListToDOM();
}

function clearLocalStorage() {
	localStorage.removeItem("tasks");
	localStorage.removeItem("counts");
}

function loadGoogleFont(font) {
	WebFont.load({
		google: {
			families: [font],
		},
	});
}

/**
 * Converts a camelCase string to a CSS variable format.
 *
 * @param {string} name - The camelCase string to convert.
 * @returns {string} The converted string in CSS variable format.
 */
function convertToCSSVar(name) {
	let cssVar = name.replace(/([A-Z])/g, "-$1").toLowerCase();
	return `--${cssVar}`;
}

/**
 * Converts a hexadecimal color value to its RGB equivalent.
 *
 * @param {string} hex - The hexadecimal color value. Can be 3 or 6 digits, with or without a leading '#'.
 * @returns {string} The RGB color value as a string in the format 'r, g, b'.
 */
function hexToRgb(hex) {
	// remove # if present
	if (hex[0] === "#") {
		hex = hex.slice(1);
	}

	let r = 0,
		g = 0,
		b = 0;

	if (hex.length == 3) {
		// 3 digits
		r = "0x" + hex[0] + hex[0];
		g = "0x" + hex[1] + hex[1];
		b = "0x" + hex[2] + hex[2];
	} else if (hex.length == 6) {
		// 6 digits
		r = "0x" + hex[0] + hex[1];
		g = "0x" + hex[2] + hex[3];
		b = "0x" + hex[4] + hex[5];
	}

	// integer value of rgb
	r = +r;
	g = +g;
	b = +b;

	return `${r}, ${g}, ${b}`;
}

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
			user.toLowerCase() === auth.channel &&
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

/**
 * import styles from configs
 */
function importStyles() {
	const styles = configs.styles;

	// fonts
	if (getSetting("headerGoogleFont")) {
		loadGoogleFont(styles.headerFontFamily);
	}
	if (getSetting("taskGoogleFont")) {
		loadGoogleFont(styles.taskFontFamily);
	}

	const stylesToImport = Object.keys(styles).filter((style) => {
		return !style.includes("Background");
	});

	stylesToImport.forEach((style) => {
		document.documentElement.style.setProperty(
			convertToCSSVar(style),
			styles[style]
		);
	});

	let backgroundStyles = Object.keys(styles).filter((style) => {
		return style.includes("Background");
	});

	// use regex to filter out after "Background"
	backgroundStyles = backgroundStyles.map((style) => {
		return style.replace(/Background.*/, "");
	});

	// loop through backgroundstyles
	backgroundStyles.forEach((style) => {
		// get background color and opacity
		let backgroundColor = styles[`${style}BackgroundColor`];
		let backgroundOpacity = styles[`${style}BackgroundOpacity`];

		let cssStyle = convertToCSSVar(style);

		// set background color
		document.documentElement.style.setProperty(
			`${cssStyle}-background-color`,
			`rgba(${hexToRgb(backgroundColor)}, ${backgroundOpacity})`
		);
	});

	if (!getSetting("displayTaskCount")) {
		document.querySelector(".task-count").style.display = "none";
	}

	let currentTitle = 0;
	// interval the task title
	setInterval(async () => {
		let taskTitle = document.querySelector(".title");

		// cycle through a list of titles
		let titles = configs.animation.titles;

		// if current title is the last title, set it to the first title
		if (currentTitle === titles.length - 1) {
			currentTitle = 0;
		} else {
			currentTitle++;
		}

		// on change title, add fade animation
		taskTitle.classList.add("fade");
		await sleep(500);

		// set new title
		taskTitle.innerText = titles[currentTitle];

		await sleep(100);

		// remove fade animation
		taskTitle.classList.remove("fade");
	}, 8000);
}

/**
 * Resets the entire DB
 */
async function resetDB() {
	await DBHandler.clear();
	await setupDB();
}

/**
 * Sets up the database with the default values if it does not exist
 */
async function setupDB() {
	const keys = ["tasks", "counts", "taskmaster"];
	const defaultValues = [
		{},
		{ users: {} },
		{
			users: {},
			startDate: new Date(),
			taskMasterCompleteCount: 0,
		},
	];

	for (let i = 0; i < keys.length; i++) {
		let value = await DBHandler.get(keys[i]);
		if (!value) {
			value = defaultValues[i];
		}
		await DBHandler.set(keys[i], value);
	}

	return;
}

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
function getUserTotalTaskCount(username) {
	return incompleteTasksCount(username) + completedTasksCount(username);
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

/**
 * Adds a task to a user's task list.
 *
 * @param {string} username - The user's name.
 * @param {string} userColor - The user's associated color.
 * @param {string} task - The task text.
 * @returns {Object} An object with a status and body. The status is 200 if successful, otherwise it indicates the error. The body contains the task text or an error message.
 */
async function addTask(username, userColor, task) {
	const tasks = await DBHandler.get("tasks");
	if (!tasks[username]) {
		tasks[username] = {
			todos: [],
			done: [],
			userColor: userColor,
		};
	}

	const taskExists = tasks[username].todos.find(
		(t) => t.text.toLowerCase() === task.toLowerCase()
	);
	const taskIsInvalid =
		!task || !task.trim() || task.toLowerCase() === "all" || isInt(task);
	const userHasReachedTaskLimit =
		incompleteTasksCount(username) >= getSetting("limit") &&
		getSetting("enableLimit");

	if (taskExists) {
		return createErrorResponse(
			`@${username} already has this task`,
			getResponse("duplicateTask")
		);
	}

	if (taskIsInvalid) {
		return createErrorResponse(
			`@${username} empty task or reserved keyword used`,
			getResponse("noTaskContent")
		);
	}

	if (userHasReachedTaskLimit) {
		return createErrorResponse(
			`@${username} has reached the limit of ${getSetting(
				"limit"
			)} tasks`,
			getResponse("noTaskAdded")
		);
	}

	const tasksToAdd = taskSeparator.some((char) => task.includes(char))
		? task
				.split(taskSeparator.find((char) => task.includes(char)))
				.map((t) => t.trim())
		: [task];
	const tasksFailedToAdd = [];

	tasksToAdd.forEach((t) => {
		if (
			t &&
			!tasks[username].todos.find((task) => task.text === t) &&
			!isInt(t)
		) {
			tasks[username].todos.push({ text: t, done: false, focus: false });
			taskListMemory.totalTaskCount++;
		} else {
			tasksFailedToAdd.push(t);
		}
	});

	await DBHandler.set("tasks", tasks);
	if (!scrolling) {
		await renderTaskListToDOM();
	}

	return {
		status: 200,
		body: {
			task: tasksToAdd.join(`${closeQuote}, ${openQuote}`),
			tasksFailedToAdd:
				tasksFailedToAdd.join(`${closeQuote}, ${openQuote}`) || "",
		},
	};
}

function createErrorResponse(errorMessage, errorType) {
	return {
		status: 0,
		body: {
			"error message": errorMessage,
			error: errorType,
		},
	};
}

/**
 * Adds a task to a user's task list and sets it as the current task.
 *
 * @param {string} username - The user's name.
 * @param {string} userColor - The user's associated color.
 * @param {string} task - The task text.
 * @returns {Object} An object with a status and body. The status is 200 if successful, otherwise it indicates the error. The body contains the task text or an error message.
 */
async function nowTask(username, userColor, task) {
	const tasks = await DBHandler.get("tasks");
	if (!tasks[username]) {
		tasks[username] = {
			todos: [],
			done: [],
			userColor: userColor,
		};
	}

	const taskExists = tasks[username].todos.find(
		(t) => t.text.toLowerCase() === task.toLowerCase()
	);
	const taskIsInvalid = !task || !task.trim() || task.toLowerCase() === "all";
	const userHasReachedTaskLimit =
		incompleteTasksCount(username) >= getSetting("limit") &&
		getSetting("enableLimit");
	const taskHasSeparators = taskSeparator.some((char) => task.includes(char));

	if (taskExists) {
		return createErrorResponse(
			`@${username} already has this task`,
			getResponse("duplicateTask")
		);
	}

	if (taskIsInvalid) {
		return createErrorResponse(
			`@${username} empty task or reserved keyword used`,
			getResponse("noTaskContent")
		);
	}

	if (userHasReachedTaskLimit) {
		return createErrorResponse(
			`@${username} has reached the limit of ${getSetting(
				"limit"
			)} tasks`,
			getResponse("noTaskAdded")
		);
	}

	if (taskHasSeparators) {
		return createErrorResponse(
			`@${username} cannot add multiple tasks with now`,
			getResponse("noTaskContent")
		);
	}

	tasks[username].todos.forEach((task) => {
		task.focus = false;
	});

	tasks[username].todos.push({ text: task, done: false, focus: true });
	taskListMemory.totalTaskCount++;

	await DBHandler.set("tasks", tasks);
	if (!scrolling) {
		await renderTaskListToDOM();
	}

	return {
		status: 200,
		body: {
			task: task,
		},
	};
}

/**
 * This function adds a new task to a user's task list and sets it as the currently focused task.
 *
 * @param {string} username - The name of the user for whom the task is being added.
 * @param {string} userColor - The color associated with the user.
 * @param {string} task - The text description of the task to be added.
 *
 * @returns {Object} - An object containing the status of the operation and a body with either the task added or an error message.
 */
async function nowTask(username, userColor, task) {
	const tasks = await DBHandler.get("tasks");
	if (!tasks[username]) {
		tasks[username] = {
			todos: [],
			done: [],
			userColor: userColor,
		};
	}

	const taskExists = tasks[username].todos.find(
		(t) => t.text.toLowerCase() === task.toLowerCase()
	);
	const taskIsInvalid = !task || !task.trim() || task.toLowerCase() === "all";
	const userHasReachedTaskLimit =
		incompleteTasksCount(username) >= getSetting("limit") &&
		getSetting("enableLimit");
	const taskHasSeparators = taskSeparator.some((char) => task.includes(char));

	if (taskExists) {
		return createErrorResponse(
			`@${username} already has this task`,
			getResponse("duplicateTask")
		);
	}

	if (taskIsInvalid) {
		return createErrorResponse(
			`@${username} empty task or reserved keyword used`,
			getResponse("noTaskContent")
		);
	}

	if (userHasReachedTaskLimit) {
		return createErrorResponse(
			`@${username} has reached the limit of ${getSetting(
				"limit"
			)} tasks`,
			getResponse("noTaskAdded")
		);
	}

	if (taskHasSeparators) {
		return createErrorResponse(
			`@${username} cannot add multiple tasks with now`,
			getResponse("noTaskContent")
		);
	}

	tasks[username].todos.forEach((task) => {
		task.focus = false;
	});

	tasks[username].todos.push({ text: task, done: false, focus: true });
	taskListMemory.totalTaskCount++;

	await DBHandler.set("tasks", tasks);
	if (!scrolling) {
		await renderTaskListToDOM();
	}

	return {
		status: 200,
		body: {
			task: task,
		},
	};
}

/**
 * This function focuses a specified task for a given user. If the task is successfully focused, the function returns an object with a status of 200 and the focused task. If the task is not focused due to the user having no tasks, the task being invalid input, or the task already being focused, the function returns an object with a status indicating the error and an error message.
 *
 * @param {string} username - The name of the user whose task is to be focused.
 * @param {string} task - The task to be focused.
 * @returns {Object} An object with a status and body. The status is 200 if the task is successfully focused, and the body contains the focused task. If the task is not focused, the status indicates the error and the body contains an error message.
 */
async function focusTask(username, task) {
	const tasks = await DBHandler.get("tasks");

	if (!tasks[username] || tasks[username].todos.length === 0) {
		return createErrorResponse(
			`@${username} has no tasks`,
			getResponse("noTask")
		);
	}

	const incompleteTasks = tasks[username].todos.filter((t) => !t.done);
	if (incompleteTasks.length === 0) {
		return createErrorResponse(
			`@${username} has no incomplete tasks`,
			getResponse("noTask")
		);
	}

	if (taskSeparator.some((separator) => task.includes(separator))) {
		return createErrorResponse(
			`@${username} need to specify ONLY ONE task`,
			getResponse("onlyOneFocus")
		);
	}

	let index = tasks[username].todos.findIndex(
		(t) => t.text.toLowerCase() === task.toLowerCase()
	);

	if (index === -1) {
		if (isInt(task)) {
			index = parseInt(task) - 1; // ACTUAL INDEX
		} else if (incompleteTasks.length === 1) {
			index = tasks[username].todos.findIndex((t) => !t.done);
		} else {
			return createErrorResponse(
				`@${username} invalid input`,
				getResponse("specifyFocusTask")
			);
		}

		if (index < 0 || index > tasks[username].todos.length - 1) {
			return createErrorResponse(
				`@${username} invalid input`,
				getResponse("specifyFocusTask")
			);
		}
	} else {
		if (tasks[username].todos[index].done) {
			return createErrorResponse(
				`@${username} task is already completed`,
				getResponse("specifyFocusTask")
			);
		}
	}

	let focusedTask = tasks[username].todos[index].text;

	// if task is already focused, return 1
	if (tasks[username].todos[index].focus) {
		return createErrorResponse(
			`@${username} task is already focused`,
			getResponse("alreadyFocusedTask")
		);
	}

	// if task is already completed, return 1
	if (tasks[username].todos[index].done) {
		return createErrorResponse(
			`@${username} task is already completed`,
			getResponse("specifyTaskIndex")
		);
	}

	// set all tasks to unfocused
	tasks[username].todos.forEach((task) => {
		task.focus = false;
	});

	// set task to focused
	tasks[username].todos[index].focus = true;

	await DBHandler.set("tasks", tasks);

	if (!scrolling) {
		await renderTaskListToDOM();
	}

	return {
		status: 200,
		body: {
			focusedTask: focusedTask,
		},
	};
}

/**
 * This function unfocuses all tasks for a given user. If the tasks are successfully unfocused, the function returns an object with a status of 200. If the tasks are not unfocused due to the user having no tasks or no tasks being focused, the function returns an object with a status indicating the error and an error message.
 *
 * @param {string} username - The name of the user whose tasks are to be unfocused.
 * @returns {Object} An object with a status and body. The status is 200 if the tasks are successfully unfocused. If the tasks are not unfocused, the status indicates the error and the body contains an error message.
 */
async function unfocusTask(username) {
	const tasks = await DBHandler.get("tasks");

	if (!tasks[username] || tasks[username].todos.length === 0) {
		return createErrorResponse(
			`@${username} has no tasks`,
			getResponse("noTask")
		);
	}

	// if no tasks are focused, return 1
	if (!tasks[username].todos.find((t) => t.focus)) {
		return createErrorResponse(
			`@${username} no tasks are focused`,
			getResponse("noFocusedTask")
		);
	}

	// set all tasks to unfocused
	tasks[username].todos.forEach((task) => {
		task.focus = false;
	});

	await DBHandler.set("tasks", tasks);

	if (!scrolling) {
		await renderTaskListToDOM();
	}

	return {
		status: 200,
	};
}

/**
 * Removes a specified task for a given user. If the task is successfully removed, the function returns an object with a status of 200 and the removed task. If the task is not removed due to the user having no tasks, the task being invalid input, or the task not existing, the function returns an object with a status indicating the error and an error message.
 *
 * @param {string} username - The name of the user from whom the task is to be removed.
 * @param {string} task - The task to be removed.
 * @returns {Object} An object with a status and body. The status is 200 if the task is successfully removed, and the body contains the removed task. If the task is not removed, the status indicates the error and the body contains an error message.
 */
async function removeTask(username, task) {
	const tasks = await DBHandler.get("tasks");
	if (!tasks[username] || tasks[username].todos.length === 0) {
		return {
			status: 0,
			body: {
				"error message": `@${username} has no tasks`,
				error: getResponse("noTask"),
			},
		};
	}

	const incompleteTasks = tasks[username].todos.filter((t) => !t.done);

	// match regex: integers separated by space e.g. '1 2 3 4'
	if (task.match(/^(\d+ )*\d+$/)) {
		// insert commas between integers
		task = task.replace(/(\d+)/g, "$1,");
		// remove trailing comma
		task = task.slice(0, -1);
	}
	let removedTaskIndex = [];
	let tasksRemoved = [];
	let tasksFailedToRemove = [];

	// check if there's a comma in the task (multiple tasks)
	if (taskSeparator.some((separator) => task.includes(separator))) {
		let tasksToRemove = [];

		let char = taskSeparator.find((element) => task.includes(element));

		tasksToRemove = task.split(char).map((t) => t.trim());

		for (const t of tasksToRemove) {
			let index = tasks[username].todos.findIndex(
				(task) => task.text.toLowerCase() === t.toLowerCase()
			);

			if (index === -1) {
				if (isInt(t)) {
					index = parseInt(t) - 1; // ACTUAL INDEX
				} else if (incompleteTasks.length === 1) {
					index = tasks[username].todos.findIndex((t) => !t.done);
					tasksRemoved.push(tasks[username].todos[index].text);
					removedTaskIndex.push(index);
				} else {
					tasksFailedToRemove.push(t);
					continue;
				}

				if (index < 0 || index > tasks[username].todos.length - 1) {
					tasksFailedToRemove.push(t);
					continue;
				} else {
					tasksRemoved.push(tasks[username].todos[index].text);
					removedTaskIndex.push(index);
				}
			} else {
				tasksRemoved.push(tasks[username].todos[index].text);
				removedTaskIndex.push(index);
			}
		}

		if (tasksRemoved.length === 0) {
			return {
				status: 1,
				body: {
					"error message": `@${username} invalid input`,
					error: getResponse("specifyTaskIndex"),
				},
			};
		}

		// sort removedTaskIndex in descending order
		removedTaskIndex.sort((a, b) => b - a);

		// remove tasks from tasks array
		for (const index of removedTaskIndex) {
			// decrement totalTaskCount if task is not done
			if (!tasks[username].todos[index].done) {
				taskListMemory.totalTaskCount--;
			}

			tasks[username].todos.splice(index, 1);
		}

		await DBHandler.set("tasks", tasks);
		if (!scrolling) {
			await renderTaskListToDOM();
		}
		return {
			status: 200,
			body: {
				removedTasks: tasksRemoved.join(`${closeQuote}, ${openQuote}`),
				failedTasks: tasksFailedToRemove.join(
					`${closeQuote}, ${openQuote}`
				),
			},
		};
	} else {
		let index = tasks[username].todos.findIndex(
			(t) => t.text.toLowerCase() === task.toLowerCase()
		);

		if (index === -1) {
			if (isInt(task)) {
				index = parseInt(task) - 1; // ACTUAL INDEX
			} else if (incompleteTasks.length === 1) {
				index = tasks[username].todos.findIndex((t) => !t.done);
			} else {
				return {
					status: 1,
					body: {
						"error message": `@${username} invalid input`,
						error: getResponse("specifyTaskIndex"),
					},
				};
			}

			if (index < 0 || index > tasks[username].todos.length - 1) {
				return {
					status: 1,
					body: {
						"error message": `@${username} invalid input`,
						error: getResponse("specifyTaskIndex"),
					},
				};
			}
		}

		task = tasks[username].todos[index].text;

		tasks[username].todos.splice(index, 1);
		taskListMemory.totalTaskCount--;
		await DBHandler.set("tasks", tasks);
		await renderTaskListToDOM();
		return {
			status: 200,
			body: {
				removedTasks: task,
				failedTasks: "",
			},
		};
	}
}

async function getFocusedTask(username) {
	const tasks = await DBHandler.get("tasks");

	if (!tasks[username] || tasks[username].todos.length === 0) {
		return {
			status: 0,
			body: {
				"error message": `@${username} has no tasks`,
				error: getResponse("noTask"),
			},
		};
	}

	let focusedTask = tasks[username].todos.find((t) => t.focus);

	if (!focusedTask) {
		return {
			status: 0,
			body: {
				"error message": `@${username} has no focused task`,
				error: getResponse("noFocusedTask"),
			},
		};
	}

	return {
		status: 200,
		body: {
			focusedTask: focusedTask.text,
		},
	};
}

async function checkIfTaskExists(username, task) {
	const tasks = await DBHandler.get("tasks");

	if (!tasks[username] || tasks[username].todos.length === 0) {
		return {
			status: 0,
			body: {
				"error message": `@${username} has no tasks`,
				error: getResponse("noTask"),
			},
		};
	}

	let taskExistsBasedOnText = tasks[username].todos.find(
		(t) => t.text.toLowerCase() === task.toLowerCase()
	)
		? true
		: false;

	// check if task exists based on index, has to be incomplete
	let taskExistsBasedOnIndex = false;

	if (tasks[username]) {
		taskExistsBasedOnIndex =
			isInt(task) &&
			parseInt(task) > 0 &&
			parseInt(task) <= tasks[username].todos.length;
	}

	return {
		text: taskExistsBasedOnText,
		index: taskExistsBasedOnIndex,
	};
}

/**
 * This function marks the current task of a user as complete and adds a new task to the user's task list.
 *
 * @param {string} username - The name of the user who is completing the current task and adding a new one.
 * @param {string} task - The text description of the new task to be added.
 *
 * @returns {Object} - An object containing the status of the operation and a body with either the old and new task or an error message.
 */
/**
 * This function marks the current task of a user as complete and adds a new task to the user's task list.
 *
 * @param {string} username - The name of the user who is completing the current task and adding a new one.
 * @param {string} task - The text description of the new task to be added.
 *
 * @returns {Object} - An object containing the status of the operation and a body with either the old and new task or an error message.
 */
async function nextTask(username, task) {
	const tasks = await DBHandler.get("tasks");
	if (!tasks[username] || tasks[username].todos.length === 0) {
		return {
			status: 0,
			body: {
				"error message": `@${username} has no tasks`,
				error: getResponse("noTask"),
			},
		};
	}

	if (task === "") {
		return {
			status: 1,
			body: {
				"error message": `@${username} empty task`,
				error: getResponse("nextNoContent"),
			},
		};
	}

	const incompleteTasks = tasks[username].todos.filter((t) => !t.done);

	const taskExists = await checkIfTaskExists(username, task);
	const textTaskExists = taskExists.text;
	const indexTaskExists = taskExists.index;
	const focusedTaskExists = incompleteTasks.find((t) => t.focus);

	// check if there's a focused task
	if (!focusedTaskExists && incompleteTasks.length > 1) {
		return {
			status: 0,
			body: {
				"error message": `@${username} does not have a focused task`,
				error: getResponse("noFocusedTask"),
			},
		};
	} else if (textTaskExists || indexTaskExists) {
		let index = tasks[username].todos.findIndex((t) => t.focus);
		let oldTask = tasks[username].todos[index].text;

		// if old task is the same as an existing task, return 1
		if (textTaskExists) {
			if (tasks[username].todos.find((t) => t.text === task)) {
				return {
					status: 1,
					body: {
						"error message": `@${username} already has this task`,
						error: getResponse("duplicateTask"),
					},
				};
			}
		} else {
			if (tasks[username].todos[parseInt(task) - 1].done) {
				return {
					status: 1,
					body: {
						"error message": `@${username} already finished this task`,
						error: getResponse("taskAlreadyFinished"),
					},
				};
			}
		}

		// mark focused task as complete then focus on the existing task

		// mark task as done
		tasks[username].todos[index].done = true;
		tasks[username].todos[index].focus = false;

		let newFocusTask = null;

		// focus on the new task
		if (textTaskExists) {
			let newIndex = tasks[username].todos.findIndex(
				(t) => t.text.toLowerCase() === task.toLowerCase()
			);
			newFocusTask = tasks[username].todos[newIndex];
		} else {
			newFocusTask = tasks[username].todos[parseInt(task) - 1];
		}

		newFocusTask.focus = true;

		await addDoneCount(username, 1);

		await DBHandler.set("tasks", tasks);

		if (!scrolling) {
			await renderTaskListToDOM();
		}

		return {
			status: 200,
			body: {
				oldTask: oldTask,
				newTask: newFocusTask.text,
			},
		};
	} else if (focusedTaskExists) {
		if (!indexTaskExists && isInt(task)) {
			return {
				status: 1,
				body: {
					"error message": `@${username} invalid input`,
					error: getResponse("specifyTaskIndex"),
				},
			};
		}

		// mark the focused task as complete, then add a new task "task"

		// find index of focused task
		let index = tasks[username].todos.findIndex((t) => t.focus);

		let oldTask = tasks[username].todos[index].text;

		// mark task as done
		tasks[username].todos[index].done = true;
		tasks[username].todos[index].focus = false;

		// add new task
		tasks[username].todos.push({ text: task, done: false, focus: true });
		taskListMemory.totalTaskCount++;

		await addDoneCount(username, 1);

		await DBHandler.set("tasks", tasks);

		if (!scrolling) {
			await renderTaskListToDOM();
		}

		return {
			status: 200,
			body: {
				oldTask: oldTask,
				newTask: task,
			},
		};
	} else {
		// mark the incomplete task as complete, then add a new task "task"

		// find index of incomplete task
		let index = tasks[username].todos.findIndex((t) => !t.done);

		let oldTask = tasks[username].todos[index].text;

		// mark task as done
		tasks[username].todos[index].done = true;
		await addDoneCount(username, 1);

		// add new task
		tasks[username].todos.push({ text: task, done: false, focus: false });
		taskListMemory.totalTaskCount++;

		await DBHandler.set("tasks", tasks);

		if (!scrolling) {
			await renderTaskListToDOM();
		}

		return {
			status: 200,
			body: {
				oldTask: oldTask,
				newTask: task,
			},
		};
	}
}

/**
 * Determines if a given value is an integer.
 *
 * @param {string} value - The value to be checked.
 * @returns {boolean} Returns true if the value is an integer, and false otherwise.
 */
function isInt(value) {
	return (
		!isNaN(value) &&
		parseInt(Number(value)) == value &&
		!isNaN(parseInt(value, 10))
	);
}

function clearMemory() {
	taskListMemory = {
		doneTaskCount: 0,
		totalTaskCount: 0,
	};
}

/**
 * Clears all completed tasks for a given user. If the tasks are successfully cleared, the function returns an object with a status of 200. If the tasks are not cleared due to the user having no tasks, the function returns an object with a status indicating the error and an error message.
 *
 * @param {string} username - The name of the user whose completed tasks are to be cleared.
 * @returns {Object} An object with a status and body. The status is 200 if the tasks are successfully cleared. If the tasks are not cleared, the status indicates the error and the body contains an error message.
 */
async function clearOwnDoneTasks(username) {
	const tasks = await DBHandler.get("tasks");

	if (!tasks[username] || tasks[username].todos.length === 0) {
		return {
			status: 0,
			body: {
				"error message": `@${username} has no tasks`,
				error: getResponse("noTask"),
			},
		};
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
 * Marks a specified task as done for a given user. If the task is successfully marked as done, the function returns an object with a status of 200 and the marked task. If the task is not marked as done due to the user having no tasks, the task being invalid input, or the task already being completed, the function returns an object with a status indicating the error and an error message.
 *
 * @param {string} username - The name of the user whose task is to be marked as done.
 * @param {string} task - The task to be marked as done.
 * @returns {Object} An object with a status and body. The status is 200 if the task is successfully marked as done, and the body contains the marked task. If the task is not marked as done, the status indicates the error and the body contains an error message.
 */
async function markTaskDone(username, task) {
	const tasks = await DBHandler.get("tasks");

	// user does not have any tasks
	if (!tasks[username] || tasks[username].todos.length === 0) {
		return {
			status: 0,
			body: {
				"error message": `@${username} has no tasks`,
				error: getResponse("noTask"),
			},
		};
	}

	const incompleteTasks = tasks[username].todos.filter((t) => !t.done);

	if (incompleteTasks.length === 0) {
		return {
			status: 0,
			body: {
				"error message": `@${username} has no incomplete tasks`,
				error: getResponse("noTask"),
			},
		};
	}

	// match regex: integers separated by space e.g. '1 2 3 4'
	if (task.match(/^(\d+ )*\d+$/)) {
		// insert commas between integers
		task = task.replace(/(\d+)/g, "$1,");
		// remove trailing comma
		task = task.slice(0, -1);
	}

	let tasksMarkedComplete = [];
	let tasksFailedToComplete = [];

	// check if there's a comma in the task (multiple tasks)
	if (taskSeparator.some((separator) => task.includes(separator))) {
		let tasksToMarkDone = [];

		let char = taskSeparator.find((element) => task.includes(element));

		tasksToMarkDone = task.split(char).map((t) => t.trim());

		for (const t of tasksToMarkDone) {
			let index = tasks[username].todos.findIndex(
				(task) => task.text.toLowerCase() === t.toLowerCase()
			);

			// check if task is already marked done
			if (index !== -1 && tasks[username].todos[index].done) {
				tasksFailedToComplete.push(t);
				continue;
			}

			if (index === -1) {
				if (isInt(t)) {
					index = parseInt(t) - 1; // ACTUAL INDEX
				} else if (incompleteTasks.length === 1) {
					index = tasks[username].todos.findIndex((t) => !t.done);
					tasksMarkedComplete.push(tasks[username].todos[index].text);
					// increment count
					await addDoneCount(username, 1);
				} else {
					tasksFailedToComplete.push(t);
					continue;
				}

				if (index < 0 || index > tasks[username].todos.length - 1) {
					tasksFailedToComplete.push(t);
					continue;
				} else if (tasks[username].todos[index].done) {
					tasksFailedToComplete.push(t);
					continue;
				} else {
					tasksMarkedComplete.push(tasks[username].todos[index].text);
					// increment count
					await addDoneCount(username, 1);
				}
			} else {
				tasksMarkedComplete.push(tasks[username].todos[index].text);
				// increment count
				await addDoneCount(username, 1);
			}
			tasks[username].todos[index].done = true;
			tasks[username].todos[index].focus = false;
		}

		if (tasksMarkedComplete.length === 0) {
			return {
				status: 1,
				body: {
					"error message": `@${username} invalid input`,
					error: getResponse("specifyTaskIndex"),
				},
			};
		}

		await DBHandler.set("tasks", tasks);
		if (!scrolling) {
			await renderTaskListToDOM();
		}
		return {
			status: 200,
			body: {
				markedTasks: tasksMarkedComplete.join(
					`${closeQuote}, ${openQuote}`
				),
				failedTasks: tasksFailedToComplete.join(
					`${closeQuote}, ${openQuote}`
				),
				markedTasksCount: tasksMarkedComplete.length,
			},
		};
	} else {
		// if there's no comma in the task (single task)

		let index = tasks[username].todos.findIndex(
			(t) => t.text.toLowerCase() === task.toLowerCase()
		);

		// is there a task with focus on?
		let focusedTask = tasks[username].todos.find((t) => t.focus);

		if (index === -1) {
			if (isInt(task)) {
				index = parseInt(task) - 1; // ACTUAL INDEX
			} else if (incompleteTasks.length === 1) {
				index = tasks[username].todos.findIndex((t) => !t.done);
			} else if (focusedTask) {
				index = tasks[username].todos.findIndex(
					(t) =>
						t.text.toLowerCase() === focusedTask.text.toLowerCase()
				);
			} else if (getSetting("automaticDoneIndex")) {
				// index is the first incomplete task
				index = tasks[username].todos.findIndex((t) => !t.done);
			} else {
				return {
					status: 1,
					body: {
						"error message": `@${username} invalid input`,
						error: getResponse("specifyTaskIndex"),
					},
				};
			}

			if (index < 0 || index > tasks[username].todos.length - 1) {
				return {
					status: 1,
					body: {
						"error message": `@${username} invalid input`,
						error: getResponse("specifyTaskIndex"),
					},
				};
			}
		}

		// task is already marked done
		if (tasks[username].todos[index].done) {
			return {
				status: 2,
				body: {
					"error message": `@${username} task is already completed`,
					error: getResponse("alreadyDoneTask"),
				},
			};
		}

		task = tasks[username].todos[index].text;
		tasks[username].todos[index].done = true;
		await addDoneCount(username, 1);

		await DBHandler.set("tasks", tasks);
		if (!scrolling) {
			await renderTaskListToDOM();
		}
		return {
			status: 200,
			body: {
				markedTasks: task,
				failedTasks: "",
				markedTasksCount: 1,
			},
		};
	}
}

/**
 * Marks all tasks as done for a given user. If the tasks are successfully marked as done, the function returns an object with a status of 200. If the tasks are not marked as done due to the user having no tasks, the function returns an object with a status indicating the error and an error message.
 *
 * @param {string} username - The name of the user whose tasks are to be marked as done.
 * @returns {Object} An object with a status and body. The status is 200 if the tasks are successfully marked as done. If the tasks are not marked as done, the status indicates the error and the body contains an error message.
 */
async function markAllTasksAsDone(username) {
	const tasks = await DBHandler.get("tasks");

	// user does not have any tasks
	if (!tasks[username] || tasks[username].todos.length === 0) {
		return {
			status: 0,
			body: {
				"error message": `@${username} has no tasks`,
				error: getResponse("noTask"),
			},
		};
	}

	for (const task of tasks[username].todos) {
		if (!task.done) {
			await addDoneCount(username, 1);
		}
		task.done = true;
	}

	await DBHandler.set("tasks", tasks);
	if (!scrolling) {
		await renderTaskListToDOM();
	}

	return {
		status: 200,
	};
}

// 0: user has no tasks
// 1: invalid input
// 2: task is already incomplete
// 200: succcess
async function markTaskUndone(username, task) {
	const tasks = await DBHandler.get("tasks");

	// user does not have any tasks
	if (!tasks[username] || tasks[username].todos.length === 0) {
		return {
			status: 0,
			body: {
				"error message": `@${username} has no tasks`,
				error: getResponse("noTask"),
			},
		};
	}

	const completedTasks = tasks[username].todos.filter((t) => t.done);

	// match regex: integers separated by space e.g. '1 2 3 4'
	if (task.match(/^(\d+ )*\d+$/)) {
		// insert commas between integers
		task = task.replace(/(\d+)/g, "$1,");
		// remove trailing comma
		task = task.slice(0, -1);
	}

	let tasksMarkedUndone = [];
	let tasksFailedToMarkUndone = [];

	// check if there's a comma in the task (multiple tasks)
	if (taskSeparator.some((separator) => task.includes(separator))) {
		let tasksToMarkUndone;

		let char = taskSeparator.find((element) => task.includes(element));

		tasksToMarkUndone = task.split(char).map((t) => t.trim());

		for (const t of tasksToMarkUndone) {
			let index = tasks[username].todos.findIndex(
				(task) => task.text.toLowerCase() === t.toLowerCase()
			);

			if (index === -1) {
				// user input isn't the task name
				if (isInt(t)) {
					index = parseInt(t) - 1; // ACTUAL INDEX
				} else {
					tasksFailedToMarkUndone.push(t);

					continue;
				}

				if (index < 0 || index > tasks[username].todos.length - 1) {
					tasksFailedToMarkUndone.push(t);

					continue;
				} else {
					tasksMarkedUndone.push(tasks[username].todos[index].text);
				}
			} else {
				tasksMarkedUndone.push(tasks[username].todos[index].text);
			}
			await addDoneCount(username, -1);
			tasks[username].todos[index].done = false;
		}

		if (tasksMarkedUndone.length === 0) {
			return {
				status: 1,
				body: {
					"error message": `@${username} invalid input`,
					error: getResponse("specifyTaskIndex"),
				},
			};
		}

		await DBHandler.set("tasks", tasks);
		if (!scrolling) {
			await renderTaskListToDOM();
		}

		return {
			status: 200,
			body: {
				markedTasks: tasksMarkedUndone.join(
					`${closeQuote}, ${openQuote}`
				),
				failedTasks: tasksFailedToMarkUndone.join(
					`${closeQuote}, ${openQuote}`
				),
			},
		};
	} else {
		let index = tasks[username].todos.findIndex(
			(t) => t.text.toLowerCase() === task.toLowerCase() && t.done
		);

		if (index === -1) {
			if (isInt(task)) {
				index = parseInt(task) - 1; // ACTUAL INDEX
			} else if (completedTasks.length === 1) {
				index = tasks[username].todos.findIndex((t) => t.done);
			} else {
				return {
					status: 1,
					body: {
						"error message": `@${username} invalid input`,
						error: getResponse("specifyTaskIndex"),
					},
				};
			}

			if (index < 0 || index > tasks[username].todos.length - 1) {
				return {
					status: 1,
					body: {
						"error message": `@${username} invalid input`,
						error: getResponse("specifyTaskIndex"),
					},
				};
			}

			tasks[username].todos[index].done = false;
			await addDoneCount(username, -1);

			await DBHandler.set("tasks", tasks);

			if (!scrolling) {
				await renderTaskListToDOM();
			}
			return {
				status: 200,
				body: {
					markedTasks: tasks[username].todos[index].text,
					failedTasks: "",
				},
			};
		} else {
			tasks[username].todos[index].done = false;
			await addDoneCount(username, -1);

			await DBHandler.set("tasks", tasks);

			if (!scrolling) {
				await renderTaskListToDOM();
			}
			return {
				status: 200,
				body: {
					markedTasks: tasks[username].todos[index].text,
					failedTasks: "",
				},
			};
		}
	}
}

/**
 * Edits a specified task for a given user. If the task is successfully edited, the function returns an object with a status of 200, the original task, and the new task.
 * If the task is not edited due to the user having no tasks, the task being invalid input, or the task index being out of range,
 * the function returns an object with a status indicating the error and an error message.
 *
 * @param {string} username - The name of the user whose task is to be edited.
 * @param {string} message - The message containing the task index and the new task.
 * @returns {Object} An object with a status and body. The status is 200 if the task is successfully edited, and the body contains the original task and the new task. If the task is not edited, the status indicates the error and the body contains an error message.
 */
async function editTask(username, message) {
	const tasks = await DBHandler.get("tasks");
	let noSpecifiedIndex = false;

	if (!tasks[username] || tasks[username].todos.length === 0) {
		return {
			status: 0,
			body: {
				"error message": `@${username} has no tasks`,
				error: getResponse("noTask"),
			},
		};
	}

	let focusedTask = tasks[username].todos.find((t) => t.focus);

	// example 'message': 1 new task
	let index = parseInt(message.split(" ")[0]) - 1; // ACTUAL INDEX

	let incompleteTaskCount = tasks[username].todos.filter(
		(t) => !t.done
	).length;

	if ((incompleteTaskCount === 1 || focusedTask) && index !== 0) {
		noSpecifiedIndex = true;
		if (incompleteTaskCount === 1) {
			// find index of incomplete task
			index = tasks[username].todos.findIndex((t) => !t.done);
		} else if (focusedTask) {
			index = tasks[username].todos.findIndex((t) => t.focus);
		}
	}

	if (isNaN(index)) {
		return {
			status: 1,
			body: {
				"error message": `@${username} invalid input`,
				error: getResponse("specifyTaskIndex"),
			},
		};
	}

	let newTask = message.split(" ").slice(1).join(" ");

	if (noSpecifiedIndex) {
		newTask = message;
	}

	// if newTask is empty or whitespace, return 1
	if (!newTask || !newTask.trim()) {
		return {
			status: 1,
			body: {
				"error message": `@${username} invalid input`,
				error: getResponse("noTaskContent"),
			},
		};
	}

	if (index < 0 || index > tasks[username].todos.length - 1) {
		return {
			status: 1,
			body: {
				"error message": `@${username} invalid input`,
				error: getResponse("specifyTaskIndex"),
			},
		};
	}

	let originalTask = tasks[username].todos[index].text;

	tasks[username].todos[index].text = newTask;

	await DBHandler.set("tasks", tasks);
	if (!scrolling) {
		await renderTaskListToDOM();
	}

	return {
		status: 200,
		body: {
			originalTask: originalTask,
			newTask: newTask,
		},
	};
}

/**
 * Checks the tasks of a given user. If the user has tasks, the function returns an object with a status of 200 and a formatted string of the user's tasks. If the user has no tasks, the function returns an object with a status indicating the error and an error message.
 *
 * @param {string} name - The name of the user whose tasks are to be checked.
 * @returns {Object} An object with a status and body. The status is 200 if the user has tasks, and the body contains a formatted string of the user's tasks. If the user has no tasks, the status indicates the error and the body contains an error message.
 */
async function checkTasks(name) {
	const tasks = await DBHandler.get("tasks");

	// Go through keys of tasks, find match of lowercased username
	let username = Object.keys(tasks).find(
		(user) => user.toLowerCase() === name.toLowerCase()
	);

	if (!username) {
		return {
			status: 0,
			body: {
				"error message": `@${name} has no tasks`,
				error: getResponse("noTask"),
			},
		};
	}

	if (!tasks[username]) {
		return {
			status: 0,
			body: {
				"error message": `@${username} has no tasks`,
				error: getResponse("noTask"),
			},
		};
	}

	// filter completed tasks
	const incompleteTasks = tasks[username].todos.filter((t) => !t.done);
	const completedTasks = tasks[username].todos.filter((t) => t.done);

	// format incomplete tasks into string: 1. task 1 | 2. task 2 | 3. task 3...
	let reply = `${name}'s incomplete {taskName}s (${incompleteTasks.length}) : `;
	let taskIndex;
	for (let i = 0; i < incompleteTasks.length; i++) {
		// get index of task by task name
		taskIndex =
			tasks[username].todos.findIndex(
				(t) =>
					t.text.toLowerCase() ===
					incompleteTasks[i].text.toLowerCase()
			) + 1;

		reply += `${taskIndex}. ${
			incompleteTasks[i].focus ? "(ongoing)" : ""
		} ${incompleteTasks[i].text} | `;
	}
	reply = reply.slice(0, -3);

	// format completed tasks into string: 1. task 1 | 2. task 2 | 3. task 3...
	// reply += `\n|| completed tasks (${completedTasks.length}) : `;

	// for (let j = 0; j < completedTasks.length; j++) {
	// 	taskIndex =
	// 		tasks[username].todos.findIndex(
	// 			(t) =>
	// 				t.text.toLowerCase() ===
	// 				completedTasks[j].text.toLowerCase()
	// 		) + 1;
	// 	reply += `${taskIndex}. ${completedTasks[j].text} | `;
	// }
	// reply = reply.slice(0, -3);

	return {
		status: 200,
		body: {
			reply: reply,
		},
	};
}

// 0: user has no tasks
async function listTasks(username) {
	const tasks = await DBHandler.get("tasks");
	if (!tasks[username]) {
		return {
			status: 0,
			body: {
				"error message": `@${username} has no tasks`,
				error: getResponse("noTask"),
			},
		};
	}
	// filter completed tasks
	const incompleteTasks = tasks[username].todos.filter((t) => !t.done);

	if (incompleteTasks.length === 0) {
		return {
			status: 0,
			body: {
				"error message": `@${username} has no incomplete tasks`,
				error: getResponse("noTask"),
			},
		};
	}

	// format incomplete tasks into string: 1. task 1 | 2. task 2 | 3. task 3...
	let reply = `@${username} `;
	let taskIndex;
	for (let i = 0; i < incompleteTasks.length; i++) {
		// get index of task by task name
		taskIndex =
			tasks[username].todos.findIndex(
				(t) =>
					t.text.toLowerCase() ===
					incompleteTasks[i].text.toLowerCase()
			) + 1;
		reply += `${incompleteTasks[i].text}, `;
	}
	reply = reply.slice(0, -2);
	return {
		status: 200,
		body: {
			reply: reply,
		},
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
	// clear all tasks except for broadcasters
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

async function renderTaskListToDOM() {
	const tasks = await DBHandler.get("tasks");

	const taskContainers = document.querySelectorAll(".task-container");
	console.log(getSetting("hideWhenNoTasks"), tasks);

	let hasTasks = false;

	taskContainers.forEach((taskList) => {
		taskList.innerHTML = "";

		let totalTaskCount = 0;
		let completedTasksCount = 0;

		for (const user in tasks) {
			if (user.toLowerCase() === "id") continue;
			if (!tasks[user].todos) continue;

			const userTasks = tasks[user];

			if (userTasks.todos.length === 0) {
				// remove user from tasks
				delete tasks[user];
				continue;
			}

			const userColor = userTasks.userColor;

			const taskDiv = document.createElement("div");
			taskDiv.classList.add("task");
			taskList.appendChild(taskDiv);

			const usernameDiv = document.createElement("div");
			usernameDiv.classList.add("username");
			usernameDiv.innerText = user;

			if (styles.usernameColor === "") {
				usernameDiv.style.color = userColor;
			} else {
				usernameDiv.style.color = styles.usernameColor;
			}

			taskDiv.appendChild(usernameDiv);

			const olListDiv = document.createElement("ol");
			olListDiv.classList.add("user-tasks");
			taskDiv.appendChild(olListDiv);

			for (const task of userTasks.todos) {
				const taskElement = document.createElement("li");
				taskElement.classList.add("todo");

				totalTaskCount++;

				if (task.done) {
					taskElement.classList.add("done");
					completedTasksCount++;
				} else if (task.focus) {
					taskElement.classList.add("focus");
				}

				const taskContent = document.createElement("div");
				taskContent.classList.add("content");

				taskContent.innerText = task.text;

				taskElement.appendChild(taskContent);
				olListDiv.appendChild(taskElement);

				hasTasks = true;
			}
		}

		if (taskListMemory.doneTaskCount > completedTasksCount) {
			completedTasksCount = taskListMemory.doneTaskCount;
			totalTaskCount = taskListMemory.totalTaskCount;
		}

		if (totalTaskCount < completedTasksCount) {
			totalTaskCount = completedTasksCount;
		}

		document.querySelector(
			".task-count"
		).innerText = `${completedTasksCount}/${totalTaskCount}`;

		taskListMemory.doneTaskCount = completedTasksCount;
		taskListMemory.totalTaskCount = totalTaskCount;
	});

	if (getSetting("hideWhenNoTasks") && !hasTasks) {
		// #main-container 0 opacity
		document.querySelector("#main-container").style.opacity = "0";
		visible = false;
		console.log("hiding");
	} else if (getSetting("hideWhenNoTasks") && hasTasks && !visible) {
		// #main-container 1 opacity
		document.querySelector("#main-container").style.opacity = "1";
		visible = true;
	}

	await DBHandler.set("tasks", tasks);

	checkToAnimate();
}

function sleep(ms) {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

// unit tests
async function tests() {
	let listOfStreamers = [
		`followRythonDev1`,
		`followRythonDev2`,
		`followRythonDev3`,
		`followRythonDev4`,
		`followRythonDev5`,
		`followRythonDev6`,
		`followRythonDev7`,
	];

	for (let i = 0; i < listOfStreamers.length; i++) {
		addTask(
			listOfStreamers[i],
			"#ffc0cb",
			`task 1, task 2, task 3, task 4, task 5`
		);
		await sleep(1000);
		markTaskDone(listOfStreamers[i], `1, 2, 3, 4, 5`);
		await sleep(1000);
	}
}

async function checkToAnimate() {
	// compare task container height and task wrapper height

	let taskContainer = document.querySelector(".task-container");
	let taskContainerHeight = taskContainer.scrollHeight;

	let taskWrapper = document.querySelector(".task-wrapper");
	let taskWrapperHeight = taskWrapper.clientHeight;

	// scroll task wrapper up and down once
	if (taskContainerHeight > taskWrapperHeight && !scrolling) {
		if (!scrolling) {
			document.querySelector(".secondary").style.display = "flex";

			let finalHeight =
				taskContainerHeight + configs.animation.gapBetweenScrolls;

			let primaryKeyFrames = [
				{ transform: `translateY(0)` },
				{ transform: `translateY(-${finalHeight}px)` },
			];

			let secondaryKeyFrames = [
				{ transform: `translateY(${finalHeight}px)` },
				{ transform: `translateY(0)` },
			];

			let scrollingSpeed = (finalHeight / scrollSpeed) * 1000;

			let options = {
				duration: scrollingSpeed,
				iterations: 1,
				easing: "linear",
			};

			primaryAnimation = document
				.querySelector(".primary")
				.animate(primaryKeyFrames, options);

			secondaryAnimation = document
				.querySelector(".secondary")
				.animate(secondaryKeyFrames, options);

			primaryAnimation.play();
			secondaryAnimation.play();

			scrolling = true;

			addAnimationListeners();
		}
	} else if (!scrolling) {
		document.querySelector(".secondary").style.display = "none";

		// cancel animations
		if (primaryAnimation) {
			primaryAnimation.cancel();
		}
		if (secondaryAnimation) {
			secondaryAnimation.cancel();
		}
		scrolling = false;
	}
}

function addAnimationListeners() {
	if (primaryAnimation) {
		primaryAnimation.addEventListener("finish", animationFinished);
		primaryAnimation.addEventListener("cancel", animationFinished);
	}
}

async function animationFinished() {
	scrolling = false;
	await renderTaskListToDOM();
	checkToAnimate();
}

function cancelAnimation() {
	if (primaryAnimation) {
		primaryAnimation.cancel();
	}
	if (secondaryAnimation) {
		secondaryAnimation.cancel();
	}
	scrolling = false;
}

DBHandler.open()
	.then(async () => {
		await setupDB();
		if (getSetting("testTasks")) {
			await resetDB();
			await tests();
		}
		importStyles();
		await renderTaskListToDOM();
	})
	.catch((error) => {
		console.error("Error opening database:", error);
	});
