/**
 * Battle logic - manages a single battle encounter.
 * Handles equipping items, hubris, and resolution.
 */

class Battle {
  constructor(hero, monster, { skipItemPool = false } = {}) {
    this.hero = hero;
    this.monster = monster;
    this.equippedItems = [];
    this.fateCards = [];
    this.offerItems = [];
    this.resolved = false;
    this.won = false;
    this.onItemEquippedCallbacks = [];
    this.onItemCriticalCallbacks = [];
    this.onZodiacResolvedCallbacks = [];

    // Reset hero for new battle
    this.hero.reset();
    // Reset monster also
    this.monster.tempQuality = this.monster.baseQuality;

    // Activate hero augments
    for (const aug of this.hero.augments) {
      aug.onEquip(this, this.hero);
    }

    // Activate monster augments
    for (const aug of this.monster.augments) {
      aug.onEquip(this, this.monster);
    }

    // Shuffle item pool and draw first three offers
    if (!skipItemPool) {
      ItemPool.shuffle();
      this.drawOffers();
    }
  }

  drawOffers() {
    this.offerItems = [];
    for (let i = 0; i < 3; i++) {
      const item = ItemPool.draw();
      if (item) this.offerItems.push(item);
    }
  }

  selectOffer(item) {
    // Return the other offered items to the pool
    for (const other of this.offerItems) {
      if (other !== item) {
        ItemPool.returnItem(other);
      }
    }
    this.equipItem(item);
    // Draw three new offers
    this.drawOffers();
  }

  equipItem(item) {
    // Equip the chosen item
    this.equippedItems.push(item);
    this.addHubris(item.hubrisCost);
    // Snapshot callbacks registered before this equip so new callbacks added
    // during onEquip (e.g. augments that register item-equipped listeners) don't fire for the current item.
    const callbackSnapshot = this.onItemEquippedCallbacks.slice();
    for (const aug of item.augments) {
      aug.onEquip(this, item);
    }
    for (const cb of callbackSnapshot) {
      cb(this, item);
    }
  }

  addHubris(amount) {
    this.hero.hubris += amount;
  }

  markCritical(item) {
    if (item.critical) return;
    item.critical = true;
    for (const cb of this.onItemCriticalCallbacks) {
      cb(this, item);
    }
  }

  resolveBattle() {
    this.resolved = true;

    // Calculate strengths
    let heroStrength = this.hero.tempQuality != null ? this.hero.tempQuality : this.hero.baseQuality;
    for (const item of this.equippedItems) {
      heroStrength += item.quality;
    }

    let monsterStrength = this.monster.tempQuality != null ? this.monster.tempQuality : this.monster.baseQuality;
    for (const card of this.fateCards) {
      monsterStrength += card.value ?? 0;
    }

    const won = heroStrength >= monsterStrength;
    this.won = won;

    // Trigger augment battle complete callbacks
    for (const item of this.equippedItems) {
      for (const aug of item.augments) {
        aug.onBattleComplete(this, item);
      }
    }
    for (const aug of this.hero.augments) {
      aug.onBattleComplete(this, this.hero);
    }

    // Reset critical status on all equipped items so it doesn't persist to future battles
    for (const item of this.equippedItems) {
      item.critical = false;
    }

    return { won, heroStrength, monsterStrength };
  }

  countUniqueEquippedTypes() {
    const types = new Set();
    var allTypesBonus = 0;
    for (const i of this.equippedItems) {
      if (i.allTypes) { allTypesBonus++; }
      else { types.add(i.type); }
    }
    return types.size + allTypesBonus;
  }

  drawFateCards() {
    FatePool.shuffle();
    const cardsToDraw = this.monster.fateCards ?? 0;
    for (let i = 0; i < cardsToDraw; i++) {
      const card = FatePool.draw();
      if (card) this.fateCards.push(card);
    }
  }
}

class DialogBattle extends Battle {
  constructor(event) {
    const hero = new Hero({
      name: event.heroName,
      type: "hero",
      baseQuality: event.heroBaseQuality,
      baseHubris: 0,
      variant: -1,
      value: 0,
      augments: []
    });
    const enemy = new Item({
      name: event.enemyName,
      type: "monster",
      baseQuality: event.enemyBaseQuality,
      fateCards: 0,
      augments: [],
      variant: -1,
      value: 0
    });
    super(hero, enemy, { skipItemPool: true });
    this.initialText = event.initialText || "";
    this.dialogSteps = event.dialogSteps;
    this.isDialog = true;
  }
}
