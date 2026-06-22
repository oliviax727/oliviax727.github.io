import BoneMiner from "./game.js";
import { Helpers, PageData } from "./helpers.js";

// Main HTML Class
export class Navigator {

    // ===== ACTIVE UPDATING ===== //

    // Initialise Page
    static initPage(_callback = Helpers.IDENTITY) {
        const urlParams = new URLSearchParams(window.location.search);
        const page = urlParams.get('s');

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
            console.log("Loaded file: " + file)
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
        await Navigator.includeHTML(recurse, then);
    }

    // Save bones and change URL - avoids me having to copy the header everywhere
    // Also allows for users to edit bone counts - it's a feature not a bug, ok?
    static goToSection(section, save = true) {
        if (save) {
            BoneMiner.saveBones();
        }
        const url = new URL(window.location.href);

        url.searchParams.set('s', section);

        window.location.search = "?" + url.searchParams.toString();
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
        let title = document.getElementById("ribbon-wrapper");

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
        document.documentElement.style.setProperty('--base-hue', self.PageData.SECTION_COLOR_DICT.get(section));
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
                span.innerHTML = agediff
            }
        }
    }

    static updateCurrentDates() {
        var datespans;

        datespans = document.getElementsByClassName("current-date");

        for (let i = 0; i < datespans.length; i++) {
            var span = datespans[i];

            span.innerHTML = self.PageData.CURRENT_DATE.toDateString('en-AU');
        }
    }

    // ===== FILE HANDLING ===== //

    // Read file via XHTTP and use it
    static readHTML(file, _callback) {
        // Create an XMLHttpRequest object
        const xhttp = new XMLHttpRequest();

        // On data retreival
        xhttp.onreadystatechange = _callback;

        // Send a request
        xhttp.open("GET", file);
        xhttp.send();
        return;
    }

    // XHTML integration to allow all of the pages to be inserted into eachother (W3 Schools)
    static includeHTML(_recurse = Helpers.IDENTITY, _then = Helpers.IDENTITY) {
        var z, i, elmnt, file, xhttp;

        // Loop through a collection of all HTML elements:
        elmnt = document.querySelector("[html-ref]");

        if (elmnt == null) {
            _then();
            return;
        }

        // search for elements with a certain atrribute:
        file = elmnt.getAttribute("html-ref");

        function recursive_callback() {
            if (this.readyState == 4) {

                // Catch errors
                if (this.status == 200) { elmnt.innerHTML = this.responseText; }
                else if (this.status == 404) { elmnt.innerHTML = "404 Page not found."; }
                else {
                    elmnt.innerHTML =
                        "There was some unidentified issue stopping the webpage from loading." +
                        "\nError Status: " + this.status;
                }

                // Remove the attribute, and call this function once more:
                elmnt.removeAttribute("html-ref");

                // XHTTP doesn't like async/await, so just do it every time the XHTTP is loaded
                _recurse(file);

                // Recursive call
                Navigator.includeHTML(_recurse, _then);
            }
        }

        Navigator.readHTML(file, recursive_callback);

        // Exit the function:
        return;
    }
}

export class Cruncher {
    // ===== CRUNCH EVENT HANDLING ===== //

    static crunchEvent = new Event("oncrunch");
    static relaxEvent = new Event("onrelax");

    // Check if the crunch events have been activates
    static checkCrunch() {
        if (window.innerWidth < self.PageData.CRUNCH_SIZE) {
            document.dispatchEvent(Cruncher.crunchEvent);
        } else {
            document.dispatchEvent(Cruncher.relaxEvent);
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