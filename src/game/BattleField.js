const { DIRECTIONS } = require("./constants/CONSTS.js");

class BattleField {
    constructor(field) {
        this.field = field;
        this.catsOfPlayer = {};
        this.field.forEach((row, i) => {
            row.forEach((c, j) => {
                if (c == null) return;
                c.battleField = this;
                c.y = i;
                c.x = j;
                c.hp = c.maxHp;
                c.delay = 0;
            });
        });
    }

    getNextMove(cat, target) {
        let visited = [];
        this.field.forEach((row) =>
            visited.push(row.map((c) => c !== null && c.owner === cat.owner))
        );
        let queue = [];
        queue.push([cat.y, cat.x, [(cat.y, cat.x)]]);
        visited[cat.y][cat.x] = true;

        while (queue.length > 0) {
            let [y, x, path] = queue.shift();

            if (y === target.y && x === target.x) return path[1];

            DIRECTIONS[y % 2].forEach(([dy, dx]) => {
                let ny = y + dy,
                    nx = x + dx;
                if (ny < 0 || ny >= 6 || nx < 0 || nx >= 5) return;
                if (visited[ny][nx]) return;
                visited[ny][nx] = true;
                queue.push([ny, nx, [...path, [ny, nx]]]);
            });
        }
    }

    getNearestUnits(cat, range, amount, getAlly = false) {
        let visited = [];
        this.field.forEach((row) => {
            visited.push(row.map((_) => false));
        });
        let queue = [];
        queue.push([cat.y, cat.x, 0]);
        visited[cat.y][cat.x] = true;
        let res = [];

        while (queue.length > 0) {
            let [y, x, distance] = queue.shift();
            if (distance > range) break;
            if (
                this.field[y][x] &&
                (getAlly
                    ? this.field[y][x].owner === cat.owner
                    : this.field[y][x].owner !== cat.owner)
            )
                res.push({ distance, target: this.field[y][x] });
            DIRECTIONS[y % 2].forEach(([dy, dx]) => {
                let ny = y + dy,
                    nx = x + dx;
                if (ny < 0 || ny >= 6 || nx < 0 || nx >= 5) return;
                if (visited[ny][nx]) return;
                visited[ny][nx] = true;
                queue.push([ny, nx, distance + 1]);
            });
        }

        if (res.length > amount) res = res.slice(0, amount);
        return res;
    }

    getFarthestUnits(cat, range, amount, getAlly = false) {}

    getLowestHpUnits(cat, range, amount, getAlly = false) {}

    getCats(playerId = null) {
        let res = [];
        if (playerId == null) {
            this.field.forEach((row) => {
                row.forEach((cat) => {
                    if (cat) res.push(cat);
                });
            });
            return res;
        }

        this.field.forEach((row) => {
            row.forEach((cat) => {
                if (cat && cat.owner === playerId) res.push(cat);
            });
        });
        return res;
    }

    getUnitByUid(uid) {
        let cat;
        this.field.forEach((row) => {
            row.forEach((c) => {
                if (c && c.uid == uid) cat = c;
            });
        });
        return cat;
    }
}

module.exports = BattleField;
