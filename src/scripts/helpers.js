class Helpers {
    // ===== HANDY FUNCTIONS ===== //

    static setCookie(name, value) {
        document.cookie = name + "=" + value + "; path=/";
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
            words[i] = Helpers.capitalize(words[i])
        }
        return words.join(" ")
    }

    static formatSection(str) {
        return Helpers.capitalizeEach(str.replace("-", ": ").replace("_", " "));
    }
}

export default Helpers