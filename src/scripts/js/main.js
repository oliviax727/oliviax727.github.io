import BoneMiner from "./game.js";
import Helpers from "./helpers.js";

// Main HTML Class
class MainHTML {
    // ===== MAIN CONSTANTS ===== //

    CURRENT_DATE;

    IDENTITY = () => { };

    SECTION_COLOR_DICT;
    DEFAULT_CRUNCH_SIZE;
    CRUNCH_SIZE;
    DEFAULT_SECTION;
    CURRENT_SECTION;

    // ===== ACTIVE UPDATING ===== //

    // Set window functions
    constructor(section_color_dict, crunch_size, default_section) {
        this.SECTION_COLOR_DICT = section_color_dict;
        this.DEFAULT_CRUNCH_SIZE = crunch_size;
        this.CRUNCH_SIZE = crunch_size;
        this.DEFAULT_SECTION = default_section;
        this.CURRENT_SECTION = default_section;
        this.CURRENT_DATE = new Date();
        
        self.mhtml = this;
    }

    // Initialise Page
    initPage() {
        const urlParams = new URLSearchParams(window.location.search);
        const page = urlParams.get('s');

        if (page != null) {
            self.mhtml.changeSection(page);
        } else {
            self.mhtml.goToSection(self.mhtml.DEFAULT_SECTION, false);
        }
    }

    // Change/update section
    changeSection(section) {
        var contentdiv;

        self.mhtml.CURRENT_SECTION = section;

        // Get contentdiv, remove internal components, and then add includeHTML attribute
        contentdiv = document.getElementById("content-wrapper");
        contentdiv.innerHTML = "";
        contentdiv.setAttribute("html-ref", "src/html/" + section + ".html");

        // Re-call include HTML
        self.mhtml.loadPage(section);
    }

    async loadPage(section, _callback = self.mhtml.IDENTITY) {
        // Load the page
        await self.mhtml.includeHTML(
            (file) => {
                console.log("Loaded file: " + file)
            },
            () => {
                try {
                    self.mhtml.updatePage(section);
                    self.mhtml.crunch();
                    BoneMiner.loadBones();
                    _callback();
                } catch (error) {
                    console.log("Did not switch to section: " + section + "; " + error);
                } finally {
                    console.log("Switched to section: " + section);
                }
                console.log("Cookies = " + document.cookie);
            }
        );
    }

    // Save bones and change URL - avoids me having to copy the header everywhere
    // Also allows for users to edit bone counts - it's a feature not a bug, ok?
    goToSection(section, save = true) {
        if (save) {
            BoneMiner.saveBones();
        }

        const urlParams = new URLSearchParams(window.location.search);
        const page = urlParams.set('s', section);
    }

    // ===== TOGGLE FUNCTIONS ===== //

    showSubList(section) {
        var dropdiv, dropdivwrap;

        // Get divs
        dropdiv = document.getElementById("drop-" + section);
        dropdivwrap = document.getElementById("drop-wrapper-" + section);

        // Show dropdown div (CSS should already fix it to the right position)
        dropdivwrap.hidden = false;
        dropdiv.hidden = false;
    }

    hideSubList(section) {
        var dropdiv, dropdivwrap;

        // Get divs
        dropdiv = document.getElementById("drop-" + section);
        dropdivwrap = document.getElementById("drop-wrapper-" + section);

        // Hide list
        dropdivwrap.hidden = true;
        dropdiv.hidden = true;
    }

    // Turn on or off the display of the menu
    toggleMenu(toggleflag) {
        let menu = document.getElementById("menu-wrapper");
        let title = document.getElementById("ribbon-wrapper");

        console.log("Menu toggled");

        if (toggleflag) {
            menu.hidden = false;
        } else {
            menu.hidden = true;
        }
    }

