import BoneMiner from "./game.js";
import { Helpers, Storer, Retriever } from "./helpers.js";

// Main HTML Class
export class Navigator {

	// ===== ACTIVE UPDATING ===== //

	// Initialise Page
	static initPage(_callback = Helpers.IDENTITY) {
		const page = Storer.getURLParams('s');

		if (page != null) {
			Navigator.changeSection(page, _callback);
		} else {
			Navigator.goToSection(self.PageData.DEFAULT_SECTION, false);
		}
	}

	// Change/update section
	static changeSection(section, _callback = Helpers.IDENTITY) {
		var contentdiv;

		self.PageData.CURRENT_SECTION = section;

		// Get contentdiv, remove internal components, and then add includeHTML attribute
		contentdiv = document.getElementById("content-wrapper");
		contentdiv.innerHTML = "";
		contentdiv.setAttribute("html-ref", "src/html/" + section + ".html");

		// Re-call include HTML
		Navigator.loadPage(section, _callback);
	}

	static async loadPage(section, _callback = Helpers.IDENTITY) {
		function recurse(file) {
			console.log("Loaded file: " + file);
		}

		function then() {
			try {
				Navigator.updatePage(section);
				Cruncher.checkCrunch();
				BoneMiner.loadBones();
				_callback();
			} catch (error) {
				console.log("Did not switch to section: " + section + "; " + error);
				console.log(error.stack);
			} finally {
				console.log("Switched to section: " + section);
			}
			console.log("Cookies = " + document.cookie);
		}

		// Load the page
		await Retriever.includeHTML(recurse, then);
	}

	// Save bones and change URL - avoids me having to copy the header everywhere
	// Also allows for users to edit bone counts - it's a feature not a bug, ok?
	static goToSection(section, save = true) {
		if (save) {
			BoneMiner.saveBones();
		}

		Storer.setURLParams('s', section, true);
	}

	// ===== TOGGLE FUNCTIONS ===== //

	static showSubList(section) {
		var dropdiv, dropdivwrap;

		// Get divs
		dropdiv = document.getElementById("drop-" + section);
		dropdivwrap = document.getElementById("drop-wrapper-" + section);

		// Show dropdown div (CSS should already fix it to the right position)
		dropdivwrap.hidden = false;
		dropdiv.hidden = false;
	}

	static hideSubList(section) {
		var dropdiv, dropdivwrap;

		// Get divs
		dropdiv = document.getElementById("drop-" + section);
		dropdivwrap = document.getElementById("drop-wrapper-" + section);

		// Hide list
		dropdivwrap.hidden = true;
		dropdiv.hidden = true;
	}

	// Turn on or off the display of the menu
	static toggleMenu(toggleflag) {
		let menu = document.getElementById("menu-wrapper");

		console.log("Menu toggled");

		if (toggleflag) {
			menu.hidden = false;
		} else {
			menu.hidden = true;
		}
	}

	// ===== POST-LOAD UPDATE FUNCTIONS ===== //

	// Update webpage CSS and span elements
	static updatePage(section) {
		let sectionToSwitch = (section == null ? self.PageData.CURRENT_SECTION : section);
		Navigator.updateSectionNames(sectionToSwitch);
		Navigator.updateBackgroundColors(sectionToSwitch);
		Navigator.updateAges();
		Navigator.updateCurrentDates();
	}

	// Update section names
	static updateSectionNames(section) {
		var sectionNames = document.getElementsByClassName("sectionname");

		for (let i = 0; i < sectionNames.length; i++) {
			sectionNames[i].innerHTML = Helpers.formatSection(section);
		}
	}

	// Update ribbon/menu background colors
	static updateBackgroundColors(section) {
		let hue = self.PageData.SECTION_COLOR_DICT.get(section) ?? 300;

		document.documentElement.style.setProperty('--base-hue', hue);
	}

	// Change all age values in spans
	static updateAges() {
		var agespans;

		agespans = document.getElementsByClassName("age");

		for (let i = 0; i < agespans.length; i++) {
			var span = agespans[i];

			// Get age attribute of span and add 1 day
			let agedate = new Date(span.getAttribute("date"));
			agedate.setHours(0, 0, 0, 0);

			// Take year difference and set it inside the HTML
			let agediff = new Date(self.PageData.CURRENT_DATE - agedate).getFullYear() - 1970;

			// Show date if tag is flagged
			if (span.hasAttribute("showdate")) {
				span.innerHTML = agediff + " (" + agedate.toLocaleDateString('en-AU') + ");";
			} else {
				span.innerHTML = agediff;
			}
		}
	}

