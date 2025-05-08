// Utility to normalize post types for consistent filtering
export function normalizeType(type) {
  if (type === "game" || type === "play") return "play";
  if (type === "read" || type === "reading" || type === "post") return "read";
  if (type === "about") return "about";
  return type;
}