    // Alter webpage if window too small
    crunch() {
        // Content altering
        let centreext = document.getElementById("centreext");
        let centrediv = document.getElementById("centre");
        let sidebar = document.getElementById("sidebar");
        let contentwrapper = document.getElementById("content-wrapper");

        // Ribbon stuff
        let ribbonmain = document.getElementsByClassName("ribbon-main");
        let ribboncrunch = document.getElementsByClassName("ribbon-crunch");

        // RSS feed
        let rssMain = document.getElementsByClassName("item-link");
        let rssCrunch = document.getElementsByClassName("item-crunch");

        // Don't crunch if there's nothing to crunch
        if (centrediv == null && centreext == null) {
            return;
        }

        // 840 ~ Width that causes Ribbon selectors to become multiline
        if (window.innerWidth < self.mhtml.CRUNCH_SIZE) {

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

            // Change Ribbon
            for (let i = 0; i < ribbonmain.length; i++) {
                ribbonmain[i].style.display = "none";
            }
            for (let i = 0; i < ribboncrunch.length; i++) {
                ribboncrunch[i].style.display = "inline-block";
            }

            // Change RSS feed structure
            for (let i = 0; i < rssMain.length; i++) {
                rssMain[i].style.display = "none";
            }
            for (let i = 0; i < rssCrunch.length; i++) {
                rssCrunch[i].style.display = "table-cell";
            }

        } else {

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

            // Change Ribbon
            for (let i = 0; i < ribboncrunch.length; i++) {
                ribboncrunch[i].style.display = "none";
            }
            for (let i = 0; i < ribbonmain.length; i++) {
                ribbonmain[i].style.display = "inline-block";
            }

            // Change RSS feed structure
            for (let i = 0; i < rssMain.length; i++) {
                rssMain[i].style.display = "table-column";
            }
            for (let i = 0; i < rssCrunch.length; i++) {
                rssCrunch[i].style.display = "none";
            }
        }
    }

    // ===== POST-LOAD UPDATE FUNCTIONS ===== //

    // Update webpage CSS and span elements
    updatePage(section) {
        let sectionToSwitch = (section == null ? self.mhtml.CURRENT_SECTION : section);
        self.mhtml.updateSectionNames(sectionToSwitch);
        self.mhtml.updateBackgroundColors(sectionToSwitch);
        self.mhtml.updateAges();
        self.mhtml.updateCurrentDates();
    }

    // Update section names
    updateSectionNames(section) {
        var sectionNames = document.getElementsByClassName("sectionname");

        for (let i = 0; i < sectionNames.length; i++) {
            sectionNames[i].innerHTML = Helpers.formatSection(section);
        }
    }

    // Update ribbon/menu background colors
    updateBackgroundColors(section) {
        document.documentElement.style.setProperty('--base-hue', self.mhtml.SECTION_COLOR_DICT.get(section));
    }

    // Change all age values in spans
    updateAges() {
        var agespans;

        agespans = document.getElementsByClassName("age");

        for (let i = 0; i < agespans.length; i++) {
            var span = agespans[i];
            
            // Get age attribute of span and add 1 day
            let agedate = new Date(span.getAttribute("date"));
            agedate.setHours(0, 0, 0, 0);

            // Take year difference and set it inside the HTML
            let agediff = new Date(self.mhtml.CURRENT_DATE - agedate).getFullYear() - 1970;

            // Show date if tag is flagged
            if (span.hasAttribute("showdate")) {
                span.innerHTML = agediff + " (" + agedate.toLocaleDateString('en-AU') + ");";
            } else {
                span.innerHTML = agediff
            }
        }
    }

    updateCurrentDates() {
        var datespans;

        datespans = document.getElementsByClassName("current-date");

        for (let i = 0; i < datespans.length; i++) {
            var span = datespans[i];

            span.innerHTML = self.mhtml.CURRENT_DATE.toDateString('en-AU');
        }
    }

    // ===== FILE HANDLING ===== //

    // Read file via XHTTP and use it
    readHTML(file, _callback) {
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
    includeHTML(_recurse = self.mhtml.IDENTITY, _then = self.mhtml.IDENTITY) {
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
                self.mhtml.includeHTML(_recurse, _then);
            }
        }

        self.mhtml.readHTML(file, recursive_callback);

        // Exit the function:
        return;
    }
}

export default MainHTML;