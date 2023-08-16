/*
DB structure:

- tasks
    - username:
		- todos (array)
            - [{text, done}, {text, done}]
		- done
		- userColor
*/

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

	// interval the task title
	setInterval(async () => {
		let taskTitle = document.querySelector(".title");
		let taskTitleText = taskTitle.innerText;

		// cycle through a list of titles
		let titles = configs.animation.titles;

		// get current title
		let currentTitle = titles.indexOf(taskTitleText);

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

function resetDB() {
	localStorage.clear();
	setupDB();
}

function setupDB() {
	if (!localStorage.tasks) {
		localStorage.setItem(`tasks`, "{}");
	}
}

// 0: limit has reached
// 1: duplicate task
// 2: invalid input
// string (single or multiple tasks): success
function addTask(username, userColor, task) {
	const tasks = JSON.parse(localStorage.tasks);
	if (!tasks[username]) {
		tasks[username] = {
			todos: [],
			done: [],
			userColor: userColor,
		};
	}

	if (
		incompleteTasksCount(username) >= settings.limit &&
		settings.enableLimit
	) {
		return 0;
	}

	if (
		tasks[username].todos.find(
			(t) => t.text.toLowerCase() === task.toLowerCase()
		)
	) {
		return 1;
	}

	// if task is whitespace or empty
	if (!task || !task.trim()) {
		return 2;
	}

	let tasksFailedToAdd = [];

	// if task has commas
	if (task.includes(",")) {
		let tasksToAdd = task.split(",").map((t) => t.trim());

		if (
			incompleteTasksCount(username) + tasksToAdd.length >
				settings.limit &&
			settings.enableLimit
		) {
			tasksFailedToAdd = tasksToAdd.slice(
				settings.limit - incompleteTasksCount(username),
				tasksToAdd.length
			);

			tasksToAdd = tasksToAdd.slice(
				0,
				settings.limit - incompleteTasksCount(username)
			);
		}

		for (const t of tasksToAdd) {
			tasks[username].todos.push({ text: t, done: false });
		}
		localStorage.setItem(`tasks`, JSON.stringify(tasks));
		if (!scrolling) {
			renderTaskListToDOM();
		}
		return {
			task: tasksToAdd.join('", "'),
			tasksFailedToAdd: tasksFailedToAdd.join('", "') || "",
		};
	}

	tasks[username].todos.push({ text: task, done: false });
	localStorage.setItem(`tasks`, JSON.stringify(tasks));
	if (!scrolling) {
		renderTaskListToDOM();
	}

	return {
		task: task,
		tasksFailedToAdd: "",
	};
}

// 0: user has no tasks
// 1: invalid input
// removed task: success
function removeTask(username, task) {
	const tasks = JSON.parse(localStorage.tasks);
	if (!tasks[username] || tasks[username].todos.length === 0) {
		return 0;
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
	if (task.includes(",")) {
		let tasksToRemove = task.split(",").map((t) => t.trim());
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
			return 1;
		}

		// sort removedTaskIndex in descending order
		removedTaskIndex.sort((a, b) => b - a);

		// remove tasks from tasks array
		for (const index of removedTaskIndex) {
			tasks[username].todos.splice(index, 1);
		}

		localStorage.setItem(`tasks`, JSON.stringify(tasks));
		if (!scrolling) {
			renderTaskListToDOM();
		}
		return {
			removedTasks: tasksRemoved.join('", "'),
			failedTasks: tasksFailedToRemove.join('", "'),
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
				return 1;
			}

			if (index < 0 || index > tasks[username].todos.length - 1) {
				return 1;
			}
		}

		task = tasks[username].todos[index].text;

		tasks[username].todos.splice(index, 1);
		localStorage.setItem(`tasks`, JSON.stringify(tasks));
		renderTaskListToDOM();
		return {
			removedTasks: task,
			failedTasks: "",
		};
	}
}

// function to determine if string is integer
function isInt(value) {
	return (
		!isNaN(value) &&
		parseInt(Number(value)) == value &&
		!isNaN(parseInt(value, 10))
	);
}

// 0: user has no tasks
// 1: success
function clearOwnDoneTasks(username) {
	const tasks = JSON.parse(localStorage.tasks);

	if (!tasks[username] || tasks[username].todos.length === 0) {
		return 0;
	}

	let incompleteUserTasks = tasks[username].todos.filter((t) => !t.done);

	// replace user's task with incomplete tasks
	tasks[username].todos = incompleteUserTasks;

	localStorage.setItem(`tasks`, JSON.stringify(tasks));
	if (!scrolling) {
		renderTaskListToDOM();
	}

	return 1;
}

// 0: user has no tasks
// 1: invalid input
// task: succcess
function markTaskDone(username, task) {
	const tasks = JSON.parse(localStorage.tasks);

	// user does not have any tasks
	if (!tasks[username] || tasks[username].todos.length === 0) {
		return 0;
	}

	const incompleteTasks = tasks[username].todos.filter((t) => !t.done);

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
	if (task.includes(",")) {
		let tasksToMarkDone = task.split(",").map((t) => t.trim());
		for (const t of tasksToMarkDone) {
			let index = tasks[username].todos.findIndex(
				(task) => task.text.toLowerCase() === t.toLowerCase()
			);

			if (index === -1) {
				if (isInt(t)) {
					index = parseInt(t) - 1; // ACTUAL INDEX
				} else if (incompleteTasks.length === 1) {
					index = tasks[username].todos.findIndex((t) => !t.done);
					tasksMarkedComplete.push(tasks[username].todos[index].text);
				} else {
					tasksFailedToComplete.push(t);
					continue;
				}

				if (index < 0 || index > tasks[username].todos.length - 1) {
					tasksFailedToComplete.push(t);
					continue;
				} else {
					tasksMarkedComplete.push(tasks[username].todos[index].text);
				}
			} else {
				tasksMarkedComplete.push(tasks[username].todos[index].text);
			}
			tasks[username].todos[index].done = true;
		}

		if (tasksMarkedComplete.length === 0) {
			return 1;
		}

		localStorage.setItem(`tasks`, JSON.stringify(tasks));
		if (!scrolling) {
			renderTaskListToDOM();
		}
		return {
			markedTasks: tasksMarkedComplete.join('", "'),
			failedTasks: tasksFailedToComplete.join('", "'),
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
				return 1;
			}

			if (index < 0 || index > tasks[username].todos.length - 1) {
				return 1;
			}
		}

		task = tasks[username].todos[index].text;
		tasks[username].todos[index].done = true;
		localStorage.setItem(`tasks`, JSON.stringify(tasks));
		renderTaskListToDOM();
		return {
			markedTasks: task,
			failedTasks: "",
		};
	}
}

