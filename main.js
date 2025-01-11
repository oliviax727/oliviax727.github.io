// ===== SETUP ===== //

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
    dropdiv.style.visibility = "visible";
}

function hideSubList(section) {
    var dropdiv;

    // Hide list
    dropdiv = document.getElementById("drop-"+section);
    dropdiv.style.visibility = "hidden";
}

// ===== REPEAT LOADING FUNCTIONS ===== //

function initPage() {
    includeHTML(() => {
        updateAges();
        expandToWindow();
    });
}

function loadPage() {
    includeHTML(() => {
        updateAges();
        expandToWindow();
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
function expandToWindow() {
    var footer, footerwrapper

    footerwrapper = document.getElementById("footer-wrapper");
    footer = document.getElementById("footer");

    // Don't expand if footer hasn't loaded yet
    if (footerwrapper == null || footer == null) {
        return;
    }

    if (document.body.clientHeight * 0.9 > window.innerHeight) {
        footerwrapper.style.position = "relative";
        footer.style.position = "relative";
    } else {
        footerwrapper.style.position = "absolute";
        footer.style.position = "fixed";
    }
}

// XHTML integration to allow all of the pages to be inserted into eachother (W3 Schools)
function includeHTML(_callback) {
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
                            "\nError Status: "+this.status
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