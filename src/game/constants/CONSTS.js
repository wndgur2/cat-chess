const TIME_STEP = process.env.NODE_ENV === "development" ? 60 : 70; // bigger is slower (a step per a TIME_STEP)
const PLAYER_NUM = 2;
const DIRECTIONS = [
    [
        [1, 0],
        [-1, 0],
        [0, 1],
        [0, -1],
        [1, 1],
        [-1, 1],
    ],
    [
        [1, 0],
        [-1, 0],
        [0, 1],
        [0, -1],
        [-1, -1],
        [1, -1],
    ],
];
const SHOP_POSSIBILITIES = [
    [100, 0, 0, 0],
    [90, 10, 0, 0],
    [75, 25, 0, 0],
    [50, 30, 20, 0],
    [30, 40, 29, 1],
    [15, 40, 40, 5],
    [5, 35, 40, 20],
    [0, 25, 35, 40],
];

module.exports = {
    TIME_STEP,
    PLAYER_NUM,
    DIRECTIONS,
    SHOP_POSSIBILITIES,
};
