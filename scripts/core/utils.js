function isInt(value) {
	return (
		!isNaN(value) &&
		parseInt(Number(value)) === value &&
		!isNaN(parseInt(value, 10))
	);
}

function createErrorResponse(errorMessage, errorType, status = 0) {
	return {
		status: status,
		body: {
			"error message": errorMessage,
			error: errorType,
		},
	};
}

function sleep(ms) {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Converts a camelCase string to a CSS variable format.
 *
 * @param {string} name - The camelCase string to convert.
 * @returns {string} The converted string in CSS variable format.
 */
function convertToCSSVar(name) {
	let cssVar = name.replace(/([A-Z])/g, "-$1").toLowerCase();
	return `--${cssVar}`;
}

/**
 * Converts a hexadecimal color value to its RGB equivalent.
 *
 * @param {string} hex - The hexadecimal color value. Can be 3 or 6 digits, with or without a leading '#'.
 * @returns {string} The RGB color value as a string in the format 'r, g, b'.
 */
function hexToRgb(hex) {
	// remove # if present
	if (hex[0] === "#") {
		hex = hex.slice(1);
	}

	let r = 0,
		g = 0,
		b = 0;

	if (hex.length == 3) {
		// 3 digits
		r = "0x" + hex[0] + hex[0];
		g = "0x" + hex[1] + hex[1];
		b = "0x" + hex[2] + hex[2];
	} else if (hex.length == 6) {
		// 6 digits
		r = "0x" + hex[0] + hex[1];
		g = "0x" + hex[2] + hex[3];
		b = "0x" + hex[4] + hex[5];
	}

	// integer value of rgb
	r = +r;
	g = +g;
	b = +b;

	return `${r}, ${g}, ${b}`;
}
