const styles = configs.styles;
const scrollSpeed = configs.animation.scrollSpeed;
let openQuote = getSetting("openQuote");
let closeQuote = getSetting("closeQuote");
let visible = false;
let scrolling = false;
let primaryAnimation, secondaryAnimation;
const taskSeparator = getSetting("taskSeparator");

DBHandler.open()
	.then(async () => {
		await setupDB();
		importStyles();
		if (getSetting("testTasks")) {
			await resetDB();
			await tests();
		}

		await renderTaskListToDOM();
	})
	.catch((error) => {
		console.error("Error opening database:", error);
	});
