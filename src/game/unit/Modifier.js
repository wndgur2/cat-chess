class Modifier {
    constructor(data, duration) {
        this.ad = 0;
        this.speed = 0;
        this.range = 0;
        this.hp = 0;
        this.armor = 0;

        this.adRatio = 1;
        this.speedRatio = 1;
        this.rangeRatio = 1;
        this.hpRatio = 1;
        this.armorRatio = 1;

        for (const [key, value] of Object.entries(data)) this[key] = value;

        this.duration = duration;
        this.leftTime = duration;
    }
}

module.exports = Modifier;
