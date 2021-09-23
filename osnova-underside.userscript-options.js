const path = require("path");


module.exports = {
	entry: path.join(__dirname, "osnova-underside.dev.js"),
	filename: "osnova-underside.js",
	path: __dirname,
	headers: {
		"name":         "Osnova Underside",
		"version":      "1.3.0-R (2021-09-23)",
		"author":       "serguun42 - frontend, qq - backend",
		"icon":         "https://serguun42.ru/resources/osnova_icons/tj.site.logo_256x256.png",
		"icon64":       "https://serguun42.ru/resources/osnova_icons/tj.site.logo_64x64.png",
		"match":        ["https://tjournal.ru/*", "https://dtf.ru/*", "https://vc.ru/*"],
		"updateURL":    "https://serguun42.ru/tampermonkey/osnova-underside/osnova-underside.js",
		"downloadURL":  "https://serguun42.ru/tampermonkey/osnova-underside/osnova-underside.js",
		"run-at":       "document-start",
		"grant":        "GM_xmlhttpRequest",
		"connect":		"underside.tjcache.pw",
		"license":      "https://creativecommons.org/licenses/by-nc/4.0/legalcode",
		"description":  "Hide it and find it!",
		"website":      ["https://tjournal.ru/199990", "https://tjcache.pw/"],
		"homepage":     "https://tjournal.ru/199990",
		"supportURL":   "https://tjournal.ru/m/99944"
	}
}
