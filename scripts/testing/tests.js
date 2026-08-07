function randomTasks(num) {
	let tasks = [];
	for (let i = 0; i < num; i++) {
		tasks.push(`task ${i + 1}`);
	}

	return tasks.join(", ");
}

async function tests() {
	let listOfStreamers = [
		`followRythonDev1`,
		`followRythonDev2`,
		`followRythonDev3`,
		`followRythonDev4`,
		`followRythonDev5`,
		`followRythonDev6`,
		`followRythonDev7`,
	];

	for (let i = 0; i < listOfStreamers.length; i++) {
		let randomNum = Math.floor(Math.random() * 10) + 1;

		addTask(listOfStreamers[i], "#ffc0cb", randomTasks(randomNum));
		await sleep(1000);
	}
}
