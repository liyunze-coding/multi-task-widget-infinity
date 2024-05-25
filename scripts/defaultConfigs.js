const defaultConfigs = (function () {
	"use strict";

	const settings = {
		streamer: "RythonDev",
		testTasks: false, // true or false
		headerGoogleFont: true, // true: use google font, false: use system font
		taskGoogleFont: true, // true: use google font, false: use system font
		showStreamersTasksOnly: true, // true or false
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

		headerBackgroundColor: "#fff", // hex only
		headerBackgroundOpacity: 1, // 0.0 - 1.0

		headerBorderWidth: "0px", // px
		headerBorderColor: "#ffffff", // hex or name
		headerBorderRadius: "3px", // px

		headerFontFamily: "Fredoka", // font name

		headerFontSize: "25px", // px
		headerFontWeight: "bold", // normal or bold or number

		headerFontColor: "#000", // hex or name

		// body
		bodyBackgroundColor: "#fff", // hex only
		bodyBackgroundOpacity: 0, // 0.0 - 1.0

		bodyBorderWidth: "0px", // px
		bodyBorderColor: "#fff", // hex or name
		bodyBorderRadius: "5px", // px

		// task
		lineHeight: 1.5, // number
		usernameFontWeight: "bold", // normal or bold or number
		usernameColor: "pink", // hex or name or "" for twitch user color
		usernameFontSize: "20px", // px

		taskWidth: "100%",

		taskBackgroundColor: "#000", // hex only
		taskBackgroundOpacity: 0, // 0.0 - 1.0

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

	return {
		settings,
		styles,
		animation,
	};
})();
