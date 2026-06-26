// WARNING!!! THIS TYPESCRIPT FILE IS INCOMPLETE! Please see https://oliviax.github.io/RSS-ohrw for updates on progress

import { Storer } from "./helpers.js";
import { Navigator, Cruncher } from "./main.js";

// Modify the RSS Feed HTML element
export class ModifyFeed {

	static FEED_CONTAINER_INNER_HTML = '<div html-ref="src/layout/rss-feed.html"></div>';

	static FULLSCREEN_CRUNCH_SIZE = 700;

	// ===== LOAD AND RELOAD FEED ===== //

	// Reload the window
	static reloadFeed(fullscreen) {
		console.log("Reload toggled");

		var container = document.getElementById("rss-feed-wrapper");
		container.innerHTML = ModifyFeed.FEED_CONTAINER_INNER_HTML;
		Navigator.loadPage(null, () => {
			ModifyFeed.toggleFullscreen(fullscreen);
		});
	}

	// ===== EXPAND/MINIMISE READER ===== //

	// Check if there is a fullscreen jquery parameter and then fullscreen if true
	static checkFullscreen() {
		const fullscreen = (Storer.getURLParams('fullscreen') === 'true');

		if (fullscreen) {
			ModifyFeed.toggleFullscreen(fullscreen);
		}
	}

	// Toggle the expand and contract window functions
	static toggleFullscreen(toggleflag) {
		console.log("Fullscreen toggled");

		ModifyFeed.expandOrContractFeedWindow(toggleflag);
		ModifyFeed.hideAndUnhideToggleButtons(toggleflag);

		Storer.setURLParams('fullscreen', toggleflag, false);
	}

	static expandOrContractFeedWindow(toggleflag) {
		var feedWindow = document.getElementById("rss-feed-wrapper");

		var elementsToHide =
			["ribbon-wrapper", "footer-wrapper", "sidebar"]
				.map((id) => document.getElementById(id));

		if (toggleflag) {
			elementsToHide.forEach((element) => {
				if (element != null) {
					element.style.display = 'none';
				}
			});

			feedWindow.style.position = 'fixed';
			feedWindow.style.top = '0';
			feedWindow.style.left = '0';

			feedWindow.style.width = '100vw';
			feedWindow.style.height = '100vh';

			self.PageData.CRUNCH_SIZE = ModifyFeed.FULLSCREEN_CRUNCH_SIZE;
			Cruncher.checkCrunch();
		} else {
			feedWindow.style.position = '';
			feedWindow.style.top = '';
			feedWindow.style.left = '';

			feedWindow.style.width = '';
			feedWindow.style.height = '';

			elementsToHide.forEach((element) => {
				if (element != null) {
					element.style.display = '';
				}
			});

			self.PageData.CRUNCH_SIZE = self.PageData.DEFAULT_CRUNCH_SIZE;
			Cruncher.checkCrunch();
		}
	}

	static hideAndUnhideToggleButtons(toggleflag) {
		const toggle = (flag) => flag ? 'none' : 'inline';

		var min_buttons = document.getElementsByClassName("rss-feed-min");
		var max_buttons = document.getElementsByClassName("rss-feed-max");

		for (let i = 0; i < min_buttons.length; i++) {
			min_buttons[i].style.display = toggle(!toggleflag);
		}

		for (let i = 0; i < max_buttons.length; i++) {
			max_buttons[i].style.display = toggle(toggleflag);
		}
	}

	static crunchRSS() {
		// RSS feed
		let rssMain = document.getElementsByClassName("item-link");
		let rssCrunch = document.getElementsByClassName("item-crunch");

		// Change RSS feed structure
		for (let i = 0; i < rssMain.length; i++) {
			rssMain[i].style.display = "none";
		}
		for (let i = 0; i < rssCrunch.length; i++) {
			rssCrunch[i].style.display = "table-cell";
		}
	}

	static relaxRSS() {
		let rssMain = document.getElementsByClassName("item-link");
		let rssCrunch = document.getElementsByClassName("item-crunch");

		// Change RSS feed structure
		for (let i = 0; i < rssMain.length; i++) {
			rssMain[i].style.display = "table-column";
		}
		for (let i = 0; i < rssCrunch.length; i++) {
			rssCrunch[i].style.display = "none";
		}
	}

}

// Singular object to get/set important data for the files in app to use
export class ReaderState {

	// ===== READ OBJECTS AND DISMISSED OBJECTS ===== //

	readIDs = new Set([]);
	dismissedIDs = new Set([]);

	// ===== LOAD/SAVE DATA FROM COOKIES ===== //

	loadIDs() {

	}

	saveIDs() {

	}

	// ===== APPEND AND REMOVE DATA ===== //

	appendItem(uuid) {
		return uuid;
	}

	removeItem(uuid) {
		return uuid;
	}
}
