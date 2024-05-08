const defaultConfigs = (function () {
	"use strict";

	const StreamerUsernames = ["RythonDev"];

	// settings
	const settings = {
		enableLimit: false, // true or false
		limit: 10, // integer
		automaticDoneIndex: false, // true or false - Automatically assume first unfinished task is complete
		taskName: "task", // string (singular)
		pointsName: "points", // string
		pointsPerTask: 10, // integer
		taskSeparator: [";", ",", "|"], // array of strings
		testTasks: false, // true or false
		headerGoogleFont: false, // true: use google font, false: use system font
		taskGoogleFont: false, // true: use google font, false: use system font
		displayTaskCount: true, // true or false
		enableTaskMaster: false, // true or false
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

		taskCountMarginRight: "0px", // px

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
		taskMasterCommands: ["!taskmaster", "!taskchampion"],
		resetTaskMasterCommands: ["!resettaskmaster"],
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
		adminSetBoardCountCommands: ["!setboardcount", "!setallcount"],
		adminResetBoardCountCommands: ["!resetboardcount", "!resetallcount"],
		adminResetUsersCountCommands: ["!resetuserscount"],
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
		taskAdded: 'The {taskName}(s) "{task}" has been added, {user}!',
		noTaskAdded:
			"Looks like you already hit the limit of incomplete {taskName}s, {user}",
		noTaskContent:
			"Try using !task the-{taskName}-you-are-working-on {user}",
		duplicateTask:
			"Looks like you already have the {taskName} '{message}' up there {user}!",
		taskEdited:
			'{taskName} "{originalTask}" has been edited to "{task}" successfully, {user}',
		noTaskEdit: "Try doing !edit [index] [new {taskName}] {user}",
		nowTask: '"{task}" is now the {taskName} you are working on, {user}!',

		// Grouped by task progression responses
		taskNext:
			"Good job on finishing the {taskName} '{oldTask}'! Now moving onto '{newTask}', {user}!",
		nextNoContent:
			"Try using !next the-{taskName}-you-want-to-do-next {user}",
		taskNextFailed:
			"Unable to perform command with multiple incomplete {taskName}s, {user}!",

		// Grouped by task deletion responses
		clearedMyDone:
			"All of your completed {taskName}s have been cleared, {user}!",
		taskDeleted:
			'{taskName}(s) "{task}" has been deleted successfully, {user}',
		specifyTaskIndex:
			"Try specifying the index of the incomplete task(s) {user}",
		clearTasksExceptBroadcaster:
			"All {taskName}s have been cleared except for the streamer's, {user}!",
		adminDeleteTasks: "All of {mentioned}'s {taskName}s have been deleted",
		clearedDone: "All completed {taskName}s have been cleared, {user}!",
		clearedtasks: "All {taskName}s have been cleared, {user}!",
		clearedAll: "All {taskName}s and counts have been cleared, {user}!",
		clearLocalStorage: "Local storage has been cleared, {user}!",

		// Grouped by task completion responses
		taskFinished:
			'Good job on finishing the {taskName}(s) "{task}", {user}! You have earned {pointCount} {pointName} and completed {doneCount} task(s) so far!',
		allTasksFinished:
			"Good job on finishing all your {taskName}s, {user}! You have completed {doneCount} {taskName}(s) so far!",
		taskUnfinished: '"{task}" has been unmarked as done, {user}!',
		taskAlreadyFinished:
			"Looks like you already finished that {taskName} {user}",

		// Grouped by task focus responses
		clearFocused: "{taskName} has been unfocused, {user}!",
		noFocusedTask: "Looks like you don't have a focused {taskName} {user}!",
		alreadyFocusedTask:
			"Looks like you already have that {taskName} set to focus {user}!",
		onlyOneFocus: "You can only focus one {taskName} at a time {user}!",
		specifyFocusTask:
			"Try specifying an incomplete {taskName} to focus {user}!",
		taskFocused: '{taskName} "{task}" has been focused, {user}!',

		// Grouped by task existence responses
		noTask: "Looks like you don't have a {taskName} up there {user}",
		noTaskA:
			"Looks like there is no {taskName} from that user there {user}",

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
		setUserTaskCount: "{mentioned} now has {taskCount} {taskName}s!",

		// Grouped by taskmaster-related responses
		taskMaster: "{user} Task Master: {taskMaster} [{taskMasterCount}]",
		noTaskMaster: "No Task Master yet, {user}!",
		resetTaskMaster: "Task Master has been reset, {user}!",

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
