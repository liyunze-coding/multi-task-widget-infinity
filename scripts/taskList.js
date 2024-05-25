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

var taskListMemory = {
	doneTaskCount: 0,
	totalTaskCount: 0,
};

function getSetting(setting) {
	return configs.settings[setting] ?? defaultConfigs.settings[setting];
}

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

const settings = configs.settings;
const styles = configs.styles;
const scrollSpeed = configs.animation.scrollSpeed;
let scrolling = false;
let primaryAnimation, secondaryAnimation;

function loadGoogleFont(font) {
	WebFont.load({
		google: {
			families: [font],
		},
	});
}

// convert taskListBorderColor to task-list-border-color
function convertToCSSVar(name) {
	let cssVar = name.replace(/([A-Z])/g, "-$1").toLowerCase();
	return `--${cssVar}`;
}

// hex to rgb that accepts 3 or 6 digits
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

	// interger value of rgb
	r = +r;
	g = +g;
	b = +b;

	return `${r}, ${g}, ${b}`;
}

// import styles from configs
function importStyles() {
	const styles = configs.styles;

	// fonts
	if (configs.settings.headerGoogleFont) {
		loadGoogleFont(styles.headerFontFamily);
	}
	if (configs.settings.taskGoogleFont) {
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

async function renderTaskListToDOM() {
	const tasks = await DBHandler.get("tasks");
	const taskContainers = document.querySelectorAll(".task-container");

	taskContainers.forEach((taskList) => {
		taskList.innerHTML = "";
		let totalTaskCount = 0;
		let completedTasksCount = 0;

		if (getSetting("showStreamersTasksOnly")) {
			const streamer = getSetting("streamer");
			if (tasks[streamer]) {
				({ totalTaskCount, completedTasksCount } = handleTasks(
					tasks,
					streamer,
					taskList,
					totalTaskCount,
					completedTasksCount
				));
			}
		} else {
			for (const user in tasks) {
				if (user.toLowerCase() === "id" || !tasks[user].todos) continue;
				({ totalTaskCount, completedTasksCount } = handleTasks(
					tasks,
					user,
					taskList,
					totalTaskCount,
					completedTasksCount
				));
			}
		}

		updateTaskCount(totalTaskCount, completedTasksCount);
	});

	await DBHandler.set("tasks", tasks);
	await checkToAnimate();
}

function handleTasks(
	tasks,
	user,
	taskList,
	totalTaskCount,
	completedTasksCount
) {
	const userTasks = tasks[user];
	if (userTasks.todos.length === 0) {
		delete tasks[user];
	} else {
		const taskDiv = createTaskDiv(userTasks, user);
		taskList.appendChild(taskDiv);

		for (const task of userTasks.todos) {
			const taskElement = createTaskElement(task);
			taskDiv.querySelector(".user-tasks").appendChild(taskElement);

			totalTaskCount++;
			if (task.done) completedTasksCount++;
		}
	}

	return { totalTaskCount, completedTasksCount };
}

function createTaskDiv(userTasks, username) {
	const taskDiv = document.createElement("div");
	taskDiv.classList.add("task");

	const usernameDiv = document.createElement("div");
	usernameDiv.classList.add("username");
	usernameDiv.innerText = username;
	usernameDiv.style.color = styles.usernameColor || userTasks.userColor;
	taskDiv.appendChild(usernameDiv);

	const olListDiv = document.createElement("ol");
	olListDiv.classList.add("user-tasks");
	taskDiv.appendChild(olListDiv);

	return taskDiv;
}

function createTaskElement(task) {
	const taskElement = document.createElement("li");
	taskElement.classList.add("todo");
	taskElement.innerText = task.text;

	if (task.done) taskElement.classList.add("done");
	else if (task.focus) taskElement.classList.add("focus");

	return taskElement;
}

function updateTaskCount(totalTaskCount, completedTasksCount) {
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
}

function sleep(ms) {
	return new Promise((resolve) => setTimeout(resolve, ms));
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
	await checkToAnimate();
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
		importStyles();
		await renderTaskListToDOM();

		setInterval(async () => {
			await renderTaskListToDOM();
		}, 5000);
	})
	.catch((error) => {
		console.error("Error opening database:", error);
	});
