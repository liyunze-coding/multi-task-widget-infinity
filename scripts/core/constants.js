const STATUS = Object.freeze({
	ERROR: 0,
	INVALID_INPUT: 1,
	ALREADY_COMPLETED: 2,
	SUCCESS: 200,
});

const DB_CONFIG = Object.freeze({
	NAME: "tasksDB",
	VERSION: 1,
	STORE: "tasks",
	KEY_TASKS: "tasks",
	KEY_COUNTS: "counts",
	KEY_TASKMASTER: "taskmaster",
});

const PAGINATION = Object.freeze({
	SIZE: 10,
	SLEEP_MS: 200,
});

const ANIMATION = Object.freeze({
	TITLE_FADE_IN_MS: 500,
	TITLE_FADE_OUT_MS: 100,
	TITLE_CYCLE_INTERVAL_MS: 8000,
});

const TEST_CONFIG = Object.freeze({
	RANDOM_TASK_MAX: 10,
	TASK_DELAY_MS: 1000,
	USER_COUNT: 7,
	RANDOM_TASK_COUNT_MIN: 1,
	RANDOM_TASK_COUNT_MAX: 5,
});

const RESERVED_KEYS = Object.freeze({
	ID: "id",
});
