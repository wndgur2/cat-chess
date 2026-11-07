const ITEMS = require("./constants/ITEMS");

class Item {
    static getRandomItem() {
        let candidates = Object.keys(ITEMS);
        return new Item(
            candidates[Math.floor(Math.random() * candidates.length)]
        );
    }

    constructor(id) {
        let proto = ITEMS[id];
        this.id = id;
        this.name = proto.name;
        this.desc = proto.desc;
        this.img = proto.img;

        this.ad = proto.ad ? proto.ad : 0;
        this.hp = proto.hp ? proto.hp : 0;
        this.armor = proto.armor ? proto.armor : 0;
        this.range = proto.range ? proto.range : 0;
        this.speed = proto.speed ? proto.speed : 0;
    }
}

module.exports = Item;
