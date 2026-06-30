// WARNING!!! THIS TYPESCRIPT FILE IS INCOMPLETE! Please see https://oliviax.github.io/RSS-ohrw for updates on progress

import { Encoder, Storer } from "./helpers.js";
import { Navigator, Cruncher } from "./main.js";

// Modify the RSS Feed HTML element
export class ModifyFeed {
	static FULLSCREEN_CRUNCH_SIZE = 700;

	// ===== LOAD AND RELOAD FEED ===== //

	// Reload the window
	static reloadFeed(fullscreen) {
		console.log("Reload toggled");

		self.Newsreader.initializeNewsreader().then(() =>
			Navigator.loadPage(null, () => {
				fullscreen == undefined
					? ModifyFeed.checkFullscreen()
					: ModifyFeed.toggleFullscreen(fullscreen);
			}),
		);
	}

	// ===== EXPAND/MINIMISE READER ===== //

	// Check if there is a fullscreen jquery parameter and then fullscreen if true
	static checkFullscreen() {
		const fullscreen = Storer.getURLParams("fullscreen") === "true";

		fullscreen == null ? false : fullscreen;

		if (fullscreen) {
			ModifyFeed.toggleFullscreen(fullscreen);
		}
	}

	// Toggle the expand and contract window functions
	static toggleFullscreen(toggleflag) {
		console.log("Fullscreen toggled");

		ModifyFeed.expandOrContractFeedWindow(toggleflag);
		ModifyFeed.hideAndUnhideToggleButtons(toggleflag);

		Storer.setURLParams("fullscreen", toggleflag, false);
	}

	static expandOrContractFeedWindow(toggleflag) {
		var feedWindow = document.getElementById("rss-feed-wrapper");

		var elementsToHide = [
			"ribbon-wrapper",
			"footer-wrapper",
			"sidebar",
		].map((id) => document.getElementById(id));

		if (toggleflag) {
			elementsToHide.forEach((element) => {
				if (element != null) {
					element.style.display = "none";
				}
			});

			feedWindow.style.position = "fixed";
			feedWindow.style.top = "0";
			feedWindow.style.left = "0";

			feedWindow.style.width = "100vw";
			feedWindow.style.height = "100vh";

			self.PageData.CRUNCH_SIZE = ModifyFeed.FULLSCREEN_CRUNCH_SIZE;
			Cruncher.checkCrunch();
		} else {
			feedWindow.style.position = "";
			feedWindow.style.top = "";
			feedWindow.style.left = "";

			feedWindow.style.width = "";
			feedWindow.style.height = "";

			elementsToHide.forEach((element) => {
				if (element != null) {
					element.style.display = "";
				}
			});

			self.PageData.CRUNCH_SIZE = self.PageData.DEFAULT_CRUNCH_SIZE;
			Cruncher.checkCrunch();
		}
	}

	static hideAndUnhideToggleButtons(toggleflag) {
		const toggle = (flag) => (flag ? "none" : "inline");

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

	// ===== APPEND AND REMOVE DATA ===== //

	static changeItemState(uuid, readOrDismiss) {
		// Get specific item
		var item = document.querySelector(`[data-entry-uuid="${uuid}"]`);

		const readOrDismissFunc = (readParam, stateBool) =>
			readParam ? !stateBool : stateBool;

		const entryData = self.ReaderState.entryDataMap.get(uuid) ?? {
			read: false,
			dismissed: false,
		};

		const entryDataDismissed = readOrDismissFunc(
			!readOrDismiss,
			entryData.dismissed,
		);

		const entryDataRead = readOrDismiss ? true : entryData.read;

		// Update entry data map
		self.ReaderState.entryDataMap.set(uuid, {
			read: entryDataRead,
			dismissed: entryDataDismissed,
		});

		// Set the document cookie
		Storer.setCookie(
			"entries",
			Encoder.encodeEntryDataMap(self.ReaderState.entryDataMap),
			undefined,
			10,
		);

		// Update item dismiss button
		if (!readOrDismiss) {
			let dbl = item.querySelectorAll(".item-dismiss");

			for (let i = 0; i < dbl.length; i++) {
				dbl[i].innerHTML = entryDataDismissed
					? "Restore Story"
					: "Dismiss Story";
			}
		}

		// Update item data
		item.setAttribute("data-dismissed", entryDataDismissed);
		item.setAttribute("data-read", entryDataRead);

		// Reorder the feeds
		ModifyFeed.reorderFeeds();

		console.log("Dismised or Read: " + uuid);
	}

	// ===== FEED MANAGEMENT ===== //

	static getFeedFromCookies() {
		const entries = Storer.getCookie("entries");
		self.ReaderState.entryDataMap =
			entries != undefined && entries !== ""
				? Encoder.decodeEntryDataMap(entries)
				: self.ReaderState.entryDataMap;
	}

	static reorderFeeds() {
		console.log("Reordering Feed ...");

		// Get specific item
		var feeds = document.querySelectorAll("[data-xml-id]");

		const getEntry = (htmlElement) => {
			const dateCheck = new Date(
				htmlElement.querySelector(".item-date").innerHTML,
			);

			return {
				dismissed: htmlElement.getAttribute("data-dismissed") == "true",
				date: dateCheck == "Invalid Date" ? undefined : dateCheck,
				uuid: htmlElement.getAttribute("data-entry-uuid"),
			};
		};

		for (let i = 0; i < feeds.length; i++) {
			var items = feeds[i].querySelectorAll(".news-item");
			var content = feeds[i].querySelector(".feed-content");

			const sorted = Array.from(items);

			sorted.sort((aElm, bElm) => {
				const a = getEntry(aElm);
				const b = getEntry(bElm);

				if (a.dismissed != b.dismissed) {
					return +a.dismissed - +b.dismissed;
				} else if (a.date !== undefined && b.date !== undefined) {
					return +b.date - +a.date;
				} else {
					return b.uuid.localeCompare(a.uuid);
				}
			});

			content.innerHTML = "";

			content.append(...sorted);
		}
	}

	// Alter every instance of set-xml-id
	static setFeedIDs() {
		var feeds = document.querySelectorAll("[set-xml-id]");

		for (let i = 0; i < feeds.length; i++) {
			feeds[i].setAttribute("data-xml-id", self.PageData.CURRENT_SECTION);
		}
	}
}

// Singular object to get/set important data for the files in app to use
export class ReaderState {
	// ===== READ OBJECTS AND DISMISSED OBJECTS ===== //

	entryDataMap = new Map([[]]);
}
