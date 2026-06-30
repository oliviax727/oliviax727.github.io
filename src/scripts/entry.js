console.log("Entry javascript integrated.");

import { loadRSS, displayNewsreaderLinks } from './app/index.js';

class Newsreader {
	// Initialise all newsreader functions
	static async initializeNewsreader() {
		try {
			// .feedlist only exists on primary.html — skip on other sections
			if (document.querySelector('.feedlist')) {
				const newsReaderLinks = await displayNewsreaderLinks();
				await self.DynamicLoader.dynamicLoad(".feedlist", newsReaderLinks.innerHTML);
			}

			const setRSSFeed = async (feedName) => (await loadRSS([self.ReaderState.entryDataMap, feedName])).innerHTML;

			await self.DynamicLoader.dynamicLoad("[data-xml-id]", setRSSFeed, "data-xml-id");
		} catch (error) {
			console.log("The following error was encountered: " + error);
			console.log(error.stack);
		} finally {
			console.log("Node Modules successfully loaded and executed.")
		}
	}
}

window.Newsreader = Newsreader;

document.addEventListener("pageLoaded", () => {
	self.ModifyFeed.setFeedIDs();
	self.ModifyFeed.reloadFeed();
}, { once: true });
