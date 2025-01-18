// ===== SETUP ===== //
// I HATE CLIENT SIDE JS I MISS NODE BUT I'M NOT BOTHERED TO INTEGRATE IT

// End-user check JS works
console.info("This message should appear if the javascript integration has worked.")

// For testing purposes (VSCode doesn't like console with HTML preview)
var teststring;

// Constants
const SECTION_COLOR_DICT = new Map([
    ["home", ["darkmagenta", "magenta"]],
    ["about-professional", ["darkslateblue", "slateblue"]],
    ["about-personal", ["darkgreen", "green"]],
    ["about-political", ["darkred", "red"]],
    ["works", ["darkgoldenrod", "goldenrod"]],
    ["curriculum_vitae", ["darkorange", "orange"]],
    ["links", ["darkblue", "blue"]]
]);

const CURRENT_DATE = new Date();

let timer = null;
let timerinterval = 1000;

// ===== BONES ===== //

// Funny-Haha Bone Counter. Bones reset on page load
function dig4Bones(makealert=false) {
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
        let foundbones = Math.floor(1/find - 1);
        if (makealert) { alert("You found "+foundbones+" bone(s)!"); }
        bones.innerHTML = parseInt(bones.innerHTML) + foundbones;
    } else {
        if (makealert) { alert("You got no bones :("); }
    }

    saveBones();
}

function createAutoMiner(override = false) {
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
        timer = window.setInterval(dig4Bones, timerinterval);
        createbutton.hidden = true;
        upgradebutton.hidden = false;
        level.innerHTML = 1;
    }

    saveBones();
}

function upgradeAutoMiner(noalert = false, override = false) {
    // Get gold counter footer element, requires 1 gold
    let bones = document.getElementById("count-bones");
    let gold = document.getElementById("count-gold");
    let level = document.getElementById("count-level");

    if (level.innerHTML == "Max") {
        return;
    }

    if ((gold.innerHTML >= 1 && bones.innerHTML >= 500) || override) {
        if (timerinterval <= 100){
            timerinterval = 1;
            if (!noalert) { alert("Miner Fully Upgraded!"); }
            document.getElementById("upgrade-auto").hidden = true;
        } else {
            timerinterval -= 100;
        }

        console.log("Upgrading Miner ...");

        level.innerHTML = parseInt(level.innerHTML) + 1;
        if (!override) {
            gold.innerHTML = parseInt(gold.innerHTML) - 1;
            bones.innerHTML = parseInt(bones.innerHTML) - 500;
        }
        window.clearInterval(timer);
        timer = window.setInterval(dig4Bones, timerinterval);

        if (level.innerHTML == 11) {
            level.innerHTML = "Max"
        }
    }

    saveBones();
}

function loadBones() {
    // Give plenty of gold and bones for levelleing the autominer
    let level = parseInt(getCookie("l"));
    const bones = parseInt(getCookie("b"));
    const gold = parseInt(getCookie("g"));

    if (isNaN(level)) {
        level = 0;
    }

    document.getElementById("count-level").innerHTML = 0;

    // Auto-click level up
    if (level > 0) {
        createAutoMiner(override=true);
        for (i = 1; i < level; i++) {
            upgradeAutoMiner(noalert=true, override=true);
        }
    }

    // Set static span elements
    document.getElementById("count-bones").innerHTML = isNaN(bones) ? 0 : bones;
    document.getElementById("count-gold").innerHTML = isNaN(gold) ? 0 : gold;
}

function resetBones() {
    console.log("Resetting Game");

    // Clear autominer timer
    window.clearInterval(timer);

    // Reset Buttons
    document.getElementById("upgrade-auto").hidden = true;
    document.getElementById("create-auto").hidden = false;

    // Set all elements to 0
    document.getElementById("count-bones").innerHTML = 0;
    document.getElementById("count-gold").innerHTML = 0;
    document.getElementById("count-level").innerHTML = 0;

    // Reset cookies - doesn't delete them
    setCookie("l", null);
    setCookie("g", null);
    setCookie("b", null);
}

function saveBones() {
    // Get bones to save
    let bones = document.getElementById("count-bones").innerHTML;
    let gold = document.getElementById("count-gold").innerHTML;
    let level = document.getElementById("count-level").innerHTML;

    // Set cookies
    setCookie("b", bones);
    setCookie("g", gold);
    setCookie("l", level);
}

// ===== ACTIVE UPDATING ===== //

// Change/update section
function changeSection(section) {
    var contentdiv, sectionname;

    // Get contentdiv, remove internal components, and then add includeHTML attribute
    contentdiv = document.getElementById("content");
    contentdiv.innerHTML = "";
    contentdiv.setAttribute("w3-include-html", "html-files/"+section+".html");

    // Re-call include HTML
    loadPage(() => {
        // Change cosmetics in ribbon
        sectionname = document.getElementById("sectionname");
        sectionname.innerHTML = formatSection(section);
        document.getElementById("title").style.backgroundColor = SECTION_COLOR_DICT.get(section)[0];
        console.log("Switched to section: "+section);
    });
}

function showSubList(section) {
    var dropdiv, dropdivwrap;

    // Get divs
    dropdiv = document.getElementById("drop-"+section);
    dropdivwrap = document.getElementById("drop-wrapper-"+section);

    // Show dropdown div (CSS should already fix it to the right position)
    dropdivwrap.hidden = false;
    dropdiv.hidden = false;
}

function hideSubList(section) {
    var dropdiv, dropdivwrap;
    
    // Get divs
    dropdiv = document.getElementById("drop-"+section);
    dropdivwrap = document.getElementById("drop-wrapper-"+section);

    // Hide list
    dropdivwrap.hidden = true;
    dropdiv.hidden = true;
}

