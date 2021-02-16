const axios = require("axios")
const config = require("../config.js");

module.exports = {
    getLanguage(usersDB) {
        if (usersDB) {
            if (usersDB.lang) {
                let language = require(`../language/${usersDB.lang}.json`)
                return language
            } else {
                let language = require(`../language/en.json`)
                return language
            }
        } else {
            let language = require(`../language/en.json`)
            return language
        }
    },
};