	static updateCurrentDates() {
		var datespans;

		datespans = document.getElementsByClassName("current-date");

		for (let i = 0; i < datespans.length; i++) {
			var span = datespans[i];

			span.innerHTML = self.PageData.CURRENT_DATE.toDateString();
		}
	}
}

export class Cruncher {
	// ===== CRUNCH EVENT HANDLING ===== //

	static oncrunch = new Event("oncrunch");
	static onrelax = new Event("onrelax");

	// Check if the crunch events have been activates
	static checkCrunch() {
		if (window.innerWidth < self.PageData.CRUNCH_SIZE) {
			document.dispatchEvent(Cruncher.oncrunch);
		} else {
			document.dispatchEvent(Cruncher.onrelax);
		}
	}

	// Default oncrunch event
	static onCrunch() {
		let toHide = document.querySelectorAll("[hide-oncrunch]");
		let toShow = document.querySelectorAll("[hide-onrelax]");

		for (let i = 0; i < toHide.length; i++) {
			toHide[i].style.display = "none";
		}

		for (let i = 0; i < toShow.length; i++) {
			toShow[i].style.display = "";
		}
	}

	// Default onrelax event
	static onRelax() {
		let toHide = document.querySelectorAll("[hide-onrelax]");
		let toShow = document.querySelectorAll("[hide-oncrunch]");

		for (let i = 0; i < toHide.length; i++) {
			toHide[i].style.display = "none";
		}

		for (let i = 0; i < toShow.length; i++) {
			toShow[i].style.display = "";
		}
	}

	// ===== CUSTOM CRUNCHING =====//

	static crunchRibbon() {
		// Ribbon stuff
		let ribbonmain = document.getElementsByClassName("ribbon-main");
		let ribboncrunch = document.getElementsByClassName("ribbon-crunch");

		// Change Ribbon
		for (let i = 0; i < ribbonmain.length; i++) {
			ribbonmain[i].style.display = "none";
		}
		for (let i = 0; i < ribboncrunch.length; i++) {
			ribboncrunch[i].style.display = "inline-block";
		}
	}

	static relaxRibbon() {
		// Ribbon stuff
		let ribbonmain = document.getElementsByClassName("ribbon-main");
		let ribboncrunch = document.getElementsByClassName("ribbon-crunch");

		// Change Ribbon
		for (let i = 0; i < ribboncrunch.length; i++) {
			ribboncrunch[i].style.display = "none";
		}
		for (let i = 0; i < ribbonmain.length; i++) {
			ribbonmain[i].style.display = "inline-block";
		}
	}

	static crunchContent() {
		// Content altering
		let centreext = document.getElementById("centreext");
		let centrediv = document.getElementById("centre");
		let sidebar = document.getElementById("sidebar");
		let contentwrapper = document.getElementById("content-wrapper");

		// Don't crunch if there's nothing to crunch
		if (centrediv == null && centreext == null) {
			return;
		}

		// Resize main content
		if (centreext != null) {
			centreext.style.marginLeft = 0;
			centreext.style.width = "100%";
		} else {
			centrediv.style.marginLeft = 0;
			centrediv.style.width = "100%";
			contentwrapper.style.display = "grid";
			sidebar.style.width = "100%";
			sidebar.style.paddingLeft = "33%";
			sidebar.style.paddingRight = "33%";
			sidebar.style.borderLeft = "none";
		}
	}

	static relaxContent() {
		// Content altering
		let centreext = document.getElementById("centreext");
		let centrediv = document.getElementById("centre");
		let sidebar = document.getElementById("sidebar");
		let contentwrapper = document.getElementById("content-wrapper");

		// Resize main content
		if (centreext != null) {
			centreext.style.marginLeft = "11%";
			centreext.style.width = "78%";
		} else {
			centrediv.style.marginLeft = "11%";
			centrediv.style.width = "67%";
			sidebar.style.display = "relative";
			contentwrapper.style.display = "flex";
			sidebar.style.width = "11%";
			sidebar.style.paddingLeft = "1%";
			sidebar.style.paddingRight = "1%";
			sidebar.style.borderLeft = "solid";
		}
	}

}

window.onresize = Cruncher.checkCrunch;