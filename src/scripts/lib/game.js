import { Storer } from "./helpers.js";

class BoneMinerData {
	counter = 10;
	level = 0;
	timer = null;

	constructor() {
		// Set the timer
		this.timer = window.setInterval(() => {
			if (this.level <= 0) {
				return;
			} else if (this.level > this.counter) {
				BoneMiner.dig4Bones();
				this.counter = 10;
			} else {
				this.counter--;
			}
		}, 100);
	}
}

class BoneMiner {
	// ===== BONES ===== //

	// Mine for fossils in the footer of the webpage! Bones reset on page load
	static dig4Bones(makealert = false) {
		var bones, gold, find;

		if (!makealert) {
			console.log("Digging ...");
		}

		// Get bone counter footer element
		bones = document.getElementById("count-bones");
		gold = document.getElementById("count-gold");

		find = Math.random();

		if (find < 0.01) {
			if (makealert) {
				alert("You've struck gold!");
			}
			gold.innerHTML = parseInt(gold.innerHTML) + 1;
		} else if (find <= 0.5) {
			let foundbones = Math.floor(1 / find - 1);
			if (makealert) {
				alert("You found " + foundbones + " bone(s)!");
			}
			bones.innerHTML = parseInt(bones.innerHTML) + foundbones;
		} else {
			if (makealert) {
				alert("You got no bones :(");
			}
		}

		// Print cookies to terminal iff an alert has been made
		BoneMiner.saveBones(makealert && find <= 0.5);
	}

	static createAutoMiner(override = false) {
		// Get bone counter footer element, requires 100 bones
		let bones = document.getElementById("count-bones");

		// Get buttons
		let createbutton = document.getElementById("create-auto");
		let upgradebutton = document.getElementById("upgrade-auto");
		let level = document.getElementById("count-level");

		if (
			level.innerHTML == 0 &&
			window.BoneMinerData.level == 0 &&
			(bones.innerHTML >= 100 || override)
		) {
			console.log("Creating Miner ...");

			if (!override) {
				bones.innerHTML = parseInt(bones.innerHTML) - 100;
			}

			createbutton.hidden = true;
			upgradebutton.hidden = false;
			level.innerHTML = 1;
			window.BoneMinerData.level++;

			BoneMiner.saveBones();
		}
	}

	static upgradeAutoMiner(noalert = false, override = false) {
		// Get gold counter footer element, requires 1 gold
		let bones = document.getElementById("count-bones");
		let gold = document.getElementById("count-gold");
		let level = document.getElementById("count-level");

		if (level.innerHTML == 11) {
			return;
		}

		if ((gold.innerHTML >= 1 && bones.innerHTML >= 500) || override) {
			if (window.BoneMinerData.level >= 11) {
				window.BoneMinerData.level = 11;
				if (!noalert) {
					alert("Miner Fully Upgraded!");
				}
				document.getElementById("upgrade-auto").hidden = true;
			} else {
				window.BoneMinerData.level++;
			}

			console.log("Upgrading Miner ...");

			level.innerHTML = parseInt(level.innerHTML) + 1;
			if (!override) {
				gold.innerHTML = parseInt(gold.innerHTML) - 1;
				bones.innerHTML = parseInt(bones.innerHTML) - 500;
			}

			BoneMiner.saveBones();
		}
	}

	static loadBones() {
		// Give plenty of gold and bones for levelleing the autominer
		let level = parseInt(Storer.getCookie("l"));
		const bones = parseInt(Storer.getCookie("b"));
		const gold = parseInt(Storer.getCookie("g"));

		if (isNaN(level)) {
			level = 0;
		}

		document.getElementById("count-level").innerHTML = 0;

		// Auto-click level up
		if (level > 0) {
			BoneMiner.createAutoMiner(true);
			for (let i = 1; i < level; i++) {
				BoneMiner.upgradeAutoMiner(true, true);
			}
		}

		// Set static span elements
		document.getElementById("count-bones").innerHTML = isNaN(bones)
			? 0
			: bones;
		document.getElementById("count-gold").innerHTML = isNaN(gold)
			? 0
			: gold;
	}

	static resetBones() {
		console.log("Resetting Game");

		// Reset static variables
		window.BoneMinerData.level = 0;
		window.BoneMinerData.counter = 10;

		// Reset Buttons
		document.getElementById("upgrade-auto").hidden = true;
		document.getElementById("create-auto").hidden = false;

		// Set all elements to 0
		document.getElementById("count-bones").innerHTML = 0;
		document.getElementById("count-gold").innerHTML = 0;
		document.getElementById("count-level").innerHTML = 0;

		// Reset cookies - doesn't delete them
		Storer.setCookie("l", null);
		Storer.setCookie("g", null);
		Storer.setCookie("b", null);
	}

	static saveBones(quiet = false) {
		// Get bones to save
		let bones = document.getElementById("count-bones").innerHTML;
		let gold = document.getElementById("count-gold").innerHTML;
		let level = document.getElementById("count-level").innerHTML;

		// Set cookies
		Storer.setCookie("b", bones);
		Storer.setCookie("g", gold);
		Storer.setCookie("l", level);

		if (quiet) {
			console.log("Saved bones: b=" + bones + ", g=" + ", l=" + level);
		}
	}

	static clearAllTimers() {
		var id = window.setTimeout(function () {}, 0);

		while (id--) {
			window.clearTimeout(id);
		}
	}

	static initMiner() {
		// Clear all pre-existing timers
		BoneMiner.clearAllTimers();

		// Create a new data object (and set the timer)
		window.BoneMinerData = new BoneMinerData();
	}
}

export default BoneMiner;
