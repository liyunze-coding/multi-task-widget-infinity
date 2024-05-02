const defaultConfigs = (function () {
	"use strict";

	const StreamerUsernames = ["RythonDev"];

	// settings
	const settings = {
		enableLimit: false, // true or false
		limit: 10, // integer
		automaticDoneIndex: false, // true or false - Automatically assume first unfinished task is complete
		pointsName: "points", // string
		pointsPerTask: 10, // integer
		taskSeparator: [";", ",", "|"], // array of strings
		testTasks: false, // true or false
		headerGoogleFont: false, // true: use google font, false: use system font
		taskGoogleFont: false, // true: use google font, false: use system font
		displayTaskCount: true, // true or false
	};

	// styles
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
		headerVerticalPadding: "20px", // px

		headerBackgroundColor: "#000", // hex only
		headerBackgroundOpacity: 0, // 0.0 - 1.0

		headerBorderWidth: "0px", // px
		headerBorderColor: "#ffffff", // hex or name
		headerBorderRadius: "3px", // px

		headerFontFamily: "monospace", // font name
		headerFontSize: "2rem", // px
		headerFontWeight: "bold", // normal or bold or number
		headerFontColor: "#fff", // hex or name

		taskCountMarginRight: "175px", // px

		// body
		bodyBackgroundColor: "#fff", // hex only
		bodyBackgroundOpacity: 0, // 0.0 - 1.0

		bodyBorderWidth: "0px", // px
		bodyBorderColor: "#fff", // hex or name
		bodyBorderRadius: "5px", // px

		// task
		lineHeight: 1.5, // number
		usernameFontWeight: "bold", // normal or bold or number
		usernameColor: "lime", // hex or name or "" for twitch user color
		usernameFontSize: "1.5rem", // px

		taskWidth: "100%",

		taskBackgroundColor: "#000", // hex only
		taskBackgroundOpacity: 0, // 0.0 - 1.0

		taskFontFamily: "monospace", // font name
		taskFontSize: "1.5rem", // px
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

	// animation
	const animation = {
		scrollSpeed: 50, // px
		gapBetweenScrolls: 50, // px
		titles: [
			"!multitask",
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

	const commands = {
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
		editTaskCommands: [
			"!taske",
			"!taskedit",
			"!etask",
			"!edittask",
			"!edit",
			"!e",
		],
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
		focusTaskCommands: ["!focus", "!taskfocus", "!focustask"],
		unfocusTaskCommands: ["!unfocus", "!taskunfocus", "!unfocustask"],
		nowTaskCommands: ["!now", "!tasknow", "!nowtask"],
		helpCommands: [
			"!taskh",
			"!taskhelp",
			"!htask",
			"!helptask",
			"!tasks",
			"!help",
		],
		checkCommands: [
			"!taskc",
			"!taskcheck",
			"!ctask",
			"!checktask",
			"!mytask",
			"!check",
			"!mytasks",
		],
		listCommands: ["!taskl", "!tasklist", "!listtasks", "!list"],
		clearMyDoneCommands: ["!clearmydone"],
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
		adminDeleteCommands: ["!taskadel", "!adel", "!adelete", "!admindelete"],
		adminClearNotStreamerCommands: [
			"!clearnotstreamer",
			"!aclearnotstreamer",
			"!adminclearnotstreamer",
			"!clearns",
		],
		adminClearDoneCommands: [
			"!acleardone",
			"!admincleardone",
			"!cleardone",
		],
		adminClearAllCommands: ["!clearallnoregrets"],
		adminClearTasksCommands: ["!cleartasks", "!clearalltasks", "!clearall"],
		adminSetBoardCount: ["!setboardcount", "!setallcount"],
		adminResetBoardCount: ["!resetboardcount", "!resetallcount"],
		adminResetUsersCount: ["!resetuserscount"],
		adminBackupCommands: ["!backup", "!backupdata", "!setbackup"],
		adminLoadBackupCommands: [
			"!loadbackup",
			"!loaddata",
			"!loadbackupdata",
		],
		adminClearLocalStorageCommands: ["!clearlocalstorage"],
		additionalCommands: {
			"!botcred":
				"{user} Ryan is the creator of this bot! You can find him on https://github.com/liyunze-coding or https://www.twitch.tv/RythonDev",
			"!multitask":
				"If you want to add the multi-task widget to your stream, you can buy it from ko-fi! https://ko-fi.com/s/94e7e8dc81",
		},
	};

	const responses = {
		// Grouped by task-related responses
		// Grouped by task creation and modification responses
		taskAdded: 'The task(s) "{task}" has been added, {user}!',
		noTaskAdded:
			"Looks like you already hit the limit of incomplete tasks, {user}",
		noTaskContent: "Try using !task the-task-you-are-working-on {user}",
		duplicateTask:
			"Looks like you already have the task '{message}' up there {user}!",
		taskEdited:
			'Task "{originalTask}" has been edited to "{task}" successfully, {user}',
		noTaskEdit: "Try doing !edit [index] [new task] {user}",
		nowTask: 'Task "{task}" is now the task you are working on, {user}!',

		// Grouped by task progression responses
		taskNext:
			"Good job on finishing the task '{oldTask}'! Now moving onto '{newTask}', {user}!",
		nextNoContent: "Try using !next the-task-you-want-to-do-next {user}",
		taskNextFailed:
			"Unable to perform command with multiple incomplete tasks, {user}!",

		// Grouped by task deletion responses
		clearedMyDone: "All of your completed tasks have been cleared, {user}!",
		taskDeleted: 'Task(s) "{task}" has been deleted successfully, {user}',
		specifyTaskIndex:
			"Try specifying the index of the incomplete task(s) {user}",
		clearTasksExceptBroadcaster:
			"All tasks have been cleared except for the streamer's, {user}!",
		adminDeleteTasks: "All of {mentioned}'s tasks have been deleted",
		clearedDone: "All completed tasks have been cleared, {user}!",
		clearedAll: "All tasks and counts have been cleared, {user}!",
		clearLocalStorage: "Local storage has been cleared, {user}!",

		// Grouped by task completion responses
		taskFinished:
			'Good job on finishing the task(s) "{task}", {user}! You have earned {pointCount} {pointName} and completed {doneCount} task(s) so far!',
		allTasksFinished:
			"Good job on finishing all your tasks, {user}! You have completed {doneCount} task(s) so far!",
		taskUnfinished: 'Task(s) "{task}" has been unmarked as done, {user}!',
		taskAlreadyFinished: "Looks like you already finished that task {user}",

		// Grouped by task focus responses
		clearFocused: "Task has been unfocused, {user}!",
		noFocusedTask: "Looks like you don't have a focused task {user}!",
		alreadyFocusedTask:
			"Looks like you already have that task set to focus {user}!",
		onlyOneFocus: "You can only focus one task at a time {user}!",
		specifyFocusTask: "Try specifying an incomplete task to focus {user}!",
		taskFocused: 'Task "{task}" has been focused, {user}!',

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
			"You have completed {doneCount} task(s) so far, {user}!",
		checkUserCount:
			"{mentioned} has completed {doneCount} task(s) so far, {user}!",
		checkAllCount:
			"Everyone has completed {doneCount} task(s) so far, {user}!",
		noCountAll: "Looks like no one has completed a task yet {user}",
		leaderboard: "Leaderboard: {leaderboard}",
		setUserTaskCount: "{mentioned} now has {taskCount} tasks!",

		// backup-related responses
		backupStorage: "Data has been backed up, {user}!",
		loadBackup: "Data has been loaded, {user}!",

		// Grouped by permission-related responses
		notMod: "Permission denied, {user}; Mods only",
		notStreamer: "Permission denied, {user}; Streamer only",

		// Grouped by help-related responses
		twitchHelp: `{user} Use the following commands to help you out - !task !edit !remove !done. For mods, you can do !adel @user. More commmands here: https://github.com/liyunze-coding/Chat-Task-Tic-Overlay/blob/main/MultiTask.md/`,
		YTHelp: `{user} https://github.com/liyunze-coding/Chat-Task-Tic-Overlay/blob/main/MultiTask.md/`,

		// to edit check task command, go to
		// scripts/taskList.js
		// function checkTasks(username)
	};

	return {
		StreamerUsernames,
		settings,
		styles,
		animation,
		commands,
		responses,
	};
})();
