function loadGoogleFont(font) {
	WebFont.load({
		google: {
			families: [font],
		},
	});
}

/**
 * import styles from configs
 */
function importStyles() {
	const styles = configs.styles;

	// fonts
	if (getSetting("headerGoogleFont")) {
		loadGoogleFont(styles.headerFontFamily);
	}
	if (getSetting("taskGoogleFont")) {
		loadGoogleFont(styles.taskFontFamily);
	}

	document.documentElement.style.setProperty(
		"--gap-between-scrolls",
		`${configs.animation.gapBetweenScrolls}px` ?? "0px"
	);

	const stylesToImport = Object.keys(styles).filter((style) => {
		return !style.includes("Background");
	});

	stylesToImport.forEach((style) => {
		document.documentElement.style.setProperty(
			convertToCSSVar(style),
			styles[style]
		);
	});

	let backgroundStyles = Object.keys(styles).filter((style) => {
		return style.includes("Background");
	});

	// use regex to filter out after "Background"
	backgroundStyles = backgroundStyles.map((style) => {
		return style.replace(/Background.*/, "");
	});

	// loop through backgroundstyles
	backgroundStyles.forEach((style) => {
		// get background color and opacity
		let backgroundColor = styles[`${style}BackgroundColor`];
		let backgroundOpacity = styles[`${style}BackgroundOpacity`];

		let cssStyle = convertToCSSVar(style);

		// set background color
		document.documentElement.style.setProperty(
			`${cssStyle}-background-color`,
			`rgba(${hexToRgb(backgroundColor)}, ${backgroundOpacity})`
		);
	});

	if (!getSetting("displayTaskCount")) {
		document.querySelector(".task-count").style.display = "none";
	}

	let currentTitle = 0;
	// interval the task title
	setInterval(async () => {
		let taskTitle = document.querySelector(".title");

		// cycle through a list of titles
		let titles = configs.animation.titles;

		// if current title is the last title, set it to the first title
		if (currentTitle === titles.length - 1) {
			currentTitle = 0;
		} else {
			currentTitle++;
		}

		// on change title, add fade animation
		taskTitle.classList.add("fade");
		await sleep(500);

		// set new title
		taskTitle.innerText = titles[currentTitle];

		await sleep(100);

		// remove fade animation
		taskTitle.classList.remove("fade");
	}, 8000);
}
