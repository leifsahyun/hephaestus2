/**
 * Main game entry point.
 * Initializes all pools and starts the timeline.
 */

const PlayerState = {
  money: 0,
  bonds: 0,

  init() {
    this.money = 10;
    this.bonds = 10;
  },

  addMoney(amount) {
    this.money += amount;
    UI.updatePlayerStats();
  },

  awardBattleReward() {
    const min = Config.battleRewards.moneyMin;
    const max = Config.battleRewards.moneyMax;
    const earned = Math.floor(Math.random() * (max - min + 1)) + min;
    this.addMoney(earned);
    return earned;
  },

  removeBond() {
    this.bonds -= 1;
    UI.updatePlayerStats();
  }
};

function initGame() {
  // Initialize player state
  PlayerState.init();

  // Initialize pools with default data from config
  ItemPool.init(Config.defaultItems);
  HeroPool.init(Config.defaultHeroes);
  MonsterPool.init(Config.defaultMonsters);
  FatePool.init(Config.defaultFateCards);
  AugmentPool.init(Config.defaultAugments);

  // Initialize UI
  UI.init();
  UI.updatePlayerStats();

  // Start the timeline
  Timeline.init();
}

document.addEventListener("DOMContentLoaded", initGame);
