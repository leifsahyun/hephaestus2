/**
 * Pool systems: ItemPool, HeroPool, MonsterPool, FatePool, AugmentPool
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

  shuffle() {
    this.current = shuffleArray(this.items);
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

  init(cardDataArray) {
    this.cards = cardDataArray.map(d =>
      d.options ? new ModalFateCard(d) : new FateCard(d)
    );
    this.shuffle();
  },

  draw() {
    return this.current.pop() || null;
  },

  peek() {
    return this.current.length > 0 ? this.current[this.current.length - 1] : null;
  },

  shuffle() {
    this.current = shuffleArray(this.cards);
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

  shuffle() {
    this.current = this.augments.slice();
  }
};