function markTaskUndone(username, task) {
	const tasks = JSON.parse(localStorage.tasks);

	// user does not have any tasks
	if (!tasks[username] || tasks[username].todos.length === 0) {
		return 0;
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
	if (task.includes(",")) {
		let tasksToMarkUndone = task.split(",").map((t) => t.trim());
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
			tasks[username].todos[index].done = false;
		}

		if (tasksMarkedUndone.length === 0) {
			return 1;
		}

		localStorage.setItem(`tasks`, JSON.stringify(tasks));
		if (!scrolling) {
			renderTaskListToDOM();
		}

		return {
			markedTasks: tasksMarkedUndone.join('", "'),
			failedTasks: tasksFailedToMarkUndone.join('", "'),
		};
	} else {
		let index = tasks[username].todos.findIndex(
			(t) => t.text.toLowerCase() === task.toLowerCase()
		);

		if (index === -1) {
			if (isInt(task)) {
				index = parseInt(task) - 1; // ACTUAL INDEX
			} else if (completedTasks.length === 1) {
				index = tasks[username].todos.findIndex((t) => t.done);
			} else {
				return 1;
			}

			if (index < 0 || index > tasks[username].todos.length - 1) {
				return 1;
			}

			tasks[username].todos[index].done = false;
			localStorage.setItem(`tasks`, JSON.stringify(tasks));
			renderTaskListToDOM();
			return {
				markedTasks: tasks[username].todos[index].text,
				failedTasks: "",
			};
		}
	}
}

// 0: user has no tasks
// 1: invalid input
// [original task, new task]: succcess
function editTask(username, message) {
	const tasks = JSON.parse(localStorage.tasks);
	let noSpecifiedIndex = false;

	if (!tasks[username] || tasks[username].todos.length === 0) {
		return 0;
	}

	// example 'message': 1 new task
	let index = parseInt(message.split(" ")[0]) - 1; // ACTUAL INDEX

	let incompleteTaskCount = tasks[username].todos.filter(
		(t) => !t.done
	).length;

	if (incompleteTaskCount === 1 && index !== 0) {
		// find index of incomplete task
		index = tasks[username].todos.findIndex((t) => !t.done);
		noSpecifiedIndex = true;
	}

	if (isNaN(index)) {
		return 1;
	}

	let newTask = message.split(" ").slice(1).join(" ");

	if (noSpecifiedIndex) {
		newTask = message;
	}

	// if newTask is empty or whitespace, return 1
	if (!newTask || !newTask.trim()) {
		return 1;
	}

	if (index < 0 || index > tasks[username].todos.length - 1) {
		return 1;
	}

	let originalTask = tasks[username].todos[index].text;

	tasks[username].todos[index].text = newTask;

	localStorage.setItem(`tasks`, JSON.stringify(tasks));
	if (!scrolling) {
		renderTaskListToDOM();
	}

	return [originalTask, newTask];
}

