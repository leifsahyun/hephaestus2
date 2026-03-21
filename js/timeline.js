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

const Timeline = {
  eventCycles: [],
  minLength: 10,
  upcomingEvents: [],
  currentEvent: null,
  onSceneChange: null,

  init() {
    this.eventCycles = Config.eventCycles;
    this.minLength = Config.minTimelineLength;
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
