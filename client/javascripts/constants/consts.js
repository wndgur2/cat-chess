const DRAGGING_TYPES = {
    ITEM: "item",
    UNIT: "unit",
};

const SYNERGIES = {
    Poeir: {
        desc: {
            3: {
                en: "Poeir units gain 25% Attack Damage.",
                ko: "포에르 유닛의 공격력이 25% 증가합니다.",
            },
            6: {
                en: "Poeir units gain 50% Attack Damage.",
                ko: "포에르 유닛의 공격력이 50% 증가합니다.",
            },
        },
    },
    Therme: {
        desc: {
            2: {
                en: "Therme units gain 10% Attack Speed.",
                ko: "테르메 유닛의 공격속도가 10% 증가합니다.",
            },
            4: {
                en: "Therme units gain 25% Attack Speed.",
                ko: "테르메 유닛의 공격속도가 25% 증가합니다.",
            },
            6: {
                en: "Therme units gain 50% Attack Speed.",
                ko: "테르메 유닛의 공격속도가 50% 증가합니다.",
            },
        },
    },
    Nature: {
        desc: {
            2: {
                en: "Nature units gain 10% Armor.",
                ko: "네이처 유닛의 방어력이 10% 증가합니다.",
            },
            4: {
                en: "Nature units gain 25% Armor.",
                ko: "네이처 유닛의 방어력이 25% 증가합니다.",
            },
            6: {
                en: "Nature units gain 50% Armor.",
                ko: "네이처 유닛의 방어력이 50% 증가합니다.",
            },
        },
    },
};

const COST_COLORS = {
    1: "#cccccc",
    2: "#33bb11",
    3: "#3366ee",
    4: "#af11af",
    5: "#cccc21",
};

export { DRAGGING_TYPES, COST_COLORS, SYNERGIES };
