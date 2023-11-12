const configs = (function () {
	"use strict";

	// settings
	const enableLimit = false; // true or false
	const limit = 10; // integer

	const modifyLocalStorage = true; // true or false
	const showOnlyStreamerTasks = false; // true or false

	// animation
	const scrollSpeed = 40; // milliseconds
	const gapBetweenScrolls = 0; // px

	// STYLES
	// task list
	const taskListBackgroundColor = "#000000"; // hex only
	const taskListBackgroundOpacity = 1; // 0.0 - 1.0

	const taskListBorderWidth = "0px"; // px
	const taskListBorderColor = "#ffffff"; // hex or name
	const taskListBorderRadius = "0px"; // px

	const taskListHorizontalPadding = "0px"; // px
	const taskListVerticalPadding = "0px"; // px

	// header
	const headerHorizontalPadding = "10px"; // px
	const headerVerticalPadding = "10px"; // px

	const headerBackgroundColor = "#000"; // hex only
	const headerBackgroundOpacity = 1; // 0.0 - 1.0

	const headerBorderWidth = "2px"; // px
	const headerBorderColor = "#ffffff"; // hex or name
	const headerBorderRadius = "3px"; // px

	const headerFontFamily = "Fredoka"; // font name
	const headerGoogleFont = true; // true: use google font, false: use system font

	const headerFontSize = "25px"; // px
	const headerFontWeight = "bold"; // normal or bold or number

	const headerFontColor = "#fff"; // hex or name

	// body
	const bodyBackgroundColor = "#fff"; // hex only
	const bodyBackgroundOpacity = 0; // 0.0 - 1.0

	const bodyBorderWidth = "0px"; // px
	const bodyBorderColor = "#fff"; // hex or name
	const bodyBorderRadius = "5px"; // px

	// task
	const lineHeight = 1.5; // number
	const usernameFontWeight = "bold"; // normal or bold or number
	const usernameColor = "pink"; // hex or name or "" for twitch user color

	const taskWidth = "100%";

	const taskBackgroundColor = "#fff"; // hex only
	const taskBackgroundOpacity = 0; // 0.0 - 1.0

	const taskFontFamily = "Poppins"; // font name
	const taskGoogleFont = true; // true: use google font, false: use system font

	const taskFontSize = "20px"; // px
	const taskFontColor = "#fff"; // hex or name

	const taskBorderColor = "#fff"; // hex or name
	const taskBorderWidth = "0px"; // px
	const taskBorderRadius = "10px"; // px

	const taskMarginBottom = "10px"; // px
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
		"!a",
	];

	// Edit task commands - please add commands in the exact format
	const editTaskCommands = [
		"!taske",
		"!taskedit",
		"!etask",
		"!edittask",
		"!edit",
		"!e",
	];

	// Delete task commands - please add commands in the exact format
	const deleteTaskCommands = [
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
		"!r",
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
		"!f",
	];

	// Unfinish task commands - please add commands in the exact format
	const unfinishTaskCommands = [
		"!tasku",
		"!taskunfinish",
		"!utask",
		"!unfinishtask",
		"!taskud",
		"!taskundone",
		"!undonetask",
		"!undone",
		"!unfinish",
		"!unfinished",
		"!u",
	];

	// Check task commands - please add commands in the exact format
	const checkCommands = [
		"!taskc",
		"!taskcheck",
		"!ctask",
		"!checktask",
		"!mytask",
		"!check",
		"!mytasks",
	];

	// List tasks commands - please add commands in the exact format
	const listCommands = ["!taskl", "!tasklist", "!listtasks", "!list"];

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

	// Admin clear all except streamer - please add commands following the exact format
	const adminClearNotStreamerCommands = [
		"!clearnotstreamer",
		"!aclearnotstreamer",
		"!adminclearnotstreamer",
		"!clearns",
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
	];

	// Responses
	const taskAdded = 'The task(s) "{task}" has been added, {user}!';
	const noTaskAdded =
		"Looks like you already hit the limit of incomplete tasks, {user}";
	const noTaskContent = "Try using !task the-task-you-are-working-on {user}";
	const taskDeleted =
		'Task(s) "{task}" has been deleted successfully, {user}';
	const specifyTaskIndex = "Try specifying the index of the task {user}";

	const duplicateTask =
		"Looks like you already have the task '{message}' up there {user}!";

	const clearTasksExceptBroadcaster =
		"All tasks have been cleared except for the streamer's, {user}!";

	const adminDeleteTasks = "All of {mentioned}'s tasks have been deleted";
	const taskFinished = 'Good job on finishing the task "{task}", {user}!';
	const allTasksFinished = "Good job on finishing all your tasks, {user}!";
	const taskUnfinished =
		'Task(s) "{task}" has been unmarked as done, {user}!';
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
			"{user} Ryan is the creator of this bot! You can find him on https://github.com/liyunze-coding or https://www.twitch.tv/RythonDev",
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
		modifyLocalStorage,
		showOnlyStreamerTasks,
	};

	const styles = {
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
		gapBetweenScrolls,
		titles,
	};

	const commands = {
		addTaskCommands,
		editTaskCommands,
		deleteTaskCommands,
		finishTaskCommands,
		unfinishTaskCommands,
		helpCommands,
		checkCommands,
		listCommands,
		clearMyDoneCommands,
		adminDeleteCommands,
		adminClearNotStreamerCommands,
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
		allTasksFinished,
		taskUnfinished,
		taskEdited,
		noTaskEdit,
		noTask,
		noTaskA,
		notMod,
		help,
		clearTasksExceptBroadcaster,
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
