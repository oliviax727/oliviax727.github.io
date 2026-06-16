
// Main HTML Class
class MainHTML {
    // ===== MAIN CONSTANTS ===== //

    CURRENT_DATE;

    IDENTITY = () => { };

    timer = null;
    timeInterval = 1000;

    SECTION_COLOR_DICT;
    CRUNCH_SIZE;
    DEFAULT_SECTION

    // ===== ACTIVE UPDATING ===== //

    // Set window functions
    constructor(section_color_dict, crunch_size, default_section) {
        this.SECTION_COLOR_DICT = section_color_dict;
        this.CRUNCH_SIZE = crunch_size;
        this.DEFAULT_SECTION = default_section;
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

        // Get contentdiv, remove internal components, and then add includeHTML attribute
        contentdiv = document.getElementById("content-wrapper");
        contentdiv.innerHTML = "";
        contentdiv.setAttribute("html-ref", "src/html/" + section + ".html");

        // Re-call include HTML
        self.mhtml.loadPage(section);
    }

    loadPage(section) {
        // Load the page

        self.mhtml.includeHTML(
            (file) => {
                console.log("Loaded file: " + file)
            },
            () => {
                try {
                    self.mhtml.updatePage(section);
                    self.mhtml.crunch();
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
            self.mhtml.saveBones();
        }
        window.location.search = "?s=" + section;
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
        self.mhtml.updateSectionNames(section);
        self.mhtml.updateBackgroundColors(section);
        self.mhtml.updateAges();
        self.mhtml.updateCurrentDates();
    }

    // Update section names
    updateSectionNames(section) {
        if (document.querySelector("#sectionname")) {
            document.getElementById("sectionname").innerHTML = self.mhtml.formatSection(section);
        }

        if (document.querySelector("#sectionname-menu")) {
            document.getElementById("sectionname-menu").innerHTML = self.mhtml.formatSection(section);
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

            span.classList.remove("age");
        }
    }

    updateCurrentDates() {
        var datespans;

        datespans = document.getElementsByClassName("current-date");

        for (let i = 0; i < datespans.length; i++) {
            var span = datespans[i];

            span.innerHTML = self.mhtml.CURRENT_DATE.toDateString('en-AU');

            span.classList.remove("date");
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

                // Load bones in footer
                if (file == 'src/layout/footer.html') {
                    self.mhtml.loadBones();
                }

                // Recursive call
                self.mhtml.includeHTML(_recurse, _then);
            }
        }

        self.mhtml.readHTML(file, recursive_callback);

        // Exit the function:
        return;
    }

    // ===== BONES ===== //

    // Funny-Haha Bone Counter. Bones reset on page load
    dig4Bones(makealert = false) {
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

        self.mhtml.saveBones();
    }

    createAutoMiner(override = false) {
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
            self.mhtml.timer = window.setInterval(dig4Bones, self.mhtml.timeInterval);
            createbutton.hidden = true;
            upgradebutton.hidden = false;
            level.innerHTML = 1;
        }

        self.mhtml.saveBones();
    }

    upgradeAutoMiner(noalert = false, override = false) {
        // Get gold counter footer element, requires 1 gold
        let bones = document.getElementById("count-bones");
        let gold = document.getElementById("count-gold");
        let level = document.getElementById("count-level");

        if (level.innerHTML == "Max") {
            return;
        }

        if ((gold.innerHTML >= 1 && bones.innerHTML >= 500) || override) {
            if (self.mhtml.timeInterval <= 100) {
                self.mhtml.timeInterval = 1;
                if (!noalert) { alert("Miner Fully Upgraded!"); }
                document.getElementById("upgrade-auto").hidden = true;
            } else {
                self.mhtml.timeInterval -= 100;
            }

            console.log("Upgrading Miner ...");

            level.innerHTML = parseInt(level.innerHTML) + 1;
            if (!override) {
                gold.innerHTML = parseInt(gold.innerHTML) - 1;
                bones.innerHTML = parseInt(bones.innerHTML) - 500;
            }
            window.clearInterval(self.mhtml.timer);
            self.mhtml.timer = window.setInterval(dig4Bones, self.mhtml.timeInterval);

            if (level.innerHTML == 11) {
                level.innerHTML = "Max"
            }
        }

        self.mhtml.saveBones();
    }

    loadBones() {
        // Give plenty of gold and bones for levelleing the autominer
        let level = parseInt(self.mhtml.getCookie("l"));
        const bones = parseInt(self.mhtml.getCookie("b"));
        const gold = parseInt(self.mhtml.getCookie("g"));

        if (isNaN(level)) {
            level = 0;
        }

        document.getElementById("count-level").innerHTML = 0;

        // Auto-click level up
        if (level > 0) {
            self.mhtml.createAutoMiner(override = true);
            for (i = 1; i < level; i++) {
                self.mhtml.upgradeAutoMiner(noalert = true, override = true);
            }
        }

        // Set static span elements
        document.getElementById("count-bones").innerHTML = isNaN(bones) ? 0 : bones;
        document.getElementById("count-gold").innerHTML = isNaN(gold) ? 0 : gold;
    }

    resetBones() {
        console.log("Resetting Game");

        // Clear autominer self.mhtml.timer
        window.clearInterval(self.mhtml.timer);

        // Reset Buttons
        document.getElementById("upgrade-auto").hidden = true;
        document.getElementById("create-auto").hidden = false;

        // Set all elements to 0
        document.getElementById("count-bones").innerHTML = 0;
        document.getElementById("count-gold").innerHTML = 0;
        document.getElementById("count-level").innerHTML = 0;

        // Reset cookies - doesn't delete them
        self.mhtml.setCookie("l", null);
        self.mhtml.setCookie("g", null);
        self.mhtml.setCookie("b", null);
    }

    saveBones() {
        // Get bones to save
        let bones = document.getElementById("count-bones").innerHTML;
        let gold = document.getElementById("count-gold").innerHTML;
        let level = document.getElementById("count-level").innerHTML;

        // Set cookies
        self.mhtml.setCookie("b", bones);
        self.mhtml.setCookie("g", gold);
        self.mhtml.setCookie("l", level);

        console.log("Saved bones: b=" + bones + ", g=" + ", l=" + level)
    }

    // ===== HANDY FUNCTIONS ===== //

    setCookie(name, value) {
        document.cookie = name + "=" + value + "; path=/";
    }

    getCookie(name) {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        return parts.pop().split(';').shift();
    }

    capitalize(str) {
        return String(str).charAt(0).toUpperCase() + String(str).slice(1);
    }

    capitalizeEach(str) {
        let words = str.split(" ");
        for (let i = 0; i < words.length; i++) {
            words[i] = self.mhtml.capitalize(words[i])
        }
        return words.join(" ")
    }

    formatSection(str) {
        return self.mhtml.capitalizeEach(str.replace("-", ": ").replace("_", " "));
    }
}

export default MainHTML;