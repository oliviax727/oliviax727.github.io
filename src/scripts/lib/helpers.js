export class Helpers {

    static IDENTITY = () => {};

    // ===== HANDY FUNCTIONS ===== //

    static capitalize(str) {
        return String(str).charAt(0).toUpperCase() + String(str).slice(1);
    }

    static capitalizeEach(str) {
        let words = str.split(" ");
        for (let i = 0; i < words.length; i++) {
            words[i] = Helpers.capitalize(words[i]);
        }
        return words.join(" ");
    }

    static formatSection(str) {
        return Helpers.capitalizeEach(str.replace("-", ": ").replace("_", " "));
    }

    static factrorial(n) {
        let fn = 1;

        for (let i = 2; i <= n; i++) {
            fn *= i;
        }

        return fn;
    }

    static iterateThroughChildren(element, _iterator) {
        var children = element.children;
        for (let i = 0; i < children.length; i++) {
            _iterator(children[i]);
            Helpers.iterateThroughChildren(children[i], _iterator);
        }
    }
}

export class Storer {
    // ===== STORAGE-RELATED FUNCTIONS ===== //

    static setCookie(name, value, path = "/", factorial_age = 11) {
        document.cookie = [
            name + "=" + value,
            "path=" + path,
            "max-age=" + Helpers.factrorial(factorial_age)
        ].join("; ");
    }

    static getCookie(name) {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        return parts.pop().split(';').shift();
    }

    static setURLParams(name, value, navigate=true) {
        const url = new URL(window.location.href);

        url.searchParams.set(name, value);

        if (navigate) {
            window.location.href = url.toString();
        } else {
            window.history.pushState(null, '', url.toString());
        }
    }

    static getURLParams(name) {
        const urlParams = new URLSearchParams(window.location.search);
        const param = urlParams.get(name);

        return param;
    }
}

export class Retriever {
    
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
                Retriever.includeHTML(_recurse, _then);
            }
        }

        Retriever.readHTML(file, recursive_callback);

        // Exit the function:
        return;
    }
}

export class PageData {
    DEFAULT_CRUNCH_SIZE;
    CRUNCH_SIZE;
    CURRENT_DATE;
    SECTION_COLOR_DICT;
    DEFAULT_SECTION;
    CURRENT_SECTION;

    constructor(crunch_size, section, section_color_dict) {
        this.DEFAULT_CRUNCH_SIZE = this.CRUNCH_SIZE = crunch_size;
        this.DEFAULT_SECTION = this.CURRENT_SECTION = section;
        this.SECTION_COLOR_DICT = section_color_dict;
        this.CURRENT_DATE = new Date();
    }
}
