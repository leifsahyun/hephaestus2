/**
 * Battle logic - manages a single battle encounter.
 * Handles equipping items, hubris, and resolution.
 */

class Battle {
  constructor(hero, monster) {
    this.hero = hero;
    this.monster = monster;
    this.equippedItems = [];
    this.fateCards = [];
    this.offerItems = [];
    this.resolved = false;

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
    ItemPool.shuffle();
    this.drawOffers();
  }

  drawOffers() {
    this.offerItems = [];
    for (let i = 0; i < 3; i++) {
      const item = ItemPool.draw();
      if (item) this.offerItems.push(item);
    }
  }

  equipItem(item) {
    // Return the other offered items to the pool
    for (const other of this.offerItems) {
      if (other !== item) {
        ItemPool.returnItem(other);
      }
    }
    // Equip the chosen item
    this.equippedItems.push(item);
    this.addHubris(item.hubrisCost);
    for (const aug of item.augments) {
      aug.onEquip(this, item);
    }
    // Draw three new offers
    this.drawOffers();
  }

  addHubris(amount) {
    this.hero.hubris += amount;
  }

  getExpectedDraw() {
    return Math.max(
      0,
      Math.floor(0.08 * Math.pow(0.1 * (this.hero.hubris + 10), 3) + 1.03)
    );
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
