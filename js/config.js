/**
 * Game configuration - defines item types, default data, and forge components.
 * Forge components can be toggled on/off here.
 */
const Config = {
  itemTypes: ["sword", "shield", "helm", "armor", "ring"],

  augmentSlotTypes: ["edge", "haft", "patina", "blessing"],

  forgeComponents: {
    createItem: true,
    upgradeAnvil: true,
    augmentShelf: true
  },

  eventCycles: [["battle", "forge"]],

  minTimelineLength: 10,

  battleRewards: {
    moneyMin: 5,
    moneyMax: 25
  },

  qualitySelector: {
    min: 5,
    max: 20,
    increment: 5
  },

  defaultHeroes: [
    {
      name: "Ajax", type: "hero", baseQuality: 10, baseHubris: 0, variant: -1, value: 0,
      augments: [{
        name: "Bulwark",
        description: "When a shield is equipped, +3◈.",
        type: "hero",
        value: 0,
        onEquip: function (battle, hero) {
          battle.onItemEquippedCallbacks.push(function (b, item) {
            if (item.type === "shield") {
              hero.tempQuality = (hero.tempQuality != null ? hero.tempQuality : hero.baseQuality) + 3;
            }
          });
        },
        onBattleComplete: function (battle, hero) {
          hero.tempQuality = null;
        }
      }]
    },
    {
      name: "Hector", type: "hero", baseQuality: 15, baseHubris: 0, variant: -1, value: 0,
      augments: [{
        name: "Swordmaster",
        description: "When a sword is equipped, +3◈.",
        type: "hero",
        value: 0,
        onEquip: function (battle, hero) {
          battle.onItemEquippedCallbacks.push(function (b, item) {
            if (item.type === "sword") {
              hero.tempQuality = (hero.tempQuality != null ? hero.tempQuality : hero.baseQuality) + 3;
            }
          });
        },
        onBattleComplete: function (battle, hero) {
          hero.tempQuality = null;
        }
      }]
    },
    {
      name: "Achilles", type: "hero", baseQuality: 20, baseHubris: 0, variant: -1, value: 0,
      augments: [{
        name: "Ironclad",
        description: "When armor is equipped, +3◈.",
        type: "hero",
        value: 0,
        onEquip: function (battle, hero) {
          battle.onItemEquippedCallbacks.push(function (b, item) {
            if (item.type === "armor") {
              hero.tempQuality = (hero.tempQuality != null ? hero.tempQuality : hero.baseQuality) + 3;
            }
          });
        },
        onBattleComplete: function (battle, hero) {
          hero.tempQuality = null;
        }
      }]
    }
  ],

  defaultMonsters: {
    1: [
      { name: "Minotaur", type: "monster", baseQuality: 45, augments: [], variant: -1, value: 0 },
      { name: "Hydra", type: "monster", baseQuality: 60, augments: [], variant: -1, value: 0 },
      { name: "Medusa", type: "monster", baseQuality: 20, augments: [], variant: -1, value: 0 }
    ]
  },

  defaultItems: [
    { name: "Sword", type: "sword", baseQuality: 10, augments: [], variant: 0, value: 10, hubrisCost: 5, slots: [{type:"edge"},{type:"edge"},{type:"haft"}] },
    { name: "Shield", type: "shield", baseQuality: 8, augments: [], variant: 0, value: 8, hubrisCost: 4, slots: [{type:"patina"},{type:"haft"},{type:"blessing"}] },
    { name: "Helm", type: "helm", baseQuality: 6, augments: [], variant: 0, value: 6, hubrisCost: 3, slots: [{type:"edge"},{type:"patina"},{type:"blessing"}] },
    { name: "Armor", type: "armor", baseQuality: 12, augments: [], variant: 0, value: 12, hubrisCost: 6, slots: [{type:"patina"},{type:"patina"},{type:"haft"}] },
    { name: "Net", type: "ring", baseQuality: 5, augments: [], variant: 0, value: 5, hubrisCost: 2, slots: [{type:"patina"},{type:"haft"},{type:"haft"}] },
    { name: "Bow", type: "sword", baseQuality: 15, augments: [], variant: 1, value: 15, hubrisCost: 7, slots: [{type:"edge"},{type:"haft"},{type:"haft"}] },
    { name: "Sandals", type: "ring", baseQuality: 7, augments: [], variant: 1, value: 7, hubrisCost: 3, slots: [{type:"haft"},{type:"haft"},{type:"blessing"}] }
  ],

  defaultFateCards: [
    {
      name: "Face Your Foe",
      separatorText: "Face Your Foe",
      options: [
        {
          text: "Recklessness",
          effects: [{ key: "monsterQualityMultiply", amount: 2 }]
        },
        {
          text: "Cowardice",
          effects: [{ key: "drawFateCards", amount: 3 }]
        }
      ]
    },
    {
      name: "Gift of the Gods",
      separatorText: "Gift",
      options: [
        {
          text: "Strength",
          effects: [{ key: "heroQuality", amount: 3 }]
        },
        {
          text: "Favour of the Gods",
          effects: [{ key: "hubris", amount: -3 }]
        }
      ]
    },
    {
      name: "Burden",
      separatorText: "Burden",
      options: [
        {
          text: "Boulder",
          effects: [{ key: "equipBoulder", amount: 1 }, { key: "hubris", amount: 5 }]
        },
        {
          text: "Weakness",
          effects: [{ key: "heroQuality", amount: -5 }]
        }
      ]
    },
    {
      hubrisThreshold: 5,
      options: [
        {
          effects: [{ key: "monsterQuality", amount: 3 }]
        },
        {
          effects: [{ key: "equipBoulder", amount: 1 }]
        }
      ]
    },
    {
      hubrisThreshold: 7,
      options: [
        {
          effects: [{ key: "hubris", amount: 3 }]
        },
        {
          effects: [{ key: "drawFateCards", amount: 1 }]
        }
      ]
    },
    {
      hubrisThreshold: 9,
      options: [
        {
          effects: [{ key: "monsterQuality", amount: 10 }]
        },
        {
          effects: [{ key: "heroQuality", amount: 3 }]
        }
      ]
    },
    {
      hubrisThreshold: 13,
      options: [
        {
          effects: [{ key: "monsterQuality", amount: 10 }, {key: "drawFateCards", amount:1}]
        },
        {
          effects: [{ key: "hubris", amount: -1 }]
        }
      ]
    },
    {
      hubrisThreshold: 14,
      options: [
        {
          effects: [{ key: "monsterQuality", amount: 15 }, {key: "drawFateCards", amount:1}]
        },
        {
          effects: [{ key: "monsterQuality", amount: 3 }]
        }
      ]
    },
    {
      hubrisThreshold: 15,
      options: [
        {
          effects: [{ key: "monsterQualityMultiply", amount: 2 }]
        },
        {
          effects: [{ key: "monsterQuality", amount: 5 }]
        }
      ]
    },
    {
      hubrisThreshold: 16,
      options: [
        {
          effects: [{ key: "drawFateCards", amount: 2 }]
        },
        {
          effects: [{ key: "hubris", amount: -1 }]
        }
      ]
    },
    {
      hubrisThreshold: 20,
      options: [
        {
          effects: [{ key: "monsterQualityMultiply", amount: 2 }, {key: "drawFateCards", amount:1}]
        },
        {
          effects: [{ key: "monsterQuality", amount: 5 }]
        }
      ]
    },
    {
      hubrisThreshold: 21,
      options: [
        {
          effects: [{ key: "drawFateCards", amount: 3 }]
        },
        {
          effects: [{ key: "hubris", amount: -1 }]
        }
      ]
    },
  ],

  fixedFateCards: [
    [0, new HubrisThresholdFateCard({
      name: "Death",
      hubrisThreshold: 1,
      options: [
        {
          effects: [{ key: "monsterQuality", amount: 999999999 }]
        },
        {
          effects: [{ key: "monsterQuality", amount: 666 }]
        }
      ]
    })]
  ]
};
