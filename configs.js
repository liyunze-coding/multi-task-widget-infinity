const configs = (function () {
	"use strict";

	// settings
	const enableLimit = true; // true or false
	const limit = 20; // integer

	// animation
	const scrollSpeed = 30; // milliseconds (DO NOT PUT BELOW 5, COMPUTER MIGHT CRASH) the lower the value, the faster the scroll
	const pauseBetweenScrolls = 2000; // milliseconds
	const gapBetweenScrolls = "100px"; // px

	// STYLES
	// task list
	const taskListWidth = "400px"; // px
	const taskListHeight = "300px"; // px

	const taskListBackgroundColor = "#000000"; // hex only
	const taskListBackgroundOpacity = 0; // 0.0 - 1.0

	const taskListBorderWidth = "0px"; // px
	const taskListBorderColor = "#ffffff"; // hex or name
	const taskListBorderRadius = "5px"; // px

	const taskListHorizontalPadding = "0px"; // px
	const taskListVerticalPadding = "0px"; // px

	// header
	const headerHorizontalPadding = "10px"; // px
	const headerVerticalPadding = "10px"; // px

	const headerBackgroundColor = "#000000"; // hex only
	const headerBackgroundOpacity = 0.8; // 0.0 - 1.0

	const headerBorderWidth = "2px"; // px
	const headerBorderColor = "#ffffff"; // hex or name
	const headerBorderRadius = "5px"; // px

	const headerFontFamily = "Fredoka"; // font name
	const headerGoogleFont = true; // true: use google font, false: use system font

	const headerFontSize = "25px"; // px
	const headerFontWeight = "bold"; // normal or bold or number

	const headerFontColor = "#ffffff"; // hex or name

	// body
	const bodyBackgroundColor = "#000000"; // hex only
	const bodyBackgroundOpacity = 0; // 0.0 - 1.0

	const bodyBorderWidth = "0px"; // px
	const bodyBorderColor = "#fff"; // hex or name
	const bodyBorderRadius = "5px"; // px

	// task
	const lineHeight = 1.5; // number
	const usernameFontWeight = "bold"; // normal or bold or number
	const usernameColor = "#ffc0cb"; // hex or name or "" for twitch user color

	const taskWidth = "98%";

	const taskBackgroundColor = "#000000"; // hex only
	const taskBackgroundOpacity = 0.7; // 0.0 - 1.0

	const taskFontFamily = "Poppins"; // font name
	const taskGoogleFont = true; // true: use google font, false: use system font

	const taskFontSize = "20px"; // px
	const taskFontColor = "#ffffff"; // hex or name

	const taskBorderColor = "#000000"; // hex or name
	const taskBorderWidth = "0px"; // px
	const taskBorderRadius = "5px"; // px

	const taskMarginBottom = "5px"; // px
	const taskHorizontalPadding = "20px"; // px
	const taskVerticalPadding = "10px"; // px

	// Add task commands - please add commands in the exact format
	const addTaskCommands = [
		"!taska",
		"!taskadd",
		"!atask",
		"!addtask",
		"!task",
		"!add",
		"!todo",
	];

	// Edit task commands - please add commands in the exact format
	const editTaskCommands = [
		"!taske",
		"!taskedit",
		"!etask",
		"!edittask",
		"!edit",
	];

	// Delete task commands - please add commands in the exact format
	const deleteTaskCommands = [
		"!taskd",
		"!taskdel",
		"!taskdelete",
		"!deltask",
		"!deletetask",
		"!taskr",
		"!taskremove",
		"!rtask",
		"!removetask",
		"!remove",
		"!delete",
	];

	// Finish task commands - please add commands in the exact format
	const finishTaskCommands = [
		"!taskf",
		"!taskfinish",
		"!ftask",
		"!finishtask",
		"!taskd",
		"!taskdone",
		"!donetask",
		"!dtask",
		"!finish",
		"!done",
		"!finished",
	];

	// Check task commands - please add commands in the exact format
	const checkCommands = [
		"!taskc",
		"!taskcheck",
		"!ctask",
		"!checktask",
		"!mytask",
		"!check",
	];

	// Clear my done commands - please add commands in the exact format
	const clearMyDoneCommands = ["!clearmydone"];

	// Help commands - please add commands in the exact format
	const helpCommands = [
		"!taskh",
		"!taskhelp",
		"!htask",
		"!helptask",
		"!tasks",
		"!help",
	];

	// Admin delete - please add commands following the exact format
	const adminDeleteCommands = [
		"!taskadel",
		"!adel",
		"!adelete",
		"!admindelete",
	];

	// Admin clear done - please add commands following the exact format
	const adminClearDoneCommands = [
		"!acleardone",
		"!admincleardone",
		"!cleardone",
	];

	const adminClearAllCommands = [
		"!clearall",
		"!allclear",
		"!adminclearall",
		"!adminallclear",
		"!aclearall",
		"!aclear",
		"!clear",
	];

	// Responses
	const taskAdded = 'The task "{message}" has been added, {user}!';
	const noTaskAdded =
		"Looks like you already hit the limit of incomplete tasks, {user}";
	const noTaskContent = "Try using !task the-task-you-are-working-on {user}";
	const taskDeleted = "Task '{task}' has been deleted successfully, {user}";
	const specifyTaskIndex = "Try specifying the index of the task {user}";

	const duplicateTask =
		"Looks like you already have the task '{message}' up there {user}!";

	const adminDeleteTasks = "All of {mentioned}'s tasks have been deleted";
	const taskFinished = "Good job on finishing the task '{task}', {user}!";
	const taskEdited =
		"Task '{originalTask}' has been edited to '{task}' successfully, {user}";
	const noTaskEdit = "Try doing !edit [index] [new task] {user}";

	const noTask = "Looks like you don't have a task up there {user}";
	const noTaskA = "Looks like there is no task from that user there {user}";
	const notMod = "Permission denied, {user}; Mods only";
	const clearedAll = "All tasks have been cleared!";
	const clearedDone = "All completed tasks have been cleared!";
	const clearedMyDone = "All your completed tasks have been cleared!";
	const specifyUser = "Try specifying a user to delete their tasks {user}";
	const help = `{user} Use the following commands to help you out - !task !edit !remove !done. For mods, you can do !adel @user. More commmands here: https://github.com/liyunze-coding/Chat-Task-Tic-Overlay/blob/main/MultiTask.md/`;
	// to edit check task command, go to
	// scripts/taskList.js
	// function checkTasks(username)

	const additionalCommands = {
		"!botcred":
			"{user} Ryan is the creator of this bot! You can find him on https://github.com/liyunze-coding or https://www.twitch.tv/ryanpython",
	};

	const titles = [
		"!taskhelp",
		"!task",
		"!edit",
		"!remove",
		"!done",
		"!botcred",
	];

	const settings = {
		enableLimit,
		limit,
		headerGoogleFont,
		taskGoogleFont,
	};

	const styles = {
		taskListWidth,
		taskListHeight,
		taskListBackgroundColor,
		taskListBackgroundOpacity,
		taskListBorderWidth,
		taskListBorderColor,
		taskListBorderRadius,
		taskListHorizontalPadding,
		taskListVerticalPadding,
		headerHorizontalPadding,
		headerVerticalPadding,
		headerBackgroundColor,
		headerBackgroundOpacity,
		headerBorderWidth,
		headerBorderColor,
		headerBorderRadius,
		headerFontSize,
		headerFontWeight,
		headerFontFamily,
		headerFontColor,
		bodyBackgroundColor,
		bodyBackgroundOpacity,
		bodyBorderWidth,
		bodyBorderColor,
		bodyBorderRadius,
		taskWidth,
		lineHeight,
		usernameFontWeight,
		usernameColor,
		taskBackgroundColor,
		taskBackgroundOpacity,
		taskFontFamily,
		taskFontSize,
		taskFontColor,
		taskBorderColor,
		taskBorderWidth,
		taskBorderRadius,
		taskMarginBottom,
		taskHorizontalPadding,
		taskVerticalPadding,
	};

	const animation = {
		scrollSpeed,
		pauseBetweenScrolls,
		gapBetweenScrolls,
		titles,
	};

	const commands = {
		addTaskCommands,
		editTaskCommands,
		deleteTaskCommands,
		finishTaskCommands,
		helpCommands,
		checkCommands,
		clearMyDoneCommands,
		adminDeleteCommands,
		adminClearDoneCommands,
		adminClearAllCommands,
		additionalCommands,
	};

	const responses = {
		taskAdded,
		noTaskAdded,
		noTaskContent,
		taskDeleted,
		specifyTaskIndex,
		duplicateTask,
		taskFinished,
		taskEdited,
		noTaskEdit,
		noTask,
		noTaskA,
		notMod,
		help,
		adminDeleteTasks,
		clearedMyDone,
		clearedAll,
		clearedDone,
		specifyUser,
	};

	return {
		settings,
		styles,
		animation,
		commands,
		responses,
	};
})();
