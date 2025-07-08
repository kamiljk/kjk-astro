const fs = require("fs");
const path = require("path");

// Define the directory to scan and the tokens file
const stylesDir = path.join(__dirname, "../src");
const tokensFile = path.join(__dirname, "../public/styles/tokens.css");

// Load tokens
const tokens = fs.readFileSync(tokensFile, "utf-8");
const tokenRegex = /--[a-zA-Z0-9-]+/g;
const tokenList = tokens.match(tokenRegex) || [];

// Function to validate a CSS file
function validateCSS(filePath) {
	const content = fs.readFileSync(filePath, "utf-8");
	const hardcodedValues = [];

	// Check for hardcoded values (e.g., colors, spacing, etc.)
	const lines = content.split("\n");
	lines.forEach((line, index) => {
		if (
			!line.includes("var(--") &&
			/#[0-9A-Fa-f]{3,6}|\d+px|\d+rem|\d+em/.test(line)
		) {
			hardcodedValues.push({ line: index + 1, content: line.trim() });
		}
	});

	return hardcodedValues;
}

// Recursively scan the styles directory
function scanDirectory(dir) {
	const results = [];
	const files = fs.readdirSync(dir);

	files.forEach((file) => {
		const filePath = path.join(dir, file);
		const stat = fs.statSync(filePath);

		if (stat.isDirectory()) {
			results.push(...scanDirectory(filePath));
		} else if (file.endsWith(".css")) {
			const issues = validateCSS(filePath);
			if (issues.length > 0) {
				results.push({ file: filePath, issues });
			}
		}
	});

	return results;
}

// Run the validation
const results = scanDirectory(stylesDir);

if (results.length > 0) {
	console.log("Validation Issues Found:");
	results.forEach(({ file, issues }) => {
		console.log(`\nFile: ${file}`);
		issues.forEach(({ line, content }) => {
			console.log(`  Line ${line}: ${content}`);
		});
	});
} else {
	console.log("All styles are properly tokenized!");
}
