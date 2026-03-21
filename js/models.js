/**
 * Core data models: Item, Hero, Augment, FateCard
 */

class Item {
  constructor(data) {
    this.name = data.name || data.type || "";
    this.type = data.type || "";
    this.variant = data.variant != null ? data.variant : 0;
    this.chroma = data.chroma || "";
    this.baseQuality = data.baseQuality || 0;
    this.tempQuality = null;
    this.value = data.value || 0;
    this.augments = (data.augments || []).map(a =>
      a instanceof Augment ? a : new Augment(a)
    );
    this.hubris = 0;
  }

  get quality() {
    return this.tempQuality != null ? this.tempQuality : this.baseQuality;
  }

  set quality(val) {
    this.tempQuality = val;
  }

  upgrade() {
    this.value += this.baseQuality;
    if (this.tempQuality == null) this.tempQuality = this.baseQuality;
    this.tempQuality += 5;
    this.baseQuality += 5;
  }

  clone() {
    const data = {
      name: this.name,
      type: this.type,
      variant: this.variant,
      chroma: this.chroma,
      baseQuality: this.baseQuality,
      value: this.value,
      augments: this.augments.map(a => a.clone())
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
    this.chroma = "";
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
      chroma: this.chroma,
      baseQuality: this.baseQuality,
      baseHubris: this.baseHubris,
      value: this.value,
      augments: this.augments.map(a => a.clone())
    };
    return new Hero(data);
  }
}

class Augment {
  constructor(data) {
    this.name = data.name || "";
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
