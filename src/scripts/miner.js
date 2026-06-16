import Helpers from "./helpers.js";

class BoneMiner {

    static timer = null;
    static timeInterval = 1000;

    // ===== BONES ===== //

    // Funny-Haha Bone Counter. Bones reset on page load
    static dig4Bones(makealert = false) {
        var bones, gold, find

        if (!makealert) { console.log("Digging ...") }

        // Get bone counter footer element
        bones = document.getElementById("count-bones");
        gold = document.getElementById("count-gold");

        find = Math.random();

        if (find < 0.005) {
            if (makealert) { alert("You've struck gold!"); }
            gold.innerHTML = parseInt(gold.innerHTML) + 1;
        } else if (find <= 0.5) {
            let foundbones = Math.floor(1 / find - 1);
            if (makealert) { alert("You found " + foundbones + " bone(s)!"); }
            bones.innerHTML = parseInt(bones.innerHTML) + foundbones;
        } else {
            if (makealert) { alert("You got no bones :("); }
        }

        BoneMiner.saveBones();
    }

    static createAutoMiner(override = false) {
        // Get bone counter footer element, requires 100 bones
        let bones = document.getElementById("count-bones");

        // Get buttons
        let createbutton = document.getElementById("create-auto");
        let upgradebutton = document.getElementById("upgrade-auto");
        let level = document.getElementById("count-level");

        if (bones.innerHTML >= 100 || override) {
            console.log("Creating Miner ...");
            if (!override) {
                bones.innerHTML = parseInt(bones.innerHTML) - 100;
            }
            BoneMiner.timer = window.setInterval(dig4Bones, BoneMiner.timeInterval);
            createbutton.hidden = true;
            upgradebutton.hidden = false;
            level.innerHTML = 1;
        }

        BoneMiner.saveBones();
    }

    static upgradeAutoMiner(noalert = false, override = false) {
        // Get gold counter footer element, requires 1 gold
        let bones = document.getElementById("count-bones");
        let gold = document.getElementById("count-gold");
        let level = document.getElementById("count-level");

        if (level.innerHTML == "Max") {
            return;
        }

        if ((gold.innerHTML >= 1 && bones.innerHTML >= 500) || override) {
            if (BoneMiner.timeInterval <= 100) {
                BoneMiner.timeInterval = 1;
                if (!noalert) { alert("Miner Fully Upgraded!"); }
                document.getElementById("upgrade-auto").hidden = true;
            } else {
                BoneMiner.timeInterval -= 100;
            }

            console.log("Upgrading Miner ...");

            level.innerHTML = parseInt(level.innerHTML) + 1;
            if (!override) {
                gold.innerHTML = parseInt(gold.innerHTML) - 1;
                bones.innerHTML = parseInt(bones.innerHTML) - 500;
            }
            window.clearInterval(BoneMiner.timer);
            BoneMiner.timer = window.setInterval(dig4Bones, BoneMiner.timeInterval);

            if (level.innerHTML == 11) {
                level.innerHTML = "Max"
            }
        }

        BoneMiner.saveBones();
    }

    static loadBones() {
        // Give plenty of gold and bones for levelleing the autominer
        let level = parseInt(Helpers.getCookie("l"));
        const bones = parseInt(Helpers.getCookie("b"));
        const gold = parseInt(Helpers.getCookie("g"));

        if (isNaN(level)) {
            level = 0;
        }

        document.getElementById("count-level").innerHTML = 0;

        // Auto-click level up
        if (level > 0) {
            BoneMiner.createAutoMiner(override = true);
            for (i = 1; i < level; i++) {
                BoneMiner.upgradeAutoMiner(noalert = true, override = true);
            }
        }

        // Set static span elements
        document.getElementById("count-bones").innerHTML = isNaN(bones) ? 0 : bones;
        document.getElementById("count-gold").innerHTML = isNaN(gold) ? 0 : gold;
    }

    static resetBones() {
        console.log("Resetting Game");

        // Clear autominer BoneMiner.timer
        window.clearInterval(BoneMiner.timer);

        // Reset Buttons
        document.getElementById("upgrade-auto").hidden = true;
        document.getElementById("create-auto").hidden = false;

        // Set all elements to 0
        document.getElementById("count-bones").innerHTML = 0;
        document.getElementById("count-gold").innerHTML = 0;
        document.getElementById("count-level").innerHTML = 0;

        // Reset cookies - doesn't delete them
        Helpers.setCookie("l", null);
        Helpers.setCookie("g", null);
        Helpers.setCookie("b", null);
    }

    static saveBones() {
        // Get bones to save
        let bones = document.getElementById("count-bones").innerHTML;
        let gold = document.getElementById("count-gold").innerHTML;
        let level = document.getElementById("count-level").innerHTML;

        // Set cookies
        Helpers.setCookie("b", bones);
        Helpers.setCookie("g", gold);
        Helpers.setCookie("l", level);

        console.log("Saved bones: b=" + bones + ", g=" + ", l=" + level)
    }
}

export default BoneMiner;