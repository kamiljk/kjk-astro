// random-neon.js
// Persistently pick a random neon color set for the session and apply it to CSS variables

const neonSets = [
	"green",
	"blue",
	"pink",
	"yellow",
	"orange",
	"purple",
	"red",
	"cyan",
	"lime",
	"magenta",
];

function pickOrRestoreNeonSet() {
	let set = sessionStorage.getItem("neonColorSet");
	if (!set) {
		set = neonSets[Math.floor(Math.random() * neonSets.length)];
		sessionStorage.setItem("neonColorSet", set);
	}
	const root = document.documentElement;
	root.style.setProperty("--color-accent", `var(--neon-${set})`);
	root.style.setProperty("--color-accent-dark", `var(--neon-${set}-dark)`);
	root.style.setProperty("--color-link", `var(--neon-${set}-link)`);
	root.style.setProperty("--color-link-hover", `var(--neon-${set}-hover)`);
}

window.addEventListener("DOMContentLoaded", pickOrRestoreNeonSet);