function initPage() {
    const urlParams = new URLSearchParams(window.location.search);
    const page = urlParams.get('s');

    if (page != null) {
        changeSection(page);
    } else {
        loadPage();
    }
}

function loadPage(_callback=(() => {})) {
    // Load the page
    includeHTML(() => {
        _callback();
        updateAges();
        crunch();
    });
}

// Save bones and change URL - avoids me having to copy the header everywhere
// Also allows for users to edit bone counts - it's a feature not a bug, ok?
function goToSection(section) {
    saveBones();
    window.location.href = "?s="+section;
}

// Alter webpage if window too small
function crunch() {
    let centreext = document.getElementById("centreext");
    let centrediv = document.getElementById("centre");
    let sidebar = document.getElementById("sidebar");

    // Don't crunch if there's nothing to crunch
    if (centrediv == null && centreext == null) {
        return;
    }

    // 840 ~ Width that causes Ribbon selectors to become multiline
    if (window.innerWidth < 840) {
        if (centreext != null) {
            centreext.style.marginLeft = 0;
            centreext.style.width = "100%";
        } else {
            centrediv.style.marginLeft = 0;
            centrediv.style.width = "100%";
            sidebar.style.display = "none";
        }
    } else {
        if (centreext != null) {
            centreext.style.marginLeft = "11%";
            centreext.style.width = "78%";
        } else {
            centrediv.style.marginLeft = "11%";
            centrediv.style.width = "67%";
            sidebar.style.display = "initial";
        }
    }
}

window.onresize = crunch;

// ===== INTITIALISATION FUNCTIONS ===== //

// Change all age values in spans
function updateAges() {
    var agespans;

    agespans = document.getElementsByClassName("age");

    for (let i = 0; i < agespans.length; i++) {
        span = agespans[i];

        // Get age attribute of span and add 1 day
        let agedate = new Date(span.getAttribute("date"));
        agedate.setDate(agedate.getDate() + 1);

        // Take year difference and set it inside the HTML
        let agediff = new Date(CURRENT_DATE - agedate).getFullYear() - 1970;

        // Show date if tag is flagged
        if (span.hasAttribute("showdate")){
            agedate.setDate(agedate.getDate() - 1);
            span.innerHTML = agediff + " (" + agedate.toLocaleDateString('en-CA') + ")";
        } else {
            span.innerHTML = agediff
        }

        span.classList.remove("age");
    }
}

// Alter footer if body is too big
// NB: DOES NOT EXECUTE
function expandToWindow() {
    var footer, footerwrapper

    footerwrapper = document.getElementById("footer-wrapper");
    footer = document.getElementById("footer");

    // Don't expand if footer hasn't loaded yet
    if (footerwrapper == null || footer == null) {
        return;
    }

    if (document.body.clientHeight > window.innerHeight) {
        footerwrapper.style.position = "relative";
        footer.style.position = "relative";
    } else {
        footerwrapper.style.position = "absolute";
        footer.style.position = "fixed";
    }
}

// ===== FILE HANDLING ===== //

// Read file via XHTTP and use it
function read(_callback, file) {
    // Create an XMLHttpRequest object
    const xhttp = new XMLHttpRequest();

    // On data retreival
    xhttp.onload = function() {
        console.log("Loaded "+file)
        _callback();
    }

    // Send a request
    xhttp.open("GET", file);
    xhttp.send();
    return;
}

// XHTML integration to allow all of the pages to be inserted into eachother (W3 Schools)
function includeHTML(_callback, _fileload=null) {
    var z, i, elmnt, file, xhttp;

    // Loop through a collection of all HTML elements:
    z = document.getElementsByTagName("*");

    for (i = 0; i < z.length; i++) {
        elmnt = z[i];

        // search for elements with a certain atrribute:
        file = elmnt.getAttribute("w3-include-html");

        if (file) {
            // Make an HTTP request using the attribute value as the file name:
            xhttp = new XMLHttpRequest();

            // Wait for state change
            xhttp.onreadystatechange = function() {
                if (this.readyState == 4) {

                    // Catch errors
                    if (this.status == 200) {elmnt.innerHTML = this.responseText;}
                    else if (this.status == 404) {elmnt.innerHTML = "404 Page not found.";}
                    else {
                        elmnt.innerHTML =
                            "There was some unidentified issue stopping the webpage from loading." +
                            "\nError Status: "+this.status;
                    }

                    // Remove the attribute, and call this function once more:
                    elmnt.removeAttribute("w3-include-html");

                    // Recursive call
                    console.log("Loaded "+file);
                    includeHTML(_callback);

                    // Load bones in footer
                    if (file == 'footer.html') {
                        loadBones();
                    }

                    // XHTTP doesn't like async/await, so just do it every time the XHTTP is loaded
                    _callback();
                }
            }

            // Open file
            xhttp.open("GET", file, true);
            xhttp.send();

            // Exit the function:
            return;
        }
    }
}

// ===== HANDY FUNCTIONS ===== //

function setCookie(name, value) {
    document.cookie = name+"="+value+"; path=/index.html";
}

function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    return parts.pop().split(';').shift();
  }

function capitalize(str) {
    return String(str).charAt(0).toUpperCase() + String(str).slice(1);
}

function capitalizeEach(str) {
    let words = str.split(" ");
    for (let i = 0; i < words.length; i++) {
        words[i] = capitalize(words[i])
    }
    return words.join(" ")
}

function formatSection(str) {
    return capitalizeEach(str.replace("-", ": ").replace("_", " "));
}