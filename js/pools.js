/**
 * Pool systems: ItemPool, HeroPool, MonsterPool, FatePool, AugmentPool, EffectPool
 * These are global singletons managing game resources.
 */

function shuffleArray(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function capitalize(str) {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/** Returns a random integer in the range [-variance, variance]. */
function randomOffset(variance) {
  return Math.round((Math.random() * 2 - 1) * variance);
}

const ItemPool = {
  items: [],
  current: [],

  init(itemDataArray) {
    this.items = itemDataArray.map(d => new Item(d));
    this.shuffle();
  },

  draw() {
    return this.current.pop() || null;
  },

  peek() {
    return this.current.length > 0 ? this.current[this.current.length - 1] : null;
  },

  erase(item) {
    const idx = this.items.indexOf(item);
    if (idx !== -1) this.items.splice(idx, 1);
  },

  returnItem(item) {
    this.current.unshift(item);
  },

  shuffle() {
    this.current = shuffleArray(this.items);
  },

  /**
   * Creates a random Item from a template.
   *
   * @param {object} template  - Partial item data: type, name, variant, slots, zodiacTags.
   * @param {number} value     - Nominal value; drives quality and hubris targets.
   * @param {number} variance  - Spread applied to quality and hubrisCost rolls.
   *                             0 = deterministic targets; higher = wider random range.
   * @returns {Item}
   */
  generateRandomItem(template, value, variance) {
    // Quality is random around the value, clamped to at least 1.
    let baseQuality = Math.max(1, value + randomOffset(variance));

    // HubrisCost targets floor(value / 2); variance spreads the result.
    const hubrisTarget = Math.floor(value / 2);
    const hubrisCost = Math.max(0, hubrisTarget + randomOffset(variance));

    // Copy slots; higher-value items have a proportional chance per slot to receive an augment.
    const slots = (template.slots || []).map(s => ({ type: s.type, augment: null }));
    const augmentChance = Math.min(1, value / 20);
    for (const slot of slots) {
      if (Math.random() < augmentChance) {
        const aug = AugmentPool.draw();
        if (aug) {
          slot.augment = aug;
          // Quality is reduced by the augment's cost.
          baseQuality = Math.max(1, baseQuality - aug.value);
        }
      }
    }

    return new Item({
      name: template.name || capitalize(template.type || "item"),
      type: template.type || "item",
      variant: template.variant != null ? template.variant : 0,
      baseQuality,
      value,
      hubrisCost,
      slots,
      zodiacTags: template.zodiacTags ? template.zodiacTags.slice() : [],
      augments: [],
      counters: {}
    });
  },

  /**
   * Generates a random item and appends it to the pool.
   *
   * @param {object} template - See generateRandomItem.
   * @param {number} value    - See generateRandomItem.
   * @param {number} variance - See generateRandomItem.
   * @returns {Item} The newly added item.
   */
  addRandomItem(template, value, variance) {
    const item = this.generateRandomItem(template, value, variance);
    this.items.push(item);
    this.current.push(item);
    return item;
  }
};

const HeroPool = {
  bonds: 3,
  heroes: [],
  cities: ["Athens", "Sparta", "Troy"],
  current: {},
  remaining: [],

  init(heroDataArray) {
    this.heroes = heroDataArray.map(d => new Hero(d));
    this.remaining = [];
    this.populate();
  },

  draw() {
    const values = Object.values(this.current);
    if (values.length === 0) return null;
    return values[Math.floor(Math.random() * values.length)];
  },

  drawNewHero() {
    if (this.remaining.length === 0) {
      this.remaining = this.heroes.map(h => h.clone());
      this.remaining = shuffleArray(this.remaining);
    }
    return this.remaining.pop();
  },

  erase(hero) {
    for (const key of Object.keys(this.current)) {
      if (this.current[key] === hero) {
        delete this.current[key];
        return;
      }
    }
  },

  populate() {
    for (const c of this.cities) {
      if (!this.current[c]) {
        this.current[c] = this.drawNewHero();
      }
    }
  }
};

const MonsterPool = {
  tier: 1,
  monsters: {},
  current: [],

  init(monsterData) {
    this.monsters = {};
    for (const [tier, monsterArr] of Object.entries(monsterData)) {
      this.monsters[tier] = monsterArr.map(d => new Item(d));
    }
    this.loadTier(this.tier);
  },

  draw() {
    if (this.current.length === 0) {
      this.loadTier(this.tier);
    }
    return this.current.pop();
  },

  erase(monster) {
    const idx = this.current.indexOf(monster);
    if (idx !== -1) this.current.splice(idx, 1);
  },

  loadTier(t) {
    this.tier = t;
    if (this.monsters[t]) {
      this.current = shuffleArray(this.monsters[t]);
    }
  }
};

const FatePool = {
  cards: [],
  current: [],
  fixedCards: new Map(),
  indexed: [],

  init(cardDataArray) {
    this.cards = cardDataArray.map(d => {
      if (d.options && 'hubrisThreshold' in d) return new HubrisThresholdFateCard(d);
      if (d.options) return new ModalFateCard(d);
      return new FateCard(d);
    });
    this.shuffle();
  },

  draw() {
    if (this.fixedCards.has(this.current.length) && !this.indexed.includes(this.current.length)) {
      this.indexed.push(this.current.length);
      return this.fixedCards.get(this.current.length);
    }
    return this.current.pop() || null;
  },

  peek() {
    return this.current.length > 0 ? this.current[this.current.length - 1] : null;
  },

  shuffle() {
    this.indexed = [];
    this.current = shuffleArray(this.cards);
  }
};

const EffectPool = {
  effects: {
    hubris: {
      label(amount) {
        return (amount >= 0 ? "+" : "") + amount + "H";
      },
      color(amount) {
        return amount < 0 ? "#4ecca3" : "#e63946";
      },
      apply(battle, amount) {
        battle.addHubris(amount);
      }
    },
    heroQuality: {
      label(amount) {
        return (amount >= 0 ? "+" : "") + amount + "◈";
      },
      color(amount) {
        return amount > 0 ? "#4ecca3" : "#e63946";
      },
      apply(battle, amount) {
        const base = battle.hero.tempQuality != null ? battle.hero.tempQuality : battle.hero.baseQuality;
        battle.hero.tempQuality = base + amount;
      }
    },
    monsterQuality: {
      label(amount) {
        return (amount >= 0 ? "+" : "") + amount + "◈M";
      },
      color(amount) {
        return amount > 0 ? "#e63946" : "#4ecca3";
      },
      apply(battle, amount) {
        const base = battle.monster.tempQuality != null ? battle.monster.tempQuality : battle.monster.baseQuality;
        battle.monster.tempQuality = base + amount;
      }
    },
    monsterQualityMultiply: {
      label(amount) {
        return "\xD7" + amount + "◈M";
      },
      color(amount) {
        return amount > 1 ? "#e63946" : "#4ecca3";
      },
      apply(battle, amount) {
        const base = battle.monster.tempQuality != null ? battle.monster.tempQuality : battle.monster.baseQuality;
        battle.monster.tempQuality = base * amount;
      }
    },
    drawFateCards: {
      label(amount) {
        return "+" + amount + "▋";
      },
      color(amount) {
        return "#e63946";
      },
      apply(battle, amount) {
        for (let i = 0; i < amount; i++) {
          const card = FatePool.draw();
          if (card) battle.fateCards.push(card);
        }
      }
    },
    equipBoulder: {
      label() {
        return "\u229E5◈";
      },
      color(amount) {
        return "#4ecca3";
      },
      apply(battle) {
        const boulder = new Item({ name: "Boulder", type: "boulder", baseQuality: 5, augments: [] });
        battle.equippedItems.push(boulder);
      }
    }
  },

  get(key) {
    return this.effects[key] || null;
  }
};

const AugmentPool = {
  augments: [],
  current: [],

  init(augmentDataArray) {
    this.augments = augmentDataArray;
    this.shuffle();
  },

  draw() {
    if (this.current.length === 0) return null;
    const idx = Math.floor(Math.random() * this.current.length);
    return new Augment(this.current[idx]);
  },

  sample(n) {
    const pool = this.augments.slice();
    const count = Math.min(n, pool.length);
    for (let i = 0; i < count; i++) {
      const j = i + Math.floor(Math.random() * (pool.length - i));
      [pool[i], pool[j]] = [pool[j], pool[i]];
    }
    return pool.slice(0, count);
  },

  shuffle() {
    this.current = this.augments.slice();
  }
};
