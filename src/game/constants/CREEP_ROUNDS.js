const CREEP_ROUNDS = {
    1: [
        [null, null, "crab", null, null],
        [null, null, null, null, null],
        [null, null, null, null, null],
    ],
    2: [
        [null, null, "devilCat", null, null],
        [null, null, null, null, null],
        [null, "eel", null, "eel", null],
    ],
    3: [
        [null, "frog", "frog", "frog", null],
        [null, "frog", "frog", "frog", null],
        [null, null, null, null, null],
    ],
    4: [
        [null, "crab", null, "crab", null],
        [null, null, null, null, null],
        ["eel", null, "eel", null, "eel"],
    ],
    5: [
        [null, null, null, null, null],
        [null, null, "mrTerry", null, null],
        [null, null, null, null, null],
    ],
};

Object.freeze(CREEP_ROUNDS);

module.exports = CREEP_ROUNDS;
