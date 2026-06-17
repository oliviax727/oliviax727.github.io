// ===== SETUP ===== //

// End-user check JS works
console.info("This message should appear if the javascript integration has worked.");

import Helpers from './src/scripts/js/helpers.js';
import MainHTML from './src/scripts/js/main.js';
import BoneMiner from './src/scripts/js/game.js';

// Constants
const SECTION_COLOR_DICT = new Map([
    ["home", 300],
    ["about-professional", 250],
    ["about-personal", 120],
    ["about-political", 0],
    ["works", 45],
    ["curriculum_vitae", 25],
    ["links", 240]
]);

const CRUNCH_SIZE = 840;

const DEFAULT_SECTION = "home";

let mhtml = new MainHTML(SECTION_COLOR_DICT, CRUNCH_SIZE, DEFAULT_SECTION);

window.help = Helpers;
window.bm = BoneMiner;

window.onload = mhtml.initPage;
window.onresize = mhtml.crunch;