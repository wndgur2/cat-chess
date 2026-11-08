const Unit = require("./Unit");
const CATS = require("../constants/cats.json");

class SimpleCat extends Unit {
    static prototypes = CATS;

    static getRandomCatType(cost) {
        let candidates;
        if (cost)
            candidates = Object.values(SimpleCat.prototypes).filter(
                (cat) => cat.cost === cost
            );
        else candidates = Object.values(SimpleCat.prototypes);
        return candidates[Math.floor(Math.random() * candidates.length)];
    }

    constructor(id, player, x, y, tier = 1) {
        super(SimpleCat.prototypes[id], player.id, x, y, tier);
    }
}

module.exports = SimpleCat;
