const configs = (function () {
	"use strict";

	const settings = {
		replyInChat: true, // true or false
		enableLimit: false, // true or false
		limit: 10, // integer
		automaticDoneIndex: false, // true or false - Automatically assume first unfinished task is complete
		taskName: "task", // string (singular)
		pointsName: "points", // string
		pointsPerTask: 10, // integer
		taskSeparator: [";", ","], // array of strings
		openQuote: '"', // string
		closeQuote: '"', // string
		testTasks: false, // true or false
		headerGoogleFont: true, // true: use google font, false: use system font
		taskGoogleFont: true, // true: use google font, false: use system font
		displayTaskCount: true, // true or false
		enableTaskMaster: true, // true or false
		hideWhenNoTasks: false, // true or false
		taskCharacterLimit: 15, // integer
		taskCharacterLimitEnabled: false, // true or false
	};

	const animation = {
		scrollSpeed: 40, // milliseconds
		gapBetweenScrolls: 0, // px
		titles: [
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
		],
	};

	const styles = {
		// task list
		taskListBackgroundColor: "#000000", // hex only
		taskListBackgroundOpacity: 0, // 0.0 - 1.0

		taskListBorderWidth: "0px", // px
		taskListBorderColor: "#ffffff", // hex or name
		taskListBorderRadius: "0px", // px

		taskListHorizontalPadding: "0px", // px
		taskListVerticalPadding: "0px", // px

		// header
		headerHorizontalPadding: "10px", // px
		headerVerticalPadding: "10px", // px

		headerBackgroundColor: "#000", // hex only
		headerBackgroundOpacity: 0.9, // 0.0 - 1.0

		headerBorderWidth: "0px", // px
		headerBorderColor: "#ffffff", // hex or name
		headerBorderRadius: "10px", // px

		headerFontFamily: "Fredoka", // font name

		headerFontSize: "25px", // px
		headerFontWeight: "bold", // normal or bold or number

		headerFontColor: "#fff", // hex or name

		// body
		bodyBackgroundColor: "#fff", // hex only
		bodyBackgroundOpacity: 0, // 0.0 - 1.0

		bodyBorderWidth: "0px", // px
		bodyBorderColor: "#fff", // hex or name
		bodyBorderRadius: "5px", // px

		bodyMarginTop: "1px", // px

		// task
		numberOfLines: 2, // number
		lineHeight: 1.5, // number
		usernameFontWeight: "bold", // normal or bold or number
		usernameColor: "white", // hex or name or "" for twitch user color
		usernameFontSize: "20px", // px

		taskWidth: "100%",

		taskBackgroundColor: "#000", // hex only
		taskBackgroundOpacity: 0.8, // 0.0 - 1.0

		taskFontFamily: "Poppins", // font name

		taskFontSize: "20px", // px
		taskFontColor: "#fff", // hex or name

		taskBorderColor: "#fff", // hex or name
		taskBorderWidth: "0px", // px
		taskBorderRadius: "10px", // px

		taskMarginBottom: "10px", // px
		taskHorizontalPadding: "20px", // px
		taskVerticalPadding: "10px", // px

		// done task
		doneTaskFontColor: "#bbb", // hex or name

		// focus task
		focusTaskBackgroundColor: "#fff", // hex only
		focusTaskBackgroundOpacity: 1, // 0.0 - 1.0
		focusTaskBorderRadius: "5px", // px

		focusTaskFontColor: "#000", // hex or name

		focusTaskHorizontalPadding: "7px", // px
		focusTaskVerticalPadding: "0px", // px
	};

	// STYLES

	const commands = {
		// Add task commands - please add commands in the exact format
		addTaskCommands: [
			"!taska",
			"!taskadd",
			"!atask",
			"!addtask",
			"!task",
			"!add",
			"!todo",
			"!a",
		],

		// Edit task commands - please add commands in the exact format
		editTaskCommands: [
			"!taske",
			"!taskedit",
			"!etask",
			"!edittask",
			"!edit",
			"!e",
		],

		// Delete task commands - please add commands in the exact format
		deleteTaskCommands: [
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
		],

		// Finish task commands - please add commands in the exact format
		finishTaskCommands: [
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
		],

		// Unfinish task commands - please add commands in the exact format
		unfinishTaskCommands: [
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
		],

		nextTaskCommands: [
			"!taskn",
			"!tasknext",
			"!ntask",
			"!nexttask",
			"!next",
			"!n",
		],
		logTaskCommands: ["!log", "!tasklog", "!logtask", "!logtasks"],

		// focus task commands - please add commands in the exact format
		focusTaskCommands: ["!focus", "!taskfocus", "!focustask"],
		focusedTaskCommands: ["!focused", "!ongoing", "!checkfocus"],
		unfocusTaskCommands: ["!unfocus", "!taskunfocus", "!unfocustask"],

		nowTaskCommands: ["!now", "!tasknow", "!nowtask"],

		// Check task commands - please add commands in the exact format
		checkCommands: [
			"!taskc",
			"!taskcheck",
			"!ctask",
			"!checktask",
			"!mytask",
			"!check",
			"!mytasks",
			"!c",
		],

		checkCompletedCommands: [
			"!completed",
			"!taskcompleted",
			"!donetasks",
			"!completedtasks",
		],

		// List tasks commands - please add commands in the exact format
		listCommands: ["!taskl", "!tasklist", "!listtasks", "!list"],

		// Clear my done commands - please add commands in the exact format
		clearMyDoneCommands: ["!clearmydone"],

		// check count commands - please add commands in the exact format
		checkCountCommands: ["!taskcount", "!count", "!checkcount", "!mycount"],

		checkAllCountCommands: [
			"!taskallcount",
			"!allcount",
			"!checkallcount",
			"!boardcount",
			"!checkboardcount",
			"!taskboardcount",
		],

		checkMyPointsCommands: [
			"!taskpoints",
			"!points",
			"!mypoints",
			"!checkpoints",
		],

		// sync points with count commands - please add commands in the exact format
		syncCountPointsCommands: ["!syncpoints", "!synccount"],

		addPointsCommands: ["!addpoints", "!givepoints", "!adduserpoints"],

		reducePointsCommands: ["!reducepoints", "!takepoints"],

		setUserPointsCommands: [
			"!setuserpoints",
			"!setpoints",
			"!setpointsuser",
			"!setuserpoint",
		],

		setUserTaskCountCommands: [
			"!setusertaskcount",
			"!settaskcount",
			"!settaskcountuser",
			"!setusertask",
		],

		leaderboardCommands: ["!leaderboard", "!lb", "!top", "!toppoints"],

		taskMasterCommands: ["!taskmaster", "!taskchampion"],

		resetTaskMasterCommands: ["!resettaskmaster"],

		// Help commands - please add commands in the exact format
		helpCommands: [
			"!taskh",
			"!taskhelp",
			"!htask",
			"!helptask",
			"!tasks",
			"!help",
		],

		// Admin clear all except streamer - please add commands following the exact format
		adminClearNotStreamerCommands: [
			"!clearnotstreamer",
			"!aclearnotstreamer",
			"!adminclearnotstreamer",
			"!clearns",
		],

		// Admin delete - please add commands following the exact format
		adminDeleteCommands: ["!taskadel", "!adel", "!adelete", "!admindelete"],

		// Admin clear done - please add commands following the exact format
		adminClearDoneCommands: [
			"!acleardone",
			"!admincleardone",
			"!cleardone",
		],

		adminClearTasksCommands: ["!cleartasks"],

		adminResetBoardCountCommands: ["!resetboardcount", "!resetallcount"],

		adminResetUsersCountCommands: ["!resetuserscount"],

		adminClearAllCommands: ["!clearallnoregrets"],

		adminSetBoardCountCommands: ["!setboardcount", "!setallcount"],
		additionalCommands: {
			"!botcred":
				"{user} Ryan is the creator of this bot! You can find him on https://github.com/liyunze-coding or https://www.twitch.tv/RythonDev",
		},
	};

	const responses = {
		// Responses related to task addition
		taskAdded: "The {taskName}(s) {task} has been added, {user}!",
		noTaskAdded:
			"Looks like you already hit the limit of incomplete {taskName}s, {user}",
		noTaskContent:
			"Try using !task the-{taskName}-you-are-working-on {user}",
		duplicateTask:
			"Looks like you already have the {taskName} {task} up there {user}!",
		taskEdited:
			"{taskName} {originalTask} has been edited to {task} successfully, {user}",
		noTaskEdit: "Try doing !edit [index] [new task] {user}",
		nowTask:
			"{taskName} {task} is now the task you are working on, {user}!",
		taskLogged: "Task(s) {task} has been logged, {user}!",
		taskAlreadyCompleted:
			"Looks like you already completed that {taskName} {task} up there {user}!",

		// Grouped by task progression responses
		taskNext:
			"Good job on finishing the task {oldTask}! Now moving onto {newTask}, {user}!",
		nextNoContent: "Try using !next the-task-you-want-to-do-next {user}",
		taskNextFailed:
			"Unable to perform command with multiple incomplete {taskName}s, {user}!",

		// Grouped by task deletion responses
		clearedMyDone:
			"All of your completed {taskName}s have been cleared, {user}!",
		taskDeleted:
			"{taskName}(s) {task} has been deleted successfully, {user}",
		specifyTaskIndex:
			"Try specifying the index of the incomplete {taskName}(s) {user}",
		clearTasksExceptBroadcaster:
			"All {taskName}s have been cleared except for the streamer's, {user}!",
		clearedTasks: "All {taskName}s have been cleared, {user}!",
		adminDeleteTasks: "All of {mentioned}'s {taskName}s have been deleted",
		clearedAll: "All {taskName}s and points have been cleared, {user}!",

		// Grouped by task completion responses
		taskFinished:
			"Good job on finishing the {taskName}(s) {task}, {user}! You have earned {pointCount} {pointName} and completed {doneCount} {taskName}(s) so far!",
		allTasksFinished:
			"Good job on finishing all your {taskName}s, {user}! You have completed {doneCount} {taskName}(s) so far!",
		taskUnfinished:
			"{taskName}(s) {task} has been unmarked as done, {user}!",
		taskAlreadyFinished:
			"Looks like you already finished that {taskName} {user}",

		// Grouped by task focus responses
		clearFocused: "{taskName} has been unfocused, {user}!",
		noFocusedTask: "Looks like you don't have a focused {taskName} {user}!",
		alreadyFocusedTask:
			"Looks like you already have that task set to focus {user}!",
		onlyOneFocus: "You can only focus one task at a time {user}!",
		specifyFocusTask:
			"Try specifying an incomplete {taskName} to focus {user}!",
		taskFocused: "Task {task} has been focused, {user}!",
		focusedTask: "{user} Focused {taskName}: {task}",

		// Grouped by task existence responses
		noTask: "Looks like you don't have a task up there {user}",
		noTaskA: "Looks like there is no task from that user there {user}",

		// Grouped by point-related responses
		checkMyPoints: "You have {pointCount} {pointName}, {user}!",
		checkUserPoints: "{mentioned} has {pointCount} {pointName}, {user}!",
		syncCountPoints: "Points have been synced with count, {user}!",
		addPoints: "{mentioned} has been given {pointCount} {pointName}!",
		reducePoints: "{mentioned} has lost {pointCount} {pointName}!",
		setUserPoints: "{mentioned} now has {pointCount} {pointName}!",
		specifyPoints: "Try specifying a number of points {user}",

		// Grouped by count-related responses
		checkYourCount:
			"You have completed {doneCount} {taskName}(s) so far, {user}!",
		checkUserCount:
			"{mentioned} has completed {doneCount} {taskName}(s) so far, {user}!",
		checkAllCount:
			"Everyone has completed {doneCount} {taskName}(s) so far, {user}!",
		noCountAll: "Looks like no one has completed a {taskName} yet {user}",
		leaderboard: "Leaderboard: {leaderboard}",
		setUserTaskCount: "{mentioned} now has {taskCount} tasks!",

		// Grouped by taskmaster-related responses
		taskMaster: "{user} Task Master: {taskMaster} [{taskMasterCount}]",
		noTaskMaster: "No task master yet, {user}!",
		resetTaskMaster: "Task Master has been reset, {user}!",

		// Grouped by permission-related responses
		notMod: "Permission denied, {user}; Mods only",
		notStreamer: "Permission denied, {user}; Streamer only",

		// Help response
		help: `{user} Use the following commands to help you out - !task !edit !remove !done. For mods, you can do !adel @user. More commmands here: https://github.com/liyunze-coding/Chat-Task-Tic-Overlay/blob/main/MultiTask.md/`,

		"chat-task-tic":
			"Chat-Task-Tic widget is a free and open source task widget developed by @RythonDev ! https://github.com/liyunze-coding/chat-task-tic-overlay-infinity",
		multitask:
			"If you want to add the multi-task widget to your stream, you can buy it from ko-fi! https://ko-fi.com/s/94e7e8dc81",
		// to edit check task command, go to
		// scripts/taskList.js
		// function checkTasks(username)
	};

	return {
		settings,
		styles,
		animation,
		commands,
		responses,
	};
})();
