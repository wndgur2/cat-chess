import Player from "../state/Player.js";
import { popUp, popDown } from "./Popup.js";
import { SYNERGIES } from "../constants/consts.js";
import { getText } from "../utils.js";

export default class Synergy {
    static instances = {};

    static getSynergy(id) {
        if (Synergy.instances[id]) return Synergy.instances[id];
        else return new Synergy({ id: id });
    }

    constructor(data) {
        this.id = data.id;
        this.desc = SYNERGIES[this.id].desc;
        Synergy.instances[this.id] = this;
    }

    describe(amount = 0) {
        let descs = [];
        let active = -1;
        let i = 0;
        for (const [a, d] of Object.entries(this.desc)) {
            if (amount >= parseInt(a)) active = i;
            descs.push(`${a} : ${getText(d)}`);
            ++i;
        }

        let result = "";
        descs.forEach((d, j) => {
            result = result.concat(
                `<span class=${
                    j === active ? "synergyActive" : "synergyInactive"
                }>${d}</span>`
            );
        });
        return result;
    }

    display(amount = 0) {
        const isActive = amount >= parseInt(Object.keys(this.desc)[0]);
        let synergyEl = document.createElement("div");
        synergyEl.className = "synergy";
        synergyEl.id = this.id;
        synergyEl.style.background = `url(/images/synergies/${this.id}.jpg)`;
        synergyEl.style.backgroundSize = "cover";
        synergyEl.style.backgroundPosition = "center";
        synergyEl.style.border = isActive
            ? "0.14dvh solid #E1C573"
            : "0.14dvh solid #807253";
        synergyEl.style.color = isActive ? "#fff" : "#aaa";

        let synergyName = document.createElement("span");
        synergyName.innerHTML = this.id;
        synergyEl.appendChild(synergyName);

        if (amount > 0) {
            let synergyAmount = document.createElement("span");
            synergyAmount.innerHTML = amount;
            synergyEl.appendChild(synergyAmount);
        }

        // add hover event.
        synergyEl.addEventListener("mouseenter", synergyMouseEnter);
        synergyEl.addEventListener("mouseleave", synergyMouseLeave);

        return synergyEl;
    }
}

function synergyMouseEnter(event) {
    popUp(
        Synergy.getSynergy(event.target.id).describe(
            Player.player.synergies[event.target.id]
                ? Player.player.synergies[event.target.id].length
                : 0
        ),
        event
    );
}

function synergyMouseLeave() {
    popDown();
}
