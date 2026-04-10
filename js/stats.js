/**
 * Run statistics tracking and history persistence.
 */

const RunStats = {
  highestHeroScore: 0,
  highestMonsterQuality: 0,
  hubrisValues: [],
  monstersDefeated: 0,
  totalMoneyEarned: 0,
  equippedItemCounts: null, // Map<Item, number>
  bondsRemaining: 0,

  init() {
    this.highestHeroScore = 0;
    this.highestMonsterQuality = 0;
    this.hubrisValues = [];
    this.monstersDefeated = 0;
    this.totalMoneyEarned = 0;
    this.equippedItemCounts = new Map();
    this.bondsRemaining = 0;
  },

  recordBattle(battle, result) {
    if (result.heroStrength > this.highestHeroScore) {
      this.highestHeroScore = result.heroStrength;
    }
    if (result.monsterStrength > this.highestMonsterQuality) {
      this.highestMonsterQuality = result.monsterStrength;
    }
    this.hubrisValues.push(battle.hero.hubris);
    if (result.won) {
      this.monstersDefeated++;
    }
    for (const item of battle.equippedItems) {
      const count = this.equippedItemCounts.get(item) || 0;
      this.equippedItemCounts.set(item, count + 1);
    }
  },

  recordMoney(amount) {
    if (amount > 0) {
      this.totalMoneyEarned += amount;
    }
  },

  _medianHubris() {
    if (this.hubrisValues.length === 0) return 0;
    const sorted = this.hubrisValues.slice().sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 !== 0
      ? sorted[mid]
      : (sorted[mid - 1] + sorted[mid]) / 2;
  },

  _topEquippedItems() {
    const entries = Array.from(this.equippedItemCounts.entries());
    entries.sort((a, b) => b[1] - a[1]);
    return entries.slice(0, 3).map(([item, count]) => ({
      name: item.name,
      quality: item.quality,
      augments: item.augments.map(a => a.name),
      count
    }));
  },

  finalize(bondsRemaining) {
    this.bondsRemaining = bondsRemaining;
  },

  getSummary() {
    return {
      highestHeroScore: this.highestHeroScore,
      highestMonsterQuality: this.highestMonsterQuality,
      medianHubris: this._medianHubris(),
      monstersDefeated: this.monstersDefeated,
      totalMoneyEarned: this.totalMoneyEarned,
      topEquippedItems: this._topEquippedItems(),
      bondsRemaining: this.bondsRemaining,
      timestamp: Date.now()
    };
  },

  saveToHistory() {
    const summary = this.getSummary();
    const history = RunStats.loadHistory();
    history.unshift(summary);
    localStorage.setItem("hephaestus_history", JSON.stringify(history.slice(0, 20)));
    return summary;
  },

  loadHistory() {
    try {
      return JSON.parse(localStorage.getItem("hephaestus_history") || "[]");
    } catch (e) {
      return [];
    }
  }
};
