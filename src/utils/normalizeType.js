// Utility to normalize post types for consistent filtering
export function normalizeType(type) {
	if (type === "game" || type === "play") return "play";
	if (type === "read" || type === "reading") return "read";
	if (type === "post") return "post";
	if (type === "about") return "about";
	return null; // Only allow about, play, read, post
}
