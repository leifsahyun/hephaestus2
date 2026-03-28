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
    { name: "Ajax", type: "hero", baseQuality: 10, baseHubris: 0, augments: [], variant: -1, value: 0 },
    { name: "Hector", type: "hero", baseQuality: 15, baseHubris: 0, augments: [], variant: -1, value: 0 },
    { name: "Achilles", type: "hero", baseQuality: 20, baseHubris: 0, augments: [], variant: -1, value: 0 }
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
  ],

  defaultAugments: [
    {
      name: "Featherweight",
      description: "Refunds Hubris cost on equip. Item is destroyed on use.",
      type: "haft",
      value: 15,
      onEquip: function (battle, item) {
        battle.addHubris(-item.hubrisCost);
      },
      onBattleComplete: function (battle, item) {
        ItemPool.erase(item);
      }
    },
    {
      name: "Hone",
      description: "+1◈ when equipped.",
      type: "edge",
      value: 10,
      onEquip: function (battle, item) {
        item.baseQuality = item.baseQuality + 1;
      },
      onBattleComplete: null
    }
  ]
};
