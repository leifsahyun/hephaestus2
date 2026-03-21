/**
 * Battle logic - manages a single battle encounter.
 * Handles equipping items, hubris, rerolling, and resolution.
 */

class Battle {
  constructor(hero, monster) {
    this.hero = hero;
    this.monster = monster;
    this.equippedItems = [];
    this.fateCards = [];
    this.offerItem = null;
    this.resolved = false;

    // Reset hero for new battle
    this.hero.reset();

    // Activate hero augments
    for (const aug of this.hero.augments) {
      aug.onEquip(this, this.hero);
    }

    // Activate monster augments
    for (const aug of this.monster.augments) {
      aug.onEquip(this, this.monster);
    }

    // Shuffle item pool and draw first offer
    ItemPool.shuffle();
    this.rerollFree();
  }

  reroll() {
    this.addHubris(Config.hubrisCosts.reroll);
    this.rerollFree();
  }

  rerollFree() {
    this.offerItem = ItemPool.draw();
  }

  equip() {
    this.addHubris(Config.hubrisCosts.equip);
    this.equipFree();
  }

  equipFree() {
    if (this.offerItem) {
      this.equippedItems.push(this.offerItem);
      for (const aug of this.offerItem.augments) {
        aug.onEquip(this, this.offerItem);
      }
      this.setHeroChroma();
      this.rerollFree();
    }
  }

  setHeroChroma() {
    const chromaCounts = { red: 0, blue: 0, green: 0 };
    for (const item of this.equippedItems) {
      if (item.chroma && chromaCounts[item.chroma] !== undefined) {
        chromaCounts[item.chroma]++;
      }
    }
    const sortedKeys = Object.keys(chromaCounts).sort(
      (a, b) => chromaCounts[b] - chromaCounts[a]
    );
    if (
      sortedKeys.length > 1 &&
      chromaCounts[sortedKeys[0]] > 0 &&
      chromaCounts[sortedKeys[0]] > chromaCounts[sortedKeys[1]]
    ) {
      this.hero.chroma = sortedKeys[0];
    }
  }

  addHubris(amount) {
    this.hero.hubris += amount;
  }

  getExpectedDraw() {
    return Math.max(
      0,
      Math.floor(0.08 * Math.pow(0.1 * this.hero.hubris, 3) + 1.03)
    );
  }

  resolveBattle() {
    this.resolved = true;

    // Draw fate cards
    this.drawFateCards();

    // Calculate strengths
    let heroStrength = this.hero.quality;
    for (const item of this.equippedItems) {
      heroStrength += item.quality;
    }

    let monsterStrength = this.monster.quality;
    for (const card of this.fateCards) {
      monsterStrength += card.value;
    }

    const won = heroStrength >= monsterStrength;

    // Trigger augment battle complete callbacks
    for (const item of this.equippedItems) {
      for (const aug of item.augments) {
        aug.onBattleComplete(this, item);
      }
    }
    for (const aug of this.hero.augments) {
      aug.onBattleComplete(this, this.hero);
    }

    return { won, heroStrength, monsterStrength };
  }

  drawFateCards() {
    FatePool.shuffle();
    const cardsToDraw = this.getExpectedDraw();
    for (let i = 0; i < cardsToDraw; i++) {
      const card = FatePool.draw();
      if (card) this.fateCards.push(card);
    }
  }
}
