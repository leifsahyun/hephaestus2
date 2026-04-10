/**
 * Game configuration - defines item types, default data, and forge components.
 * Forge components can be toggled on/off here.
 */
const Config = {
  itemTypes: ["sword", "spear", "bow", "tool", "shield", "helm", "armor", "sandals"],
  /*
  * Some typical item slots for these types should be:
  * sword, spear, bow: 2 edge, 1 blessing/patina/haft
  * tool, sandals: 1 haft, 1 patina, 1 edge/blessing
  * helm, armor, shield: 2 patina, 1 edge/blessing/haft
  */

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
        description: "+3◈ per shield equipped.",
        type: "hero",
        value: 0,
        onEquip: function (battle, hero) {
          battle.onItemEquippedCallbacks.push(function (b, item) {
            if (item.isType("shield")) {
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
      name: "Agamemnon", type: "hero", baseQuality: 5, baseHubris: 0, variant: -1, value: 0,
      augments: [{
        name: "Armaments",
        description: "+3◈ per unique item type equipped.",
        type: "hero",
        value: 0,
        onEquip: function (battle, hero) {
          battle.onItemEquippedCallbacks.push(function (b, item) {
            hero.tempQuality = hero.baseQuality + b.countUniqueEquippedTypes() * 3;
          });
        },
        onBattleComplete: function (battle, hero) {
          hero.tempQuality = null;
        }
      }]
    },
    {
      name: "Achilles", type: "hero", baseQuality: 0, baseHubris: 0, variant: -1, value: 0,
      augments: [{
        name: "Nearly Invulnerable",
        description: "-20◈ while barefoot.",
        type: "hero",
        value: 0,
        onEquip: function (battle, hero) {
          battle.onItemEquippedCallbacks.push(function (b, item) {
            if (item.isType("sandals")) {
              hero.tempQuality = 20;
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
      { name: "Minotaur", type: "monster", baseQuality: 45, fateCards: 3, augments: [], variant: -1, value: 0 },
      { name: "Hydra", type: "monster", baseQuality: 60, fateCards: 2, augments: [], variant: -1, value: 0 },
      { name: "Medusa", type: "monster", baseQuality: 20, fateCards: 5, augments: [], variant: -1, value: 0 }
    ]
  },

  cloakedFigure: { name: "Cloaked Figure", type: "monster", baseQuality: 100, fateCards: 4, augments: [], variant: -1, value: 0 },

  defaultItems: [
    { name: "Sword", type: "sword", baseQuality: 15, augments: [], variant: 0, value: 10, hubrisCost: 7, slots: [{type:"edge"},{type:"edge"},{type:"blessing"}], zodiacTags: ["aries"] },
    { name: "Spear", type: "spear", baseQuality: 10, augments: [], variant: 0, value: 10, hubrisCost: 5, slots: [{type:"edge"},{type:"edge"},{type:"patina"}], zodiacTags: ["sagittarius"] },
    { name: "Bow", type: "bow", baseQuality: 9, augments: [], variant: 1, value: 15, hubrisCost: 4, slots: [{type:"edge"},{type:"edge"},{type:"haft"}], zodiacTags: ["gemini", "leo"] },
    { name: "Shield", type: "shield", baseQuality: 8, augments: [], variant: 0, value: 8, hubrisCost: 4, slots: [{type:"patina"},{type:"patina"},{type:"haft"}], zodiacTags: ["taurus"] },
    { name: "Helm", type: "helm", baseQuality: 6, augments: [], variant: 0, value: 6, hubrisCost: 3, slots: [{type:"patina"},{type:"patina"},{type:"edge"}], zodiacTags: ["cancer"] },
    { name: "Armor", type: "armor", baseQuality: 12, augments: [], variant: 0, value: 12, hubrisCost: 6, slots: [{type:"patina"},{type:"patina"},{type:"blessing"}], zodiacTags: ["capricorn"] },
    { name: "Net", type: "tool", baseQuality: 5, augments: [], variant: 0, value: 5, hubrisCost: 2, slots: [{type:"haft"},{type:"patina"},{type:"edge"}], zodiacTags: ["pisces"] },
    { name: "Sandals", type: "sandals", baseQuality: 7, augments: [], variant: 1, value: 7, hubrisCost: 3, slots: [{type:"haft"},{type:"patina"},{type:"blessing"}], zodiacTags: ["virgo"] }
  ],

  defaultFateCards: [
    {
      name: "Face Your Foe",
      separatorText: "Face Your Foe",
      options: [
        {
          text: "Recklessness",
          zodiac: "aries",
          effects: [{ key: "monsterQualityMultiply", amount: 2 }]
        },
        {
          text: "Cowardice",
          zodiac: "taurus",
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
          zodiac: "gemini",
          effects: [{ key: "heroQuality", amount: 3 }]
        },
        {
          text: "Favour of the Gods",
          zodiac: "cancer",
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
          zodiac: "leo",
          effects: [{ key: "equipBoulder", amount: 1 }, { key: "hubris", amount: 5 }]
        },
        {
          text: "Weakness",
          zodiac: "virgo",
          effects: [{ key: "heroQuality", amount: -5 }]
        }
      ]
    },
    {
      hubrisThreshold: 5,
      options: [
        {
          zodiac: "libra",
          effects: [{ key: "monsterQuality", amount: 3 }]
        },
        {
          zodiac: "scorpio",
          effects: [{ key: "equipBoulder", amount: 1 }]
        }
      ]
    },
    {
      hubrisThreshold: 7,
      options: [
        {
          zodiac: "sagittarius",
          effects: [{ key: "hubris", amount: 3 }]
        },
        {
          zodiac: "capricorn",
          effects: [{ key: "drawFateCards", amount: 1 }]
        }
      ]
    },
    {
      hubrisThreshold: 9,
      options: [
        {
          zodiac: "aquarius",
          effects: [{ key: "monsterQuality", amount: 10 }]
        },
        {
          zodiac: "pisces",
          effects: [{ key: "heroQuality", amount: 3 }]
        }
      ]
    },
    {
      hubrisThreshold: 13,
      options: [
        {
          zodiac: "aries",
          effects: [{ key: "monsterQuality", amount: 10 }, {key: "drawFateCards", amount:1}]
        },
        {
          zodiac: "taurus",
          effects: [{ key: "hubris", amount: -1 }]
        }
      ]
    },
    {
      hubrisThreshold: 14,
      options: [
        {
          zodiac: "gemini",
          effects: [{ key: "monsterQuality", amount: 15 }, {key: "drawFateCards", amount:1}]
        },
        {
          zodiac: "cancer",
          effects: [{ key: "monsterQuality", amount: 3 }]
        }
      ]
    },
    {
      hubrisThreshold: 15,
      options: [
        {
          zodiac: "leo",
          effects: [{ key: "monsterQualityMultiply", amount: 2 }]
        },
        {
          zodiac: "virgo",
          effects: [{ key: "monsterQuality", amount: 5 }]
        }
      ]
    },
    {
      hubrisThreshold: 16,
      options: [
        {
          zodiac: "libra",
          effects: [{ key: "drawFateCards", amount: 2 }]
        },
        {
          zodiac: "scorpio",
          effects: [{ key: "hubris", amount: -1 }]
        }
      ]
    },
    {
      hubrisThreshold: 20,
      options: [
        {
          zodiac: "sagittarius",
          effects: [{ key: "monsterQualityMultiply", amount: 2 }, {key: "drawFateCards", amount:1}]
        },
        {
          zodiac: "capricorn",
          effects: [{ key: "monsterQuality", amount: 5 }]
        }
      ]
    },
    {
      hubrisThreshold: 21,
      options: [
        {
          zodiac: "aquarius",
          effects: [{ key: "drawFateCards", amount: 3 }]
        },
        {
          zodiac: "pisces",
          effects: [{ key: "hubris", amount: -1 }]
        }
      ]
    },
  ],

  defaultDialogEvents: [
    {
      heroName: "Hephaestus",
      heroBaseQuality: 0,
      enemyName: "Farmer",
      enemyBaseQuality: 3,
      dialogSteps: [
        {
          statement: "Good morrow, stranger! What brings the god of the forge to my humble farm?",
          name: "Greeting",
          separatorText: "Greeting",
          options: [
            {
              text: "I seek news of the monsters plaguing this land.",
              effects: [{ key: "heroQuality", amount: 2 }]
            },
            {
              text: "I am merely passing through, farmer.",
              effects: []
            }
          ]
        },
        {
          statement: "The Minotaur's minions have been raiding our fields. Surely a god can help us?",
          name: "Plea",
          separatorText: "Plea",
          options: [
            {
              text: "I shall forge weapons for your defenders.",
              effects: [{ key: "heroQuality", amount: 3 }]
            },
            {
              text: "I cannot promise anything.",
              effects: [{ key: "hubris", amount: 2 }]
            }
          ]
        }
      ]
    }
  ],

  fixedFateCards: [
    [0, new HubrisThresholdFateCard({
      name: "Death",
      hubrisThreshold: 1,
      options: [
        {
          zodiac: "aries",
          effects: [{ key: "monsterQuality", amount: 999999 }]
        },
        {
          zodiac: "taurus",
          effects: [{ key: "monsterQuality", amount: 666 }]
        }
      ]
    })]
  ]
};
