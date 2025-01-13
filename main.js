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
}

function createAutoMiner() {
    // Get bone counter footer element, requires 100 bones
    let bones = document.getElementById("count-bones");

    // Get buttons
    let createbutton = document.getElementById("create-auto");
    let upgradebutton = document.getElementById("upgrade-auto");
    let level = document.getElementById("count-level");

    if (bones.innerHTML >= 100) {
        console.log("Creating Miner ...");
        bones.innerHTML = parseInt(bones.innerHTML) - 100;
        timer = window.setInterval(dig4Bones, timerinterval);
        createbutton.hidden = true;
        upgradebutton.hidden = false;
        level.innerHTML = 1;
    }
}

function upgradeAutoMiner() {
    // Get gold counter footer element, requires 1 gold
    let bones = document.getElementById("count-bones");
    let gold = document.getElementById("count-gold");
    let level = document.getElementById("count-level");

    if (gold.innerHTML >= 1 && bones.innerHTML >= 500) {
        if (timerinterval <= 100){
            timerinterval = 1;
            alert("Miner Fully Upgraded!");
            document.getElementById("upgrade-auto").hidden = true;
        } else {
            timerinterval -= 100;
        }

        console.log("Upgrading Miner ...");

        level.innerHTML = parseInt(level.innerHTML) + 1;
        gold.innerHTML = parseInt(gold.innerHTML) - 1;
        bones.innerHTML = parseInt(bones.innerHTML) - 500;
        window.clearInterval(timer)
        timer = window.setInterval(dig4Bones, timerinterval);

        if (level.innerHTML == 11) {
            level.innerHTML = "Max"
        }
    }
}

// ===== ACTIVE UPDATING ===== //

// Change/update section
function changeSection(section) {
    var contentdiv, sectionname;

    // Get contentdiv, remove internal components, and then add includeHTML attribute
    contentdiv = document.getElementById("content");
    contentdiv.innerHTML = "";
    contentdiv.setAttribute("w3-include-html", "html-files/"+section+".html");

    // Change cosmetics in ribbon
    sectionname = document.getElementById("sectionname");
    sectionname.innerHTML = formatSection(section);
    document.getElementById("title").style.backgroundColor = SECTION_COLOR_DICT.get(section)[0];

    // Call includeHTML (load page) and exit
    loadPage();
}

function showSubList(section) {
    var dropdiv;

    // Show dropdown div (CSS should already fix it to the right position)
    dropdiv = document.getElementById("drop-"+section);
    dropdivwrap = document.getElementById("drop-wrapper-"+section);
    dropdivwrap.hidden = false;
    dropdiv.hidden = false;
}

function hideSubList(section) {
    var dropdiv;

    // Hide list
    dropdiv = document.getElementById("drop-"+section);
    dropdivwrap = document.getElementById("drop-wrapper-"+section);
    dropdivwrap.hidden = true;
    dropdiv.hidden = true;
}

// ===== REPEAT LOADING FUNCTIONS ===== //

function initPage() {
    includeHTML(() => {
        updateAges();
        if (document.getElementById("footer") != null){
            //expandToWindow();
        }
        
    });
}

function loadPage() {
    includeHTML(() => {
        updateAges();
        if (document.getElementById("footer") != null){
            //expandToWindow();
        }
    });
}

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

// Change ribbon to Sidebar if webpage is too small
function crunchRibbon() {

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