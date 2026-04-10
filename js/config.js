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
      { name: "Medusa", type: "monster", baseQuality: 20, fateCards: 5, augments: [], variant: -1, value: 0 },
      {
        name: "Centaur", type: "monster", baseQuality: 25, fateCards: 3, variant: -1, value: 0,
        augments: [{
          name: "Poison Blood",
          description: "Poisons items used against this monster",
          type: "monster",
          value: 0,
          onEquip: function (battle, monster) {
            battle.onItemEquippedCallbacks.push(function (b, item) {
              let poisonedAug = new Augment({
                name: "Poisoned",
                description: "-7◈ next time this item is equipped",
                type: "item",
                value: 0,
                onEquip: function (bat, itm) {
                  itm.tempQuality ??= itm.baseQuality;
                  itm.tempQuality -= 7;
                  const idx = itm.augments.indexOf(poisonedAug);
                  if (idx !== -1) itm.augments.splice(idx, 1);
                }
              });
              item.augments.push(poisonedAug);
            });
          },
          onBattleComplete: function (battle, monster) {}
        }]
      }
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
      heroBaseQuality: 1,
      enemyName: "Farmer",
      enemyBaseQuality: 0,
      initialText: "Ah… Hephaestus, I am glad of your aid on this farm, but soon you may need to venture into the world. Monsters roam the lands and the gods have forsaken us, preferring to squabble amongst themselves. More than that, wars have strained the bonds of the Greeks - should they break, all hope is lost. Perhaps a champion bestowed with your craft could defend those bonds?",
      dialogSteps: [
        {
          name: "Address the Chaos",
          separatorText: "Address the Chaos",
          options: [
            {
              text: "I have a champion",
              response: "Excellent. Arm your chosen champions well… but temper your ambition. Each gift you grant them feeds a quiet pride… a Hubris that calls stronger horrors forth. Keep it below 21 if you value the life of your champion. Here, you will need some items to supply them with: you can take a few spare tools from around the farm, or I'm told a shipment just arrived for you from the King of Sicily!",
              effects: [],
              description: "A hero will always be selected for battle until they fall.",
              onDraw: function() {
                if (!this._champion || !Object.values(HeroPool.current).includes(this._champion)) {
                  this._champion = HeroPool.draw();
                }
                if (this._champion) {
                  this.text = "I have a champion: " + this._champion.name;
                }
              },
              onSelect: function(battle) {
                if (this._champion) {
                  HeroPool.champion = this._champion;
                }
              }
            },
            {
              text: "The bonds of the Greeks are still strong",
              response: "That may be a wise choice... the heroes of this land harbor dark ambition - Hubris that could rival even Zeus himself. Though that ambition may be useful, keep it below 21 until you are ready to challenge the gods themselves. Here, you will need some items to make your way out there: you can take a few spare tools from around the farm, or I'm told a shipment just arrived for you from the King of Sicily!",
              effects: [{ key: "bonds", amount: 2 }]
            }
          ]
        },
        {
          name: "Select Item Pool",
          separatorText: "Select Item Pool",
          options: [
            {
              text: "Farm Implements",
              response: "I hope they are of use to you - they may not look like much but there is a time for even the lowliest tool. Just as the signs of the zodiac follow each other in my almanac, when the stars align with your items their true potential will shine. Fate comes from more than the stars though, in battle lines will be drawn - cards, if you will - and each offers a choice. Some appear kind… most are not. And should your Hubris grow too great, fate will cease offering choices at all, and simply choose your suffering for you.",
              effects: [],
              description: "Receive a small set of modest, reliable tools.",
              onSelect: function(battle) {
                ItemPool.items = [];
                ItemPool.current = [];
                for (let i = 0; i < 15; i++) {
                  ItemPool.addRandomItem(8, 2);
                }
              }
            },
            {
              text: "Shipment From Sicily",
              response: "There are some fine quality items in there, and many aligned with the zodiac. Just as the signs of the zodiac follow each other in my almanac, in due time the true potential of your items will shine. Fate comes from more than the stars though, in battle lines will be drawn - cards, if you will - and each offers a choice. Some appear kind… most are not. And should your Hubris grow too great, fate will cease offering choices at all, and simply choose your suffering for you.",
              effects: [],
              description: "Receive a large shipment of varied, unpredictable items.",
              onSelect: function(battle) {
                ItemPool.items = [];
                ItemPool.current = [];
                for (let i = 0; i < 45; i++) {
                  const isHighValue = Math.random() < 0.15;
                  ItemPool.addRandomItem(isHighValue ? 25 : 10, 8);
                }
              }
            }
          ]
        },
        {
          name: "Response to Fate",
          separatorText: "Response to Fate",
          options: [
            {
              text: "The Fates can suck it",
              response: "Sigh... sometimes I wonder if your head was injured when Zeus threw you off Olympus. Zeus abandoned you just as he has forsaken the rest of Greece. When you leave here, please don't return to Olympus - be the only god to defend the people of this land from the monsters",
              effects: [{ key: "hubris", amount: 5 }],
              onSelect: function(battle) {
                const thresholdCards = FatePool.cards.filter(c => c instanceof HubrisThresholdFateCard);
                const shuffled = shuffleArray(thresholdCards);
                const toCopy = shuffled.slice(0, 3);
                for (const card of toCopy) {
                  const copy = new HubrisThresholdFateCard({
                    name: card.name,
                    hubrisThreshold: card.hubrisThreshold,
                    options: card.options.map(o => ({
                      zodiac: o.zodiac,
                      text: o.text || "",
                      description: o.description || "",
                      effects: o.effects.map(e => ({ key: e.key, amount: e.amount })),
                      onSelect: o.onSelectFn,
                      onDraw: o.onDrawFn
                    }))
                  });
                  FatePool.cards.push(copy);
                }
              }
            },
            {
              text: "I'll be careful",
              response: "Good, the Greeks need you. They have been forsaken by Zeus just as he abandoned you as a child. When you leave here, please don't return to Olympus - be the only god to defend the people of this land from the monsters",
              effects: [],
              description: "Add crossroads cards to the fate pool.",
              onSelect: function(battle) {
                const crossroadsCards = [
                  new ModalFateCard({
                    name: "Trials of the Land",
                    separatorText: "Trials of the Land",
                    options: [
                      {
                        text: "Reckless Charge",
                        zodiac: "aries",
                        effects: [{ key: "monsterQualityMultiply", amount: 2 }]
                      },
                      {
                        text: "Careful Footing",
                        zodiac: "virgo",
                        effects: [{ key: "heroQuality", amount: 3 }]
                      }
                    ]
                  }),
                  new ModalFateCard({
                    name: "Gifts and Burdens",
                    separatorText: "Gifts and Burdens",
                    options: [
                      {
                        text: "Divine Favour",
                        zodiac: "cancer",
                        effects: [{ key: "hubris", amount: -3 }]
                      },
                      {
                        text: "Heavy Load",
                        zodiac: "leo",
                        effects: [{ key: "equipBoulder", amount: 1 }, { key: "hubris", amount: 5 }]
                      }
                    ]
                  }),
                  new ModalFateCard({
                    name: "Fateful Crossing",
                    separatorText: "Fateful Crossing",
                    options: [
                      {
                        text: "Press Forward",
                        zodiac: "gemini",
                        effects: [{ key: "drawFateCards", amount: 2 }]
                      },
                      {
                        text: "Fall Back",
                        zodiac: "scorpio",
                        effects: [{ key: "monsterQuality", amount: 3 }]
                      }
                    ]
                  })
                ];
                for (const card of crossroadsCards) {
                  FatePool.cards.push(card);
                }
              }
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