// 0: user has no tasks
function checkTasks(username) {
	const tasks = JSON.parse(localStorage.tasks);
	if (!tasks[username]) {
		return 0;
	}
	// filter completed tasks
	const incompleteTasks = tasks[username].todos.filter((t) => !t.done);
	const completedTasks = tasks[username].todos.filter((t) => t.done);

	// format incomplete tasks into string: 1. task 1 | 2. task 2 | 3. task 3...
	let reply = `@${username} incomplete tasks (${incompleteTasks.length}) : `;
	let taskIndex;
	for (let i = 0; i < incompleteTasks.length; i++) {
		// get index of task by task name
		taskIndex =
			tasks[username].todos.findIndex(
				(t) =>
					t.text.toLowerCase() ===
					incompleteTasks[i].text.toLowerCase()
			) + 1;
		reply += `${taskIndex}. ${incompleteTasks[i].text} | `;
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

	return reply;
}

function incompleteTasksCount(username) {
	const tasks = JSON.parse(localStorage.tasks);
	if (!tasks[username]) {
		return 0;
	}
	return tasks[username].todos.filter((t) => !t.done).length;
}

function clearUserTasks(username) {
	const tasks = JSON.parse(localStorage.tasks);
	if (!tasks[username]) {
		return;
	}
	tasks[username].todos = [];

	localStorage.setItem(`tasks`, JSON.stringify(tasks));
}

function clearAllDoneTasks() {
	const tasks = JSON.parse(localStorage.tasks);
	for (const user in tasks) {
		tasks[user].todos = tasks[user].todos.filter((t) => !t.done);
	}
	cancelAnimation();
	checkToAnimate();
	localStorage.setItem(`tasks`, JSON.stringify(tasks));
	renderTaskListToDOM();
}

function clearAllTasks() {
	resetDB();
	cancelAnimation();
	checkToAnimate();
	renderTaskListToDOM();
}

function clearAllExceptStreamer(streamer) {
	// clear all tasks except for broadcasters
	const tasks = JSON.parse(localStorage.tasks);
	for (const user in tasks) {
		if (user.toLowerCase() !== streamer.toLowerCase()) {
			tasks[user].todos = [];
		}
	}

	localStorage.setItem(`tasks`, JSON.stringify(tasks));

	clearAllDoneTasks();

	cancelAnimation();
	checkToAnimate();

	renderTaskListToDOM();
}

function renderTaskListToDOM() {
	const tasks = JSON.parse(localStorage.tasks);

	const taskContainers = document.querySelectorAll(".task-container");
	taskContainers.forEach((taskList) => {
		taskList.innerHTML = "";

		let totalTaskCount = 0;
		let completedTasksCount = 0;
		for (const user in tasks) {
			const userTasks = tasks[user];
			if (userTasks.todos.length === 0) {
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
				}

				taskElement.innerText = task.text;
				olListDiv.appendChild(taskElement);
			}
		}

		document.querySelector(
			".task-count"
		).innerText = `${completedTasksCount}/${totalTaskCount}`;
	});
	checkToAnimate();
}

function sleep(ms) {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

// unit tests
async function tests1() {
	let listOfStreamers = [
		`cloudydayzzz`,
		`berryspace`,
		`MohFocus`,
		`xeno_hiraeth`,
		`euphie___`,
		`unknownnie`,
		`theyolotato`,
		// `charliosaurus`,
		// `jutstreams`,
		// `mikewhatwhere`,
		// `studypaws`,
		// `pcc_lanezzz`,
		// `workwithjandj`,
		// `studylena`,
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
	if (taskContainerHeight > taskWrapperHeight) {
		if (!scrolling) {
			document.querySelector(".secondary").style.display = "flex";

			let finalHeight = taskContainerHeight + 100;

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
		cancelAnimation();
		scrolling = false;
	}
}

function addAnimationListeners() {
	if (primaryAnimation) {
		primaryAnimation.addEventListener("finish", animationFinished);
		primaryAnimation.addEventListener("cancel", animationFinished);
	}
	if (secondaryAnimation) {
		secondaryAnimation.addEventListener("finish", animationFinished);
		secondaryAnimation.addEventListener("cancel", animationFinished);
	}
}

function animationFinished() {
	scrolling = false;
	renderTaskListToDOM();
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

(function () {
	setupDB();
	importStyles();
	renderTaskListToDOM();
})();
