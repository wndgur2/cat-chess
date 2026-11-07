const express = require("express");
const router = express.Router();
router.get("/cats", (req, res, next) => {
    const filteredData = filterUnitsByLanguage(
        require("../game/constants/cats.json"),
        req.cookies.lang
    );
    res.json(filteredData);
});
router.get("/creeps", (req, res, next) => {
    const filteredData = filterUnitsByLanguage(
        require("../game/constants/creeps.json"),
        req.cookies.lang
    );
    res.json(filteredData);
});

function filterUnitsByLanguage(data, language) {
    if (!language) language = "en";

    const filteredData = Object.values(data).map((unit) => ({
        ...unit,
        name: unit.name[language] || unit.name.en,
        desc: unit.desc[language] || unit.desc.en,
    }));

    return filteredData;
}

module.exports = router;
