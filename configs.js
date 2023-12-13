const configs = (function () {
	"use strict";

	// settings
	const enableLimit = false; // true or false
	const limit = 10; // integer
	const automaticDoneIndex = true; // true or false - Automatically assume first unfinished task is complete
	const pointsName = "points"; // string
	const pointsPerTask = 10; // integer
	const taskSeparator = [";", ","]; // array of strings

	// SETTING THIS 'TRUE' WILL RESET EXISTING TASKS
	const testTasks = true; // true or false

	// animation
	const scrollSpeed = 40; // milliseconds
	const gapBetweenScrolls = 0; // px

	// STYLES
	// task list
	const taskListBackgroundColor = "#000000"; // hex only
	const taskListBackgroundOpacity = 0; // 0.0 - 1.0

	const taskListBorderWidth = "0px"; // px
	const taskListBorderColor = "#ffffff"; // hex or name
	const taskListBorderRadius = "0px"; // px

	const taskListHorizontalPadding = "0px"; // px
	const taskListVerticalPadding = "0px"; // px

	// header
	const headerHorizontalPadding = "10px"; // px
	const headerVerticalPadding = "10px"; // px

	const headerBackgroundColor = "#fff"; // hex only
	const headerBackgroundOpacity = 1; // 0.0 - 1.0

	const headerBorderWidth = "0px"; // px
	const headerBorderColor = "#ffffff"; // hex or name
	const headerBorderRadius = "3px"; // px

	const headerFontFamily = "Fredoka"; // font name
	const headerGoogleFont = true; // true: use google font, false: use system font

	const headerFontSize = "25px"; // px
	const headerFontWeight = "bold"; // normal or bold or number

	const headerFontColor = "#000"; // hex or name

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
	const usernameFontSize = "20px"; // px

	const taskWidth = "100%";

	const taskBackgroundColor = "#000"; // hex only
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

	// done task
	const doneTaskFontColor = "#bbb"; // hex or name

	// focus task
	const focusTaskBackgroundColor = "#fff"; // hex only
	const focusTaskBackgroundOpacity = 1; // 0.0 - 1.0
	const focusTaskBorderRadius = "5px"; // px

	const focusTaskFontColor = "#000"; // hex or name

	const focusTaskHorizontalPadding = "7px"; // px
	const focusTaskVerticalPadding = "0px"; // px

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

	// focus task commands - please add commands in the exact format
	const focusTaskCommands = ["!focus", "!taskfocus", "!focustask"];

	const unfocusTaskCommands = ["!unfocus", "!taskunfocus", "!unfocustask"];

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

	// check count commands - please add commands in the exact format
	const checkCountCommands = [
		"!taskcount",
		"!count",
		"!checkcount",
		"!mycount",
	];

	const checkAllCountCommands = [
		"!taskallcount",
		"!allcount",
		"!checkallcount",
		"!boardcount",
		"!checkboardcount",
		"!taskboardcount",
	];

	const checkMyPointsCommands = [
		"!taskpoints",
		"!points",
		"!mypoints",
		"!checkpoints",
	];

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

	const adminClearTasksCommands = ["!cleartasks"];

	const adminResetBoardCount = ["!resetboardcount", "!resetallcount"];

	const adminResetUsersCount = ["!resetuserscount"];

	const adminClearAllCommands = [
		"!clearall",
		"!allclear",
		"!adminclearall",
		"!adminallclear",
		"!aclearall",
		"!aclear",
	];

	const adminSetBoardCount = ["!setboardcount", "!setallcount"];

	// Responses related to task addition
	const taskAdded = 'The task(s) "{task}" has been added, {user}!';
	const noTaskAdded =
		"Looks like you already hit the limit of incomplete tasks, {user}";
	const noTaskContent = "Try using !task the-task-you-are-working-on {user}";
	const duplicateTask =
		"Looks like you already have the task '{message}' up there {user}!";

	// Responses related to task deletion
	const taskDeleted =
		'Task(s) "{task}" has been deleted successfully, {user}';
	const specifyTaskIndex =
		"Try specifying the index of the incomplete task(s) {user}";
	const clearTasksExceptBroadcaster =
		"All tasks have been cleared except for the streamer's, {user}!";
	const adminDeleteTasks = "All of {mentioned}'s tasks have been deleted";

	// Responses related to task completion
	const taskFinished =
		'Good job on finishing the task(s) "{task}", {user}! You have earned {pointCount} {pointName} and completed {doneCount} task(s) so far!';
	const allTasksFinished =
		"Good job on finishing all your tasks, {user}! You have completed {doneCount} task(s) so far!";
	const taskUnfinished =
		'Task(s) "{task}" has been unmarked as done, {user}!';
	const taskAlreadyFinished =
		"Looks like you already finished that task {user}";

	// Responses related to task editing
	const taskEdited =
		'Task "{originalTask}" has been edited to "{task}" successfully, {user}';
	const noTaskEdit = "Try doing !edit [index] [new task] {user}";

	// Responses related to task focus
	const taskFocused = 'Task "{task}" has been focused, {user}!';
	const clearFocused = "Task has been unfocused, {user}!";
	const noFocusedTask = "Looks like you don't have a focused task {user}!";
	const alreadyFocusedTask =
		"Looks like you already have that task set to focus {user}!";
	const onlyOneFocus = "You can only focus one task at a time {user}!";
	const specifyFocusTask =
		"Try specifying an incomplete task to focus {user}!";

	// Responses related to task existence
	const noTask = "Looks like you don't have a task up there {user}";
	const noTaskA = "Looks like there is no task from that user there {user}";

	// Responses related to viewing counts
	const checkMyPoints = "You have {pointCount} {pointName}, {user}!";
	const checkUserPoints =
		"{mentioned} has {pointCount} {pointName}, {user}!";
	const checkYourCount =
		"You have completed {doneCount} task(s) so far, {user}!";
	const checkUserCount =
		"{mentioned} has completed {doneCount} task(s) so far, {user}!";
	const checkAllCount =
		"Everyone has completed {doneCount} task(s) so far, {user}!";
	const noCountAll = "Looks like no one has completed a task yet {user}";

	// Responses related to permissions
	const notMod = "Permission denied, {user}; Mods only";
	const notStreamer = "Permission denied, {user}; Streamer only";

	// Responses related to clearing tasks / counts
	const clearedAll = "All tasks and counts have been cleared!";
	const clearedTasks = "All tasks have been cleared!";
	const clearedDone = "All completed tasks have been cleared!";
	const clearedMyDone = "All your completed tasks have been cleared!";
	const clearedBoardCount = "The board count has been reset!";
	const clearedUsersCount = "The users count has been reset!";
	const setBoardCount = "The board count has been set to {count}!";
	const specifyUser = "Try specifying a user to delete their tasks {user}";
	const invalidNumber = "Try specifying a valid number {user}";

	// Help response
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
		"!undone",
		"!botcred",
		"!count",
		"!points",
		"!boardcount",
	];

	const settings = {
		enableLimit,
		limit,
		automaticDoneIndex,
		pointsName,
		pointsPerTask,
		taskSeparator,
		headerGoogleFont,
		taskGoogleFont,
		testTasks,
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
		usernameFontSize,
		doneTaskFontColor,
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
		focusTaskBackgroundColor,
		focusTaskBackgroundOpacity,
		focusTaskFontColor,
		focusTaskHorizontalPadding,
		focusTaskVerticalPadding,
		focusTaskBorderRadius,
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
		focusTaskCommands,
		unfocusTaskCommands,
		helpCommands,
		checkCommands,
		listCommands,
		clearMyDoneCommands,
		checkCountCommands,
		checkAllCountCommands,
		checkMyPointsCommands,
		adminDeleteCommands,
		adminClearNotStreamerCommands,
		adminClearDoneCommands,
		adminClearAllCommands,
		adminClearTasksCommands,
		adminSetBoardCount,
		adminResetBoardCount,
		adminResetUsersCount,
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
		taskAlreadyFinished,
		taskEdited,
		noTaskEdit,
		clearFocused,
		noFocusedTask,
		alreadyFocusedTask,
		onlyOneFocus,
		specifyFocusTask,
		taskFocused,
		noTask,
		noTaskA,
		checkMyPoints,
		checkUserPoints,
		checkYourCount,
		checkUserCount,
		checkAllCount,
		noCountAll,
		notMod,
		notStreamer,
		help,
		clearTasksExceptBroadcaster,
		adminDeleteTasks,
		clearedMyDone,
		clearedBoardCount,
		clearedUsersCount,
		clearedAll,
		clearedTasks,
		clearedDone,
		setBoardCount,
		specifyUser,
		invalidNumber,
	};

	return {
		settings,
		styles,
		animation,
		commands,
		responses,
	};
})();
