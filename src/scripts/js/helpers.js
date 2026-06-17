class Helpers {

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
        fn = 1;

        for (let i = 2; i <= n; i++) {
            fn *= i;
        }

        return fn;
    }
}

export default Helpers;