/**
 * Adds a task to a user's task list.
 *
 * @param {string} username - The user's name.
 * @param {string} userColor - The user's associated color.
 * @param {string} task - The task text.
 * @returns {Object} An object with a status and body. The status is 200 if successful, otherwise it indicates the error. The body contains the task text or an error message.
 */
async function addTask(username, userColor, task) {
	let addTaskFunction = await _addTask(username, userColor, task);

	if (addTaskFunction.status !== 200) {
		return addTaskFunction;
	}

	let addedTaskIndices = addTaskFunction.body.addedTaskIndices;
	let tasksFailedToAdd = addTaskFunction.body.tasksFailedToAdd;

	if (!scrolling) {
		await renderTaskListToDOM();
	}

	let displayedTasksAdded = addedTaskIndices.map((t) => {
		return `(${t.index + 1}) ${t.task}`;
	});

	return {
		status: 200,
		body: {
			task: displayedTasksAdded.join(`${closeQuote}, ${openQuote}`),
			tasksFailedToAdd:
				tasksFailedToAdd.join(`${closeQuote}, ${openQuote}`) || "",
		},
	};
}

async function _addTask(username, userColor, task, oneTaskOnly = false) {
	const tasks = await DBHandler.get("tasks");
	if (!tasks[username]) {
		tasks[username] = {
			todos: [],
			done: [],
			userColor: userColor,
		};
	}
	let tasksFailedToAdd = [];
	let addedTaskIndices = [];

	if (taskSeparator.some((char) => task.includes(char))) {
		if (oneTaskOnly) {
			return createErrorResponse(
				`@${username} cannot add multiple tasks with now`,
				getResponse("noTaskContent")
			);
		}
		const tasksToAdd = task
			.split(taskSeparator.find((char) => task.includes(char)))
			.map((t) => t.trim());

		for (const t of tasksToAdd) {
			if (
				t &&
				!tasks[username].todos.find(
					(task) => task.text === t && !task.done
				) &&
				!isInt(t) &&
				t.trim() !== "" &&
				(!getSetting("taskCharacterLimitEnabled") ||
					t.length <= getSetting("taskCharacterLimit"))
			) {
				tasks[username].todos.push({
					text: t,
					done: false,
					focus: false,
				});

				let index = tasks[username].todos.length - 1;
				addedTaskIndices.push({ index: index, task: t });
				taskListMemory.totalTaskCount++;
			} else {
				tasksFailedToAdd.push(t);
			}
		}

		await DBHandler.set("tasks", tasks);
	} else {
		const taskExistsAndIncomplete = tasks[username].todos.find(
			(t) => t.text.toLowerCase() === task.toLowerCase() && !t.done
		);

		const taskIsInvalid =
			!task ||
			!task.trim() ||
			task.toLowerCase() === "all" ||
			isInt(task);

		const taskTooLong =
			getSetting("taskCharacterLimitEnabled") &&
			task.length > getSetting("taskCharacterLimit");

		const userHasReachedTaskLimit =
			(await incompleteTasksCount(username)) >= getSetting("limit") &&
			getSetting("enableLimit");

		if (taskExistsAndIncomplete) {
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

		if (taskTooLong) {
			return createErrorResponse(
				`@${username}'s task is too long`,
				getResponse("taskTooLong")
			);
		}

		addedTaskIndices = [
			{
				index: tasks[username].todos.length,
				task: task,
			},
		];

		tasks[username].todos.push({
			text: task,
			done: false,
			focus: false,
		});

		await DBHandler.set("tasks", tasks);
	}

	return {
		status: 200,
		body: {
			addedTaskIndices: addedTaskIndices,
			tasksFailedToAdd: tasksFailedToAdd,
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
	return focusTask(username, userColor, task);
}

/**
 * This function focuses a specified task for a given user. If the task is successfully focused, the function returns an object with a status of 200 and the focused task. If the task is not focused due to the user having no tasks, the task being invalid input, or the task already being focused, the function returns an object with a status indicating the error and an error message.
 *
 * @param {string} username - The name of the user whose task is to be focused.
 * @param {string} task - The task to be focused.
 * @returns {Object} An object with a status and body. The status is 200 if the task is successfully focused, and the body contains the focused task. If the task is not focused, the status indicates the error and the body contains an error message.
 */
async function focusTask(username, userColor, task) {
	let tasks = await DBHandler.get("tasks");

	if (!tasks[username] || tasks[username].todos.length === 0) {
		tasks[username] = {
			todos: [],
			done: [],
			userColor: userColor,
		};
	}

	const incompleteTasks = tasks[username].todos.filter((t) => !t.done);

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
			index = parseInt(task) - 1;
		} else if (task !== "") {
			let addTaskFunction = await _addTask(username, userColor, task);

			if (addTaskFunction.status !== 200) {
				return addTaskFunction;
			}

			index = addTaskFunction.body.addedTaskIndices[0].index;
			tasks = await DBHandler.get("tasks");
		} else if (incompleteTasks.length === 1) {
			index = tasks[username].todos.findIndex((t) => !t.done);
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

	if (tasks[username].todos[index].focus) {
		return createErrorResponse(
			`@${username} task is already focused`,
			getResponse("alreadyFocusedTask")
		);
	}

	if (tasks[username].todos[index].done) {
		return createErrorResponse(
			`@${username} task is already completed`,
			getResponse("specifyTaskIndex")
		);
	}

	tasks[username].todos.forEach((task) => {
		task.focus = false;
	});

	tasks[username].todos[index].focus = true;

	await DBHandler.set("tasks", tasks);

	if (!scrolling) {
		await renderTaskListToDOM();
	}

	return {
		status: 200,
		body: {
			focusedTask: `(${index + 1}) ${focusedTask}`,
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

	if (!tasks[username].todos.find((t) => t.focus)) {
		return createErrorResponse(
			`@${username} no tasks are focused`,
			getResponse("noFocusedTask")
		);
	}

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
		return createErrorResponse(
			`@${username} has no tasks`,
			getResponse("noTask")
		);
	}

	const incompleteTasks = tasks[username].todos.filter((t) => !t.done);

	if (task.match(/^(\d+ )*\d+$/)) {
		task = task.replace(/(\d+)/g, "$1,");
		task = task.slice(0, -1);
	}
	let removedTaskIndex = [];
	let tasksRemoved = [];
	let tasksFailedToRemove = [];

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
					index = parseInt(t) - 1;
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
			return createErrorResponse(
				`@${username} invalid input`,
				getResponse("specifyTaskIndex"),
				1
			);
		}

		removedTaskIndex.sort((a, b) => b - a);

		for (const index of removedTaskIndex) {
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

		let focusedTask = tasks[username].todos.find((t) => t.focus);

		if (index === -1) {
			if (isInt(task)) {
				index = parseInt(task) - 1;
			} else if (incompleteTasks.length === 1) {
				index = tasks[username].todos.findIndex((t) => !t.done);
				} else if (focusedTask) {
				index = tasks[username].todos.findIndex(
					(t) =>
						t.text.toLowerCase() === focusedTask.text.toLowerCase()
				);
			} else {
				return createErrorResponse(
					`@${username} invalid input`,
					getResponse("specifyTaskIndex"),
					1
				);
			}

			if (index < 0 || index > tasks[username].todos.length - 1) {
				return createErrorResponse(
					`@${username} invalid input`,
					getResponse("specifyTaskIndex"),
					1
				);
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

async function checkIfTaskExists(username, task) {
	const tasks = await DBHandler.get("tasks");

	if (!tasks[username] || tasks[username].todos.length === 0) {
		return createErrorResponse(
			`@${username} has no tasks`,
			getResponse("noTask")
		);
	}

	let taskExistsBasedOnText = tasks[username].todos.find(
		(t) => t.text.toLowerCase() === task.toLowerCase()
	)
		? true
		: false;

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
async function nextTask(username, task) {
	const tasks = await DBHandler.get("tasks");
	if (!tasks[username] || tasks[username].todos.length === 0) {
		return createErrorResponse(
			`@${username} has no tasks`,
			getResponse("noTask")
		);
	}

	if (task === "") {
		return createErrorResponse(
			`@${username} empty task`,
			getResponse("nextNoContent"),
			1
		);
	}

	const incompleteTasks = tasks[username].todos.filter((t) => !t.done);

	const taskExists = await checkIfTaskExists(username, task);
	const textTaskExists = taskExists.text;
	const indexTaskExists = taskExists.index;
	const focusedTaskExists = incompleteTasks.find((t) => t.focus);

	if (!focusedTaskExists && incompleteTasks.length > 1) {
		return createErrorResponse(
			`@${username} does not have a focused task`,
			getResponse("noFocusedTask")
		);
	} else if (textTaskExists || indexTaskExists) {
		let index = tasks[username].todos.findIndex((t) => t.focus);
		let oldTask = tasks[username].todos[index].text;

		if (textTaskExists) {
			let existingTextTask = tasks[username].todos.find(
				(t) => t.text.toLowerCase() === task.toLowerCase()
			);
			if (existingTextTask.done === true) {
				return {
					status: 1,
					body: {
						task: task,
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
						task: task,
						"error message": `@${username} already finished this task`,
						error: getResponse("taskAlreadyFinished"),
					},
				};
			}
		}

		tasks[username].todos[index].done = true;
		tasks[username].todos[index].focus = false;

		let newFocusTask = null;

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
					task: task,
					"error message": `@${username} invalid input`,
					error: getResponse("specifyTaskIndex"),
				},
			};
		}

		let index = tasks[username].todos.findIndex((t) => t.focus);

		let oldTask = tasks[username].todos[index].text;

		tasks[username].todos[index].done = true;
		tasks[username].todos[index].focus = false;

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
		let index = tasks[username].todos.findIndex((t) => !t.done);

		let oldTask = tasks[username].todos[index].text;

		tasks[username].todos[index].done = true;
		await addDoneCount(username, 1);

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
 * Marks a specified task as done for a given user. If the task is successfully marked as done, the function returns an object with a status of 200 and the marked task. If the task is not marked as done due to the user having no tasks, the task being invalid input, or the task already being completed, the function returns an object with a status indicating the error and an error message.
 *
 * @param {string} username - The name of the user whose task is to be marked as done.
 * @param {string} task - The task to be marked as done.
 * @returns {Object} An object with a status and body. The status is 200 if the task is successfully marked as done, and the body contains the marked task. If the task is not marked as done, the status indicates the error and the body contains an error message.
 */
async function markTaskDone(username, task) {
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

	if (task.match(/^(\d+ )*\d+$/)) {
		task = task.replace(/(\d+)/g, "$1,");
		task = task.slice(0, -1);
	}

	let tasksMarkedComplete = [];
	let tasksFailedToComplete = [];

	if (taskSeparator.some((separator) => task.includes(separator))) {
		let tasksToMarkDone = [];

		let char = taskSeparator.find((element) => task.includes(element));

		tasksToMarkDone = task.split(char).map((t) => t.trim());

		for (const t of tasksToMarkDone) {
			let index = tasks[username].todos.findIndex(
				(task) =>
					task.text.toLowerCase() === t.toLowerCase() && !task.done
			);

			if (index === -1) {
				if (isInt(t)) {
					index = parseInt(t) - 1;
				} else if (incompleteTasks.length === 1) {
					index = tasks[username].todos.findIndex((t) => !t.done);
					tasksMarkedComplete.push(tasks[username].todos[index].text);
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
					await addDoneCount(username, 1);
				}
			} else {
				tasksMarkedComplete.push(tasks[username].todos[index].text);
				await addDoneCount(username, 1);
			}
			tasks[username].todos[index].done = true;
			tasks[username].todos[index].focus = false;
		}

		if (tasksMarkedComplete.length === 0) {
			return createErrorResponse(
				`@${username} invalid input`,
				getResponse("specifyTaskIndex"),
				1
			);
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
		let index = tasks[username].todos.findIndex(
			(t) => t.text.toLowerCase() === task.toLowerCase() && !t.done
		);

		let focusedTask = tasks[username].todos.find((t) => t.focus);

		if (index === -1) {
			if (isInt(task)) {
				index = parseInt(task) - 1;
			} else if (incompleteTasks.length === 1) {
				index = tasks[username].todos.findIndex((t) => !t.done);
			} else if (focusedTask) {
				index = tasks[username].todos.findIndex(
					(t) =>
						t.text.toLowerCase() === focusedTask.text.toLowerCase()
				);
			} else if (getSetting("automaticDoneIndex")) {
				index = tasks[username].todos.findIndex((t) => !t.done);
			} else {
				return createErrorResponse(
					`@${username} invalid input`,
					getResponse("specifyTaskIndex"),
					1
				);
			}

			if (index < 0 || index > tasks[username].todos.length - 1) {
				return createErrorResponse(
					`@${username} invalid input`,
					getResponse("specifyTaskIndex"),
					1
				);
			}
		}

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
		tasks[username].todos[index].focus = false;

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

	if (!tasks[username] || tasks[username].todos.length === 0) {
		return createErrorResponse(
			`@${username} has no tasks`,
			getResponse("noTask")
		);
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

	if (!tasks[username] || tasks[username].todos.length === 0) {
		return createErrorResponse(
			`@${username} has no tasks`,
			getResponse("noTask")
		);
	}

	const completedTasks = tasks[username].todos.filter((t) => t.done);

	if (task.match(/^(\d+ )*\d+$/)) {
		task = task.replace(/(\d+)/g, "$1,");
		task = task.slice(0, -1);
	}

	let tasksMarkedUndone = [];
	let tasksFailedToMarkUndone = [];

	if (taskSeparator.some((separator) => task.includes(separator))) {
		let tasksToMarkUndone;

		let char = taskSeparator.find((element) => task.includes(element));

		tasksToMarkUndone = task.split(char).map((t) => t.trim());

		for (const t of tasksToMarkUndone) {
			let index = tasks[username].todos.findIndex(
				(task) => task.text.toLowerCase() === t.toLowerCase()
			);

			if (index === -1) {
				if (isInt(t)) {
					index = parseInt(t) - 1;
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
			return createErrorResponse(
				`@${username} invalid input`,
				getResponse("specifyTaskIndex"),
				1
			);
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
				index = parseInt(task) - 1;
			} else if (completedTasks.length === 1) {
				index = tasks[username].todos.findIndex((t) => t.done);
			} else {
				return createErrorResponse(
					`@${username} invalid input`,
					getResponse("specifyTaskIndex"),
					1
				);
			}

			if (index < 0 || index > tasks[username].todos.length - 1) {
				return createErrorResponse(
					`@${username} invalid input`,
					getResponse("specifyTaskIndex"),
					1
				);
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
		return createErrorResponse(
			`@${username} has no tasks`,
			getResponse("noTask")
		);
	}

	let focusedTask = tasks[username].todos.find((t) => t.focus && !t.done);

	let index = -1;

	if (/^\d+$/.test(message.split(" ")[0])) {
		index = parseInt(message.split(" ")[0]) - 1;
	}

	let incompleteTaskCount = tasks[username].todos.filter(
		(t) => !t.done
	).length;

	if ((incompleteTaskCount === 1 || focusedTask) && index === -1) {
		noSpecifiedIndex = true;
		if (incompleteTaskCount === 1) {
			index = tasks[username].todos.findIndex((t) => !t.done);
		} else if (focusedTask) {
			index = tasks[username].todos.findIndex((t) => t.focus);
		}
	}

	if (isNaN(index)) {
		return createErrorResponse(
			`@${username} invalid input`,
			getResponse("specifyTaskIndex"),
			1
		);
	}

	let newTask = message.split(" ").slice(1).join(" ");

	if (noSpecifiedIndex) {
		newTask = message;
	}

	if (!newTask || !newTask.trim()) {
		return createErrorResponse(
			`@${username} invalid input`,
			getResponse("noTaskContent"),
			1
		);
	}

	if (index < 0 || index > tasks[username].todos.length - 1) {
		return createErrorResponse(
			`@${username} invalid input`,
			getResponse("specifyTaskIndex"),
			1
		);
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
 * Retrieves the focused task for a given user.
 *
 * @async
 * @function focusedTask
 * @param {string} username - The username of the user whose focused task is to be retrieved.
 * @returns {Promise<Object>} A promise that resolves to an object containing the status and body.
 * The body contains either the focused task text or an error message.
 * @throws Will throw an error if there is an issue with the database retrieval.
 */
async function focusedTask(username) {
	const tasks = await DBHandler.get("tasks");

	if (!tasks[username] || tasks[username].todos.length === 0) {
		return createErrorResponse(
			`@${username} has no tasks`,
			getResponse("noTask")
		);
	}

	let focusedTask = tasks[username].todos.find((t) => t.focus);

	let index = tasks[username].todos.findIndex((t) => t.focus);

	if (!focusedTask) {
		return createErrorResponse(
			`@${username} has no focused task`,
			getResponse("noFocusedTask")
		);
	}

	return {
		status: 200,
		body: {
			focusedTask: `(${index + 1}) ${focusedTask.text}`,
		},
	};
}

async function logTask(username, userColor, task) {
	const tasks = await DBHandler.get("tasks");
	if (!tasks[username]) {
		tasks[username] = {
			todos: [],
			done: [],
			userColor: userColor,
		};
	}

	const taskExistsAndIncomplete = tasks[username].todos.find(
		(t) => t.text.toLowerCase() === task.toLowerCase() && !t.done
	);

	const taskExistsAndCompleted = tasks[username].todos.find(
		(t) => t.text.toLowerCase() === task.toLowerCase() && t.done
	);
	const taskIsInvalid =
		!task || !task.trim() || task.toLowerCase() === "all" || isInt(task);

	if (taskExistsAndIncomplete) {
		return createErrorResponse(
			`@${username} already has this task`,
			getResponse("duplicateTask")
		);
	}

	if (taskExistsAndCompleted) {
		return createErrorResponse(
			`@${username} already has this task completed`,
			getResponse("taskAlreadyCompleted")
		);
	}

	if (taskIsInvalid) {
		return createErrorResponse(
			`@${username} empty task or reserved keyword used`,
			getResponse("noTaskContent")
		);
	}

	const tasksToLog = taskSeparator.some((char) => task.includes(char))
		? task
				.split(taskSeparator.find((char) => task.includes(char)))
				.map((t) => t.trim())
		: [task];

	let tasksFailedToLog = [];
	let loggedTaskIndices = [];

	for (const t of tasksToLog) {
		if (
			t &&
			!tasks[username].todos.find((task) => task.text === t) &&
			!isInt(t) &&
			t.trim() !== "" &&
			(!getSetting("taskCharacterLimitEnabled") ||
				t.length <= getSetting("taskCharacterLimit"))
		) {
			tasks[username].todos.push({ text: t, done: true, focus: false });

			await addDoneCount(username, 1);

			let index = tasks[username].todos.length - 1;
			console.log({ index: index, task: t });
			loggedTaskIndices.push({ index: index, task: t });
			console.log(loggedTaskIndices);

			taskListMemory.totalTaskCount++;
		} else {
			tasksFailedToLog.push(t);
		}
	}

	await DBHandler.set("tasks", tasks);
	if (!scrolling) {
		await renderTaskListToDOM();
	}

	let displayedTasksLogged = loggedTaskIndices.map((t) => {
		return `(${t.index + 1}) ${t.task}`;
	});

	return {
		status: 200,
		body: {
			task: displayedTasksLogged.join(`${closeQuote}, ${openQuote}`),
			tasksFailedToLog:
				tasksFailedToLog.join(`${closeQuote}, ${openQuote}`) || "",
		},
	};
}

/**
 * Checks the tasks of a given user. If the user has tasks, the function returns an object with a status of 200 and a formatted string of the user's tasks. If the user has no tasks, the function returns an object with a status indicating the error and an error message.
 *
 * @param {string} name - The name of the user whose tasks are to be checked.
 * @returns {Object} An object with a status and body. The status is 200 if the user has tasks, and the body contains a formatted string of the user's tasks. If the user has no tasks, the status indicates the error and the body contains an error message.
 */
async function checkTasks(name, completed = false) {
	const tasks = await DBHandler.get("tasks");

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

	const filteredTasks = completed
		? tasks[username].todos.filter((t) => t.done)
		: tasks[username].todos.filter((t) => !t.done);

	let label = completed ? "completed" : "incomplete";

	let reply = `${name}'s ${label} {taskName}s (${filteredTasks.length}) : `;
	for (
		let taskIndex = 0;
		taskIndex < tasks[username].todos.length;
		taskIndex++
	) {
		let currentTask = tasks[username].todos[taskIndex];
		if (!completed) {
			if (currentTask.done) {
				continue;
			}

			reply += `${taskIndex + 1}. ${
				currentTask.focus ? "(ongoing)" : ""
			} ${currentTask.text} | `;
		} else {
			if (!currentTask.done) {
				continue;
			}
			reply += `${taskIndex + 1}. ${currentTask.text} | `;
		}
	}
	reply = reply.slice(0, -3);

	return {
		status: 200,
		body: {
			reply: reply,
		},
	};
}

// 0: user has no tasks
async function listTasks(username, separator = ",") {
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

	let replies = [];
	let reply = `@${username} `;

	for (let i = 0; i < incompleteTasks.length; i++) {
		reply += `${incompleteTasks[i].text}${separator} `;

		if ((i + 1) % 10 === 0) {
			replies.push(reply.slice(0, -2));
			reply = `@${username} `;
		}
	}

	if (reply !== `@${username} `) {
		replies.push(reply.slice(0, -2));
	}

	return {
		status: 200,
		body: {
			replies: replies,
		},
	};
}
