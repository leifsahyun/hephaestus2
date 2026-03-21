/**
 * Main game entry point.
 * Initializes all pools and starts the timeline.
 */

function initGame() {
  // Initialize pools with default data from config
  ItemPool.init(Config.defaultItems);
  HeroPool.init(Config.defaultHeroes);
  MonsterPool.init(Config.defaultMonsters);
  FatePool.init(Config.defaultFateCards);
  AugmentPool.init(Config.defaultAugments);

  // Initialize UI
  UI.init();

  // Start the timeline
  Timeline.init();
}

document.addEventListener("DOMContentLoaded", initGame);
