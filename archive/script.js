const btn = document.getElementById("dropdownBtn");
const portal = document.getElementById("dropdownPortal");

let open = false;

function renderDropdown() {
	portal.innerHTML = "";
	if (open) {
		const dropdown = document.createElement("div");
		dropdown.className = "dropdown";
		dropdown.innerHTML =
			"<strong>Dropdown Content</strong><br>This should be blurred!";
		portal.appendChild(dropdown);
	}
}

btn.addEventListener("click", () => {
	open = !open;
	renderDropdown();
});

document.addEventListener("click", (e) => {
	if (open && !btn.contains(e.target) && !portal.contains(e.target)) {
		open = false;
		renderDropdown();
	}
});

// Initial render
renderDropdown();
