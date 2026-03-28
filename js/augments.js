/**
 * Augment definitions - all augments available in the game.
 * Loaded after models.js and config.js, before pools.js and main.js.
 */

const defaultAugments = [
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
    description: "Permanent +1◈ on equip.",
    type: "edge",
    value: 10,
    onEquip: function (battle, item) {
      item.baseQuality = item.baseQuality + 1;
      item.tempQuality = item.tempQuality ? item.tempQuality + 1 : item.baseQuality;
    },
    onBattleComplete: null
  },
  {
    name: "Sisyphus",
    description: "On equip, equip a free Boulder. 50% chance the Boulder also has Sisyphus.",
    type: "blessing",
    value: 12,
    onEquip: function (battle, item) {
      const boulderAugments = [];
      const boulderSlots = [];
      if (Math.random() < 0.5) {
        const sisyphusData = defaultAugments.find(a => a.name === "Sisyphus");
        const aug = new Augment(sisyphusData);
        boulderAugments.push(aug);
        boulderSlots.push({type:"blessing",augment:aug});
      }
      const boulder = new Item({ name: "Boulder", type: "boulder", baseQuality: 5, hubrisCost: 0, augments: boulderAugments, slots: boulderSlots });
      battle.equipItem(boulder);
    },
    onBattleComplete: null
  },
  {
    name: "Foundation",
    description: "When another item is equipped +3◈",
    type: "patina",
    value: 12,
    onEquip: function (battle, item) {
      battle.onItemEquippedCallbacks.push(function (b, equippedItem) {
        item.tempQuality = (item.tempQuality != null ? item.tempQuality : item.baseQuality) + 3;
      });
    },
    onBattleComplete: function (battle, item) {
      item.tempQuality = null;
    }
  },
  {
    name: "Hoplite",
    description: "On equip, +3◈ for each unique item type equipped.",
    type: "patina",
    value: 12,
    onEquip: function (battle, item) {
      const types = new Set(battle.equippedItems.map(i => i.type));
      const bonus = types.size * 3;
      item.tempQuality = (item.tempQuality != null ? item.tempQuality : item.baseQuality) + bonus;
    },
    onBattleComplete: function (battle, item) {
      item.tempQuality = null;
    }
  },
  {
    name: "Sharp",
    description: "+6◈ on equip.",
    type: "edge",
    value: 10,
    onEquip: function (battle, item) {
      item.tempQuality = (item.tempQuality != null ? item.tempQuality : item.baseQuality) + 6;
    },
    onBattleComplete: function (battle, item) {
      item.tempQuality = null;
    }
  },
  {
    name: "Grip",
    description: "-1H on equip.",
    type: "haft",
    value: 8,
    onEquip: function (battle, item) {
      battle.addHubris(-1);
    },
    onBattleComplete: null
  },
  {
    name: "Narcissus",
    description: "Mirrors the effects of each other augment on this item.",
    type: "blessing",
    value: 15,
    onEquip: function (battle, item) {
      const duplicates = item.augments.filter(a => a.name !== "Narcissus").map(a => a.clone());
      for (const dup of duplicates) {
        dup.onEquip(battle, item);
      }
    },
    onBattleComplete: null
  },
  {
    name: "Damocles",
    description: "+5H on equip, then add quality equal to Hubris.",
    type: "blessing",
    value: 12,
    onEquip: function (battle, item) {
      battle.addHubris(5);
      item.tempQuality = (item.tempQuality != null ? item.tempQuality : item.baseQuality) + battle.hero.hubris;
    },
    onBattleComplete: function (battle, item) {
      item.tempQuality = null;
    }
  },
  {
    name: "Glass",
    description: "2x◈, item is destroyed on use.",
    type: "edge",
    value: 12,
    onEquip: function (battle, item) {
      item.tempQuality = (item.tempQuality != null ? item.tempQuality : item.baseQuality) * 2;
    },
    onBattleComplete: function (battle, item) {
      ItemPool.erase(item);
    }
  },
  {
    name: "Prism",
    description: "1.5x◈ for each unique item type equipped. Item is destroyed on use.",
    type: "patina",
    value: 15,
    onEquip: function (battle, item) {
      const types = new Set(battle.equippedItems.map(i => i.type));
      const multiplier = Math.pow(1.5, types.size);
      item.tempQuality = Math.floor((item.tempQuality != null ? item.tempQuality : item.baseQuality) * multiplier);
    },
    onBattleComplete: function (battle, item) {
      ItemPool.erase(item);
    }
  },
  {
    name: "Obsidian",
    description: "On equip, equip 4 Boulders and destroy item.",
    type: "blessing",
    value: 15,
    onEquip: function (battle, item) {
      for (let i = 0; i < 4; i++) {
        const boulder = new Item({ name: "Boulder", type: "boulder", baseQuality: 5, hubrisCost: 0, augments: [] });
        battle.equipItem(boulder);
      }
      battle.equippedItems = battle.equippedItems.filter(i => i !== item);
      ItemPool.erase(item);
    }
  },
  {
    name: "Nike",
    description: "Add quality equal to this item's Glory on equip (wears off after battle). On win, +7 Glory to this item.",
    type: "blessing",
    value: 15,
    onEquip: function (battle, item) {
      item.tempQuality = (item.tempQuality != null ? item.tempQuality : item.baseQuality) + (item.counters.get("glory") || 0);
    },
    onBattleComplete: function (battle, item) {
      item.tempQuality = null;
      if (battle.won) {
        item.counters.set("glory", (item.counters.get("glory") || 0) + 7);
      }
    }
  },
  {
    name: "Lodestone",
    description: "Refund the Hubris cost of the next item equipped if the cost is 3 or less.",
    type: "haft",
    value: 12,
    onEquip: function (battle, item) {
      let fired = false;
      battle.onItemEquippedCallbacks.push(function (b, equippedItem) {
        if (fired) return;
        fired = true;
        if (equippedItem.hubrisCost <= 3) {
          b.addHubris(-equippedItem.hubrisCost);
        }
      });
    },
    onBattleComplete: null
  }
];
