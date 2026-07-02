// ===== SETUP ===== //

// End-user check JS works
console.info(
	"This message should appear if the javascript integration has worked.",
);

import { PageData } from "./src/scripts/lib/helpers.js";
import { Navigator, Cruncher } from "./src/scripts/lib/main.js";
import BoneMiner from "./src/scripts/lib/game.js";

// Constants
const SECTION_COLOR_DICT = new Map([
	["home", 300],
	["about-professional", 250],
	["about-personal", 120],
	["about-political", 0],
	["works", 45],
	["curriculum_vitae", 25],
	["links", 240],
]);

const DEFAULT_CRUNCH_SIZE = 840;

const DEFAULT_SECTION = "home";

// Main HTML functions

let data = new PageData(
	DEFAULT_CRUNCH_SIZE,
	DEFAULT_SECTION,
	SECTION_COLOR_DICT,
);

window.PageData = data;

window.Navigator = Navigator;
window.BoneMiner = BoneMiner;

// Activate events

window.onload = () => {
	Navigator.initPage();
};

document.addEventListener("oncrunch", () => {
	Cruncher.onCrunch();
	Cruncher.crunchRibbon();
	Cruncher.crunchContent();
});

document.addEventListener("onrelax", () => {
	Cruncher.onRelax();
	Cruncher.relaxRibbon();
	Cruncher.relaxContent();
});
