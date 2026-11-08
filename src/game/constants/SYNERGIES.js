const SYNERGIES = {
    Poeir: {
        apply: (unit, amount) => {
            if (amount < 3) return;
            else if (amount < 6) unit.ad *= 1.25;
            else if (amount >= 6) unit.ad *= 1.5;
            unit.ad = Math.floor(unit.ad);
        },
    },
    Therme: {
        apply: (unit, amount) => {
            if (amount < 2) return;
            else if (amount < 4) unit.speed *= 1.1;
            else if (amount < 6) unit.speed *= 1.25;
            else if (amount >= 6) unit.speed *= 1.5;
            unit.speed = Math.floor(unit.speed);
        },
    },
    Nature: {
        apply: (unit, amount) => {
            if (amount < 2) return;
            else if (amount < 4) unit.armor *= 1.1;
            else if (amount < 6) unit.armor *= 1.25;
            else if (amount >= 6) unit.armor *= 1.5;
            unit.armor = Math.floor(unit.armor);
        },
    },
};

module.exports = SYNERGIES;
