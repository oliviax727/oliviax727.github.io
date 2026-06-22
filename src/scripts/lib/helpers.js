export class Helpers {

    static IDENTITY = () => {};

    // ===== HANDY FUNCTIONS ===== //

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
