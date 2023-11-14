const configs = (function () {
	"use strict";

	// settings
	const enableLimit = false; // true or false
	const limit = 10; // integer

	const modifyLocalStorage = false; // true or false
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

	return {
		settings,
		styles,
		animation,
	};
})();
