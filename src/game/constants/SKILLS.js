const Modifier = require("../unit/Modifier");
const { TIME_STEP } = require("./CONSTS");

const INFINITY = 30;
const SKILLS = {
    roar: {
        id: "roar",
        name: "Roar",
        desc: "Stuns 1s enemies around.",
        mp: 70,
        active: true,
        execute: (cat) => {
            const DURATION = 1; // seconds
            const RANGE = 1;
            const TARGET_AMOUNT = INFINITY;

            cat.battleField
                .getNearestUnits(cat, RANGE, TARGET_AMOUNT, false)
                .forEach(({ _, target }) => {
                    target.pushModifier(
                        new Modifier(
                            { speedRatio: 0 },
                            secondToTimeStep(DURATION)
                        )
                    );
                });
        },
    },
    neckBite: {
        id: "neckBite",
        name: "Neck Bite",
        desc: "Bites the neck of the enemy, dealing 200% of AD damage.",
        mp: 50,
        active: true,
        execute: (cat) => {
            const TARGET_AMOUNT = 1;

            cat.battleField
                .getNearestUnits(
                    cat,
                    cat.range,
                    TARGET_AMOUNT,
                    (getAlly = false)
                )
                .forEach(({ _, target }) => {
                    let damage =
                        cat.getStat("ad") * 2 - target.getStat("armor");
                    cat.attack(target, damage);
                });
        },
    },
};

function secondToTimeStep(second) {
    return parseInt((second * 1000) / TIME_STEP);
}

module.exports = SKILLS;
