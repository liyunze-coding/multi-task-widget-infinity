async function loadDataToDB(data) {
	await DBHandler.clear();

	console.log(data);
	// Check if data[0] or data[1] has "users" property
	if (data[0].users) {
		await DBHandler.set("counts", data[0]);
		await DBHandler.set("tasks", data[1]);
	} else {
		await DBHandler.set("counts", data[1]);
		await DBHandler.set("tasks", data[0]);
	}
	await renderTaskListToDOM();
	respond(getResponse("loadBackup"), params);
}

async function backupStorage() {
	// parse timestamp to year-month-day-hour-minute
	let date = new Date();
	let year = date.getFullYear();
	let month = date.getMonth() + 1;
	let day = date.getDate();
	let hour = date.getHours();
	let minute = date.getMinutes();

	// create a string with the date and time
	let dateString = `${year}-${month}-${day}-${hour}-${minute}`;

	// open a connection to the IndexedDB database
	let dbRequest = indexedDB.open("tasksDB");
	let db;

	dbRequest.onsuccess = function (event) {
		db = event.target.result;

		// create a transaction
		let transaction = db.transaction(["tasks"], "readonly");

		// get the data from the object store
		let objectStore = transaction.objectStore("tasks");
		let request = objectStore.getAll();

		request.onsuccess = async function (event) {
			// convert the data to JSON
			let backup = JSON.stringify(request.result);
			// console.log(request.result);

			const backupResponse = await client.doAction(
				"8a19c6f9-419f-4486-a4e8-e222799cfd9d",
				{
					LOCALSTORAGE: backup,
					TIMESTAMP: dateString,
				}
			);

			console.log(backupResponse);
		};
	};
}

async function loadBackup(filename) {
	// console.log(filename);
	const loadBackupResponse = await client.doAction(
		"ad1f5ad6-e604-4f21-bace-c6d8953e1619",
		{
			FILENAME: filename,
		}
	);
	// console.log(loadBackupResponse);
}
