/**
 * Game configuration - defines item types, default data, and forge components.
 * Forge components can be toggled on/off here.
 */
const Config = {
  itemTypes: ["sword", "shield", "helm", "armor", "ring"],

  forgeComponents: {
    createItem: true,
    upgradeAnvil: true,
    augmentShelf: true
  },

  eventCycles: [["battle", "forge"]],

  minTimelineLength: 10,

  hubrisCosts: {
    reroll: 3,
    equip: 10
  },

  qualitySelector: {
    min: 10,
    max: 50,
    increment: 5
  },

  defaultHeroes: [
    { name: "Ajax", type: "hero", baseQuality: 20, baseHubris: 10, chroma: "", augments: [], variant: -1, value: 0 },
    { name: "Hector", type: "hero", baseQuality: 25, baseHubris: 15, chroma: "", augments: [], variant: -1, value: 0 },
    { name: "Achilles", type: "hero", baseQuality: 30, baseHubris: 5, chroma: "", augments: [], variant: -1, value: 0 }
  ],

  defaultMonsters: {
    1: [
      { name: "Goblin", type: "monster", baseQuality: 15, chroma: "green", augments: [], variant: -1, value: 0 },
      { name: "Skeleton", type: "monster", baseQuality: 20, chroma: "", augments: [], variant: -1, value: 0 },
      { name: "Slime", type: "monster", baseQuality: 10, chroma: "blue", augments: [], variant: -1, value: 0 }
    ]
  },

  defaultItems: [
    { name: "Iron Sword", type: "sword", baseQuality: 10, chroma: "red", augments: [], variant: 0, value: 10 },
    { name: "Wooden Shield", type: "shield", baseQuality: 8, chroma: "green", augments: [], variant: 0, value: 8 },
    { name: "Bronze Helm", type: "helm", baseQuality: 6, chroma: "", augments: [], variant: 0, value: 6 },
    { name: "Chain Armor", type: "armor", baseQuality: 12, chroma: "blue", augments: [], variant: 0, value: 12 },
    { name: "Ruby Ring", type: "ring", baseQuality: 5, chroma: "red", augments: [], variant: 0, value: 5 },
    { name: "Steel Sword", type: "sword", baseQuality: 15, chroma: "", augments: [], variant: 1, value: 15 },
    { name: "Tower Shield", type: "shield", baseQuality: 14, chroma: "blue", augments: [], variant: 1, value: 14 },
    { name: "Emerald Ring", type: "ring", baseQuality: 7, chroma: "green", augments: [], variant: 1, value: 7 }
  ],

  defaultFateCards: [
    { value: 1, suit: "Swords", sign: "+", name: "Ace of Swords" },
    { value: 2, suit: "Swords", sign: "+", name: "Two of Swords" },
    { value: 3, suit: "Swords", sign: "+", name: "Three of Swords" },
    { value: 5, suit: "Cups", sign: "+", name: "Five of Cups" },
    { value: 7, suit: "Cups", sign: "+", name: "Seven of Cups" },
    { value: 4, suit: "Wands", sign: "+", name: "Four of Wands" },
    { value: 6, suit: "Wands", sign: "+", name: "Six of Wands" },
    { value: 8, suit: "Pentacles", sign: "+", name: "Eight of Pentacles" },
    { value: 10, suit: "Pentacles", sign: "+", name: "Ten of Pentacles" },
    { value: 12, suit: "Stars", sign: "+", name: "Twelve of Stars" }
  ],

  defaultAugments: [
    {
      name: "Featherweight",
      description: "Refunds Hubris cost on equip. Item is destroyed on use.",
      value: 15,
      onEquip: function (battle, item) {
        battle.addHubris(-Config.hubrisCosts.equip);
      },
      onBattleComplete: function (battle, item) {
        ItemPool.erase(item);
      }
    },
    {
      name: "Sharpened",
      description: "Adds +3 quality when equipped.",
      value: 10,
      onEquip: function (battle, item) {
        item.tempQuality = (item.tempQuality || item.baseQuality) + 3;
      },
      onBattleComplete: null
    }
  ]
};
