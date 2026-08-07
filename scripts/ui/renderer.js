async function renderTaskListToDOM() {
	const tasks = await DBHandler.get("tasks");

	const taskContainers = document.querySelectorAll(".task-container");

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
		document.querySelector("#main-container").style.opacity = "0";
		visible = false;
	} else if (getSetting("hideWhenNoTasks") && hasTasks && !visible) {
		document.querySelector("#main-container").style.opacity = "1";
		visible = true;
	}

	await DBHandler.set("tasks", tasks);

	checkToAnimate();
}

async function checkToAnimate() {
	let taskContainer = document.querySelector(".task-container");
	let taskContainerHeight = taskContainer.scrollHeight;

	let taskWrapper = document.querySelector(".task-wrapper");
	let taskWrapperHeight = taskWrapper.clientHeight;

	let secondary = document.querySelector(".secondary");

	if (taskContainerHeight > taskWrapperHeight && !scrolling) {
		if (!scrolling) {
			secondary.style.display = "flex";

			let finalHeight =
				taskContainerHeight + configs.animation.gapBetweenScrolls;

			let keyframes = [
				{ transform: `translateY(0)` },
				{ transform: `translateY(-${finalHeight}px)` },
			];
			let scrollingSpeed = (finalHeight / scrollSpeed) * 1000;

			let options = {
				duration: scrollingSpeed,
				iterations: 1,
				easing: "linear",
			};

			primaryAnimation = document
				.querySelector(".primary")
				.animate(keyframes, options);

			secondaryAnimation = document
				.querySelector(".secondary")
				.animate(keyframes, options);

			primaryAnimation.play();
			secondaryAnimation.play();

			scrolling = true;

			addAnimationListeners();
		}
	} else if (!scrolling) {
		secondary.style.display = "none";

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
