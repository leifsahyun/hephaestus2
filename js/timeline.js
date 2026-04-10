/**
 * Timeline and event system.
 * Manages the sequence of battle and forge events.
 */

class TimelineEvent {
  constructor(data) {
    this.name = data.name || "";
    this.description = data.description || "";
    this.sceneType = data.sceneType || "";
  }

  initialize() {}

  execute() {
    Timeline.changeScene(this.sceneType);
  }
}

class BattleTimelineEvent extends TimelineEvent {
  constructor() {
    super({ name: "Battle", sceneType: "battle" });
    this.hero = null;
    this.monster = null;
  }

  initialize() {
    this.hero = HeroPool.draw();
    this.monster = MonsterPool.draw();
    if (this.hero && this.monster) {
      this.description = this.hero.name + " vs. The " + this.monster.name;
    }
  }
}

class ForgeTimelineEvent extends TimelineEvent {
  constructor() {
    super({ name: "Forge", sceneType: "forge" });
    this.description = "The Forge";
  }

  initialize() {}
}

class DialogTimelineEvent extends TimelineEvent {
  constructor(data) {
    super({ name: "Dialog", sceneType: "dialog" });
    this.heroName = data.heroName || "Hephaestus";
    this.heroBaseQuality = data.heroBaseQuality != null ? data.heroBaseQuality : 0;
    this.enemyName = data.enemyName || "Stranger";
    this.enemyBaseQuality = data.enemyBaseQuality != null ? data.enemyBaseQuality : 0;
    this.dialogSteps = (data.dialogSteps || []).map(s => new DialogModalFateCard(s));
  }

  initialize() {
    this.description = "Talk to the " + this.enemyName;
  }
}

const Timeline = {
  eventCycles: [],
  minLength: 10,
  upcomingEvents: [],
  currentEvent: null,
  onSceneChange: null,

  init() {
    this.eventCycles = Config.eventCycles;
    this.minLength = Config.minTimelineLength;
    // Prepend dialog events from config (placed before regular battle/forge cycle)
    const dialogEvents = (Config.defaultDialogEvents || []).map(d => {
      const evt = new DialogTimelineEvent(d);
      evt.initialize();
      return evt;
    });
    this.upcomingEvents = dialogEvents;
    this.populate();
    this.next();
  },

  populate() {
    while (this.upcomingEvents.length < this.minLength) {
      const cycle =
        this.eventCycles[
          Math.floor(Math.random() * this.eventCycles.length)
        ];
      for (const eventType of cycle) {
        let evt;
        if (eventType === "battle") {
          evt = new BattleTimelineEvent();
        } else {
          evt = new ForgeTimelineEvent();
        }
        evt.initialize();
        this.upcomingEvents.push(evt);
      }
    }
  },

  pop() {
    const event = this.upcomingEvents.shift();
    if (this.upcomingEvents.length < this.minLength) {
      this.populate();
    }
    return event;
  },

  push(event) {
    this.upcomingEvents.push(event);
  },

  changeScene(sceneType) {
    if (this.onSceneChange) {
      this.onSceneChange(sceneType);
    }
  },

  next() {
    this.currentEvent = this.pop();
    if (this.currentEvent) {
      this.currentEvent.execute();
    }
  }
};
