/*
DB structure:

- tasks
    - [username]:
		- todos (array)
            - [{text, done, focus}, {text, done, focus}]
		- userColor
- counts
	- users
		- [username]:
			- completeCount
			- points
	- totalCompleteCount

- taskmaster
	- users
		- [username]:
			- taskMasterCompleteCount
	- startDate
*/

let taskListMemory = {
	doneTaskCount: 0,
	totalTaskCount: 0,
};

const DBHandler = {
	db: null,
	open: function () {
		return new Promise((resolve, reject) => {
			let request = indexedDB.open("tasksDB", 1);

			request.onupgradeneeded = function (e) {
				let db = e.target.result;
				if (!db.objectStoreNames.contains("tasks")) {
					db.createObjectStore("tasks", { autoIncrement: true });
				}
			};

			request.onsuccess = function (e) {
				DBHandler.db = e.target.result;
				resolve();
			};

			request.onerror = function (e) {
				console.log("Error opening db", e);
				reject(e);
			};
		});
	},
	get: function (key) {
		return new Promise((resolve, reject) => {
			let transaction = DBHandler.db.transaction(["tasks"], "readonly");
			let store = transaction.objectStore("tasks");
			let request = store.get(key);

			request.onsuccess = function (e) {
				resolve(e.target.result);
			};

			request.onerror = function (e) {
				reject("Error getting item", e);
			};
		});
	},
	set: function (key, value) {
		return new Promise((resolve, reject) => {
			let transaction = DBHandler.db.transaction(["tasks"], "readwrite");
			let store = transaction.objectStore("tasks");
			let request = store.put(value, key);

			request.onsuccess = function (e) {
				resolve(e.target.result);
			};

			request.onerror = function (e) {
				reject("Error setting item", e);
			};
		});
	},
	remove: function (key) {
		return new Promise((resolve, reject) => {
			let transaction = DBHandler.db.transaction(["tasks"], "readwrite");
			let store = transaction.objectStore("tasks");
			let request = store.delete(key);

			request.onsuccess = function (e) {
				resolve(e.target.result);
			};

			request.onerror = function (e) {
				reject("Error removing item", e);
			};
		});
	},
	clear: function () {
		return new Promise((resolve, reject) => {
			let transaction = DBHandler.db.transaction(["tasks"], "readwrite");
			let store = transaction.objectStore("tasks");
			let request = store.clear();

			request.onsuccess = function (e) {
				resolve(e.target.result);
			};

			request.onerror = function (e) {
				reject("Error clearing store", e);
			};
		});
	},
};

async function transferLocalStorageToIndexedDB() {
	let keys = Object.keys(localStorage);

	for (let key of keys) {
		let value = JSON.parse(localStorage.getItem(key));
		await DBHandler.set(key, value);
	}

	console.log("Transfer complete");

	await renderTaskListToDOM();
}

function clearLocalStorage() {
	localStorage.removeItem("tasks");
	localStorage.removeItem("counts");
}

async function resetDB() {
	await DBHandler.clear();
	await setupDB();
}

async function setupDB() {
	const keys = ["tasks", "counts", "taskmaster"];
	const defaultValues = [
		{},
		{ users: {} },
		{
			users: {},
			startDate: new Date(),
			taskMasterCompleteCount: 0,
		},
	];

	for (let i = 0; i < keys.length; i++) {
		let value = await DBHandler.get(keys[i]);
		if (!value) {
			value = defaultValues[i];
		}
		await DBHandler.set(keys[i], value);
	}

	return;
}

function clearMemory() {
	taskListMemory = {
		doneTaskCount: 0,
		totalTaskCount: 0,
	};
}
