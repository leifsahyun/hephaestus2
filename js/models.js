/**
 * Core data models: Item, Hero, Augment, FateCard
 */

class Item {
  constructor(data) {
    this.name = data.name || data.type || "";
    this.type = data.type || "";
    this.variant = data.variant != null ? data.variant : 0;
    this.baseQuality = data.baseQuality || 0;
    this.tempQuality = null;
    this.value = data.value || 0;
    this.augments = (data.augments || []).map(a =>
      a instanceof Augment ? a : new Augment(a)
    );
    this.hubris = 0;
    this.hubrisCost = data.hubrisCost != null ? data.hubrisCost : 0;
    this.fateCards = data.fateCards != null ? data.fateCards : null;
    this.counters = data.counters instanceof Map
      ? new Map(data.counters)
      : new Map(Object.entries(data.counters || {}));
    if (data.slots) {
      this.slots = data.slots.map(s => ({
        type: s.type,
        augment: s.augment instanceof Augment ? s.augment : (s.augment ? new Augment(s.augment) : null)
      }));
    } else {
      this.slots = [];
    }
  }

  isType(type) {
    return !!this.allTypes || this.type === type;
  }

  get quality() {
    return this.tempQuality != null ? this.tempQuality : this.baseQuality;
  }

  set quality(val) {
    this.tempQuality = val;
  }

  upgrade() {
    this.value = Math.floor(this.value * 1.5);
    if (this.tempQuality == null) this.tempQuality = this.baseQuality;
    this.tempQuality += 5;
    this.baseQuality += 5;
  }

  clone() {
    const data = {
      name: this.name,
      type: this.type,
      variant: this.variant,
      baseQuality: this.baseQuality,
      value: this.value,
      hubrisCost: this.hubrisCost,
      counters: new Map(this.counters),
      augments: this.augments.map(a => a.clone()),
      slots: this.slots.map(s => ({ type: s.type, augment: s.augment ? s.augment.clone() : null }))
    };
    const item = new Item(data);
    item.tempQuality = this.tempQuality;
    item.hubris = this.hubris;
    return item;
  }
}

class Hero extends Item {
  constructor(data) {
    super(data);
    this.baseHubris = data.baseHubris || 0;
    this.hubris = this.baseHubris;
  }

  reset() {
    this.hubris = this.baseHubris;
    this.tempQuality = null;
  }

  upgrade() {
    this.baseQuality += 3;
    this.baseHubris += 2;
  }

  clone() {
    const data = {
      name: this.name,
      type: this.type,
      variant: this.variant,
      baseQuality: this.baseQuality,
      baseHubris: this.baseHubris,
      value: this.value,
      augments: this.augments.map(a => a.clone()),
      slots: this.slots.map(s => ({ type: s.type, augment: s.augment ? s.augment.clone() : null }))
    };
    return new Hero(data);
  }
}

class Augment {
  constructor(data) {
    this.name = data.name || "";
    this.type = data.type || "";
    this.description = data.description || "";
    this.value = data.value || 0;
    this.onEquipFn = data.onEquip || null;
    this.onBattleCompleteFn = data.onBattleComplete || null;
    this.item = null;
  }

  onAugment(target) {
    this.item = target;
  }

  onEquip(battle, item) {
    if (this.onEquipFn) {
      this.onEquipFn(battle, item);
    }
  }

  onBattleComplete(battle, item) {
    if (this.onBattleCompleteFn) {
      this.onBattleCompleteFn(battle, item);
    }
  }

  clone() {
    return new Augment({
      name: this.name,
      type: this.type,
      description: this.description,
      value: this.value,
      onEquip: this.onEquipFn,
      onBattleComplete: this.onBattleCompleteFn
    });
  }
}

class FateCard {
  constructor(data) {
    this.value = data.value || 0;
    this.suit = data.suit || "";
    this.sign = data.sign || "+";
    this.name = data.name || "";
  }

  toString() {
    return `${this.value}${this.suit[0]} ${this.sign}`;
  }
}

class ModalFateCard {
  constructor(data) {
    if (!data.options || data.options.length !== 2) {
      throw new Error("ModalFateCard requires exactly two options.");
    }
    this.value = 0;
    this.name = data.name || "Choice";
    this.separatorText = data.separatorText || "";
    this.separatorIcon = data.separatorIcon || "ChoiceArrows.png";
    this.options = data.options.map(opt => ({
      text: opt.text || "",
      description: opt.description || "",
      effects: (opt.effects || []).map(e => ({ key: e.key, amount: e.amount != null ? e.amount : 1 })),
      onSelectFn: opt.onSelect || null
    }));
  }

  selectOption(index, battle) {
    const opt = this.options[index];
    if (opt) {
      for (const e of opt.effects) {
        const effectDef = EffectPool.get(e.key);
        if (effectDef) effectDef.apply(battle, e.amount);
      }
      if (opt.onSelectFn) {
        opt.onSelectFn(battle);
      }
    }
  }

  toString() {
    return this.name;
  }
}

class HubrisThresholdFateCard extends ModalFateCard {
  constructor(data) {
    super(data);
    this.hubrisThreshold = data.hubrisThreshold;
    this.separatorIcon = "";
    this.separatorText = `${this.hubrisThreshold}H\u21C5`;
  }

  autoSelectIndex(battle) {
    return battle.hero.hubris >= this.hubrisThreshold ? 0 : 1;
  }
}
