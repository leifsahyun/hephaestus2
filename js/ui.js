/**
 * UI rendering for battle and forge screens.
 */

const UI = {
  currentScreen: null,

  init() {
    Timeline.onSceneChange = (sceneType) => {
      if (sceneType === "battle") {
        this.showBattle();
      } else if (sceneType === "forge") {
        this.showForge();
      }
    };
  },

  getApp() {
    return document.getElementById("app");
  },

  clearApp() {
    this.getApp().innerHTML = "";
  },

  // ── Battle Screen ──

  showBattle() {
    this.currentScreen = "battle";
    this.clearApp();
    const event = Timeline.currentEvent;
    if (!event || !event.hero || !event.monster) {
      this.getApp().innerHTML = "<p>No battle event available.</p>";
      return;
    }

    const battle = new Battle(event.hero, event.monster);
    const app = this.getApp();

    const container = document.createElement("div");
    container.className = "battle-screen";

    // Title
    const title = document.createElement("h2");
    title.className = "screen-title";
    title.textContent = event.description;
    container.appendChild(title);

    // Main layout
    const layout = document.createElement("div");
    layout.className = "battle-layout";

    // Left: Hero card + Equipped Items
    const heroSection = document.createElement("div");
    heroSection.className = "battle-section hero-section";
    heroSection.innerHTML = "<h3>Hero</h3>";
    const heroCard = this.renderItemCard(battle.hero, true);
    heroCard.id = "hero-card";
    heroSection.appendChild(heroCard);

    // Equipped items (under hero card)
    const equippedArea = document.createElement("div");
    equippedArea.className = "equipped-area";
    equippedArea.innerHTML = "<h3>Equipped Items</h3>";
    const equippedList = document.createElement("div");
    equippedList.id = "equipped-list";
    equippedList.className = "equipped-list";
    equippedArea.appendChild(equippedList);
    heroSection.appendChild(equippedArea);

    layout.appendChild(heroSection);

    // Center: Fate Cards section (populated when battle is resolved)
    const fateCardsSection = document.createElement("div");
    fateCardsSection.className = "battle-section fate-cards-section";
    const fateCardsDisplay = document.createElement("div");
    fateCardsDisplay.id = "fate-cards-display";
    fateCardsDisplay.className = "fate-cards-display";
    fateCardsSection.appendChild(fateCardsDisplay);

    layout.appendChild(fateCardsSection);

    // Right: Monster card + Expected stats
    const monsterSection = document.createElement("div");
    monsterSection.className = "battle-section monster-section";
    monsterSection.innerHTML = "<h3>Monster</h3>";
    const monsterCard = this.renderItemCard(battle.monster, false);
    monsterCard.id = "monster-card";
    monsterSection.appendChild(monsterCard);

    // Expected stats
    const expectedStats = document.createElement("div");
    expectedStats.id = "expected-stats";
    expectedStats.className = "expected-stats";
    monsterSection.appendChild(expectedStats);
    layout.appendChild(monsterSection);

    // Offered item area (in layout row 2, col 2)
    const offerArea = document.createElement("div");
    offerArea.className = "offer-area";
    offerArea.innerHTML = "<h3>Offered Item</h3>";

    // Wrapper so the card and buttons share the same width
    const offerContent = document.createElement("div");
    offerContent.className = "offer-content";

    const offerCard = document.createElement("div");
    offerCard.id = "offer-card";
    offerContent.appendChild(offerCard);

    // Action buttons
    const actions = document.createElement("div");
    actions.className = "battle-actions";

    const equipBtn = document.createElement("button");
    equipBtn.className = "btn btn-equip";
    equipBtn.textContent = `Equip (+${Config.hubrisCosts.equip} Hubris)`;
    equipBtn.addEventListener("click", () => {
      battle.equip();
      this.updateBattleUI(battle);
    });

    const rerollBtn = document.createElement("button");
    rerollBtn.className = "btn btn-reroll";
    rerollBtn.textContent = `Reroll (+${Config.hubrisCosts.reroll} Hubris)`;
    rerollBtn.addEventListener("click", () => {
      battle.reroll();
      this.updateBattleUI(battle);
    });

    const fightBtn = document.createElement("button");
    fightBtn.className = "btn btn-fight";
    fightBtn.textContent = "Fight!";
    fightBtn.addEventListener("click", () => {
      equipBtn.disabled = true;
      rerollBtn.disabled = true;
      fightBtn.disabled = true;
      const result = battle.resolveBattle();
      this.showFateCards(battle.fateCards, battle, () => {
        this.showBattleResult(result, battle);
      });
    });

    actions.appendChild(equipBtn);
    actions.appendChild(rerollBtn);
    actions.appendChild(fightBtn);
    offerContent.appendChild(actions);
    offerArea.appendChild(offerContent);
    layout.appendChild(offerArea);

    // Battle log (in layout row 2, col 3)
    const logArea = document.createElement("div");
    logArea.id = "battle-log";
    logArea.className = "battle-log battle-section";
    layout.appendChild(logArea);

    container.appendChild(layout);

    app.appendChild(container);

    this.updateBattleUI(battle);
  },

  updateBattleUI(battle) {
    // Update hero card
    const heroCard = document.getElementById("hero-card");
    if (heroCard) {
      const newHeroCard = this.renderItemCard(battle.hero, true);
      newHeroCard.id = "hero-card";
      heroCard.replaceWith(newHeroCard);
    }

    // Update offer card
    const offerCard = document.getElementById("offer-card");
    if (offerCard) {
      offerCard.innerHTML = "";
      if (battle.offerItem) {
        offerCard.appendChild(this.renderItemCard(battle.offerItem, false));
      } else {
        offerCard.innerHTML =
          '<div class="card empty-card">No items available</div>';
      }
    }

    // Update equipped list
    const equippedList = document.getElementById("equipped-list");
    if (equippedList) {
      equippedList.innerHTML = "";
      for (const item of battle.equippedItems) {
        equippedList.appendChild(this.renderCompactItemCard(item));
      }
    }

    // Update expected stats
    this.updateExpectedStats(battle);
  },

  updateExpectedStats(battle) {
    const el = document.getElementById("expected-stats");
    if (!el) return;
    const expectedDraw = battle.getExpectedDraw();
    const minQ = battle.monster.quality + expectedDraw;
    const maxQ = battle.monster.quality + 12 * expectedDraw;
    el.innerHTML = `
      <div class="stat-box">
        <h4>Expected Monster Strength</h4>
        <div class="stat-row"><span class="stat-icon">▋</span> ${expectedDraw} fate cards</div>
        <div class="stat-row"><span class="stat-icon">◈</span> ${minQ} - ${maxQ} quality</div>
      </div>
    `;
  },

  showFateCards(fateCards, battle, onComplete) {
    const display = document.getElementById("fate-cards-display");
    if (!display) {
      if (onComplete) onComplete();
      return;
    }
    display.innerHTML = "";
    let i = 0;
    const drawNext = () => {
      if (i >= fateCards.length) {
        if (onComplete) onComplete();
        return;
      }
      const card = fateCards[i];
      i++;
      if (card instanceof HubrisThresholdFateCard) {
        const cardEl = this.renderHubrisThresholdFateCard(card, battle, () => {
          setTimeout(drawNext, 300);
        });
        display.appendChild(cardEl);
      } else if (card instanceof ModalFateCard) {
        const cardEl = this.renderModalFateCard(card, battle, () => {
          setTimeout(drawNext, 300);
        });
        display.appendChild(cardEl);
      } else {
        const cardEl = document.createElement("div");
        cardEl.className = "fate-card";
        cardEl.textContent = card.toString();
        display.appendChild(cardEl);
        setTimeout(drawNext, 600);
      }
    };
    drawNext();
  },

  renderModalFateCard(card, battle, onComplete) {
    const el = document.createElement("div");
    el.className = "fate-card modal-fate-card";

    const buildOptionEl = (opt) => {
      const optEl = document.createElement("button");
      optEl.className = "modal-option";
      const optText = document.createElement("div");
      optText.className = "modal-option-text";
      optText.textContent = opt.text;
      optEl.appendChild(optText);
      if (opt.effects && opt.effects.length > 0) {
        const effectsEl = document.createElement("div");
        effectsEl.className = "modal-option-effects";
        for (const e of opt.effects) {
          const effectDef = EffectPool.get(e.key);
          if (effectDef) {
            const badge = document.createElement("span");
            badge.className = "effect-badge";
            badge.textContent = effectDef.label(e.amount);
            badge.style.color = effectDef.color(e.amount);
            effectsEl.appendChild(badge);
          }
        }
        optEl.appendChild(effectsEl);
      } else if (opt.description) {
        const optDesc = document.createElement("div");
        optDesc.className = "modal-option-desc";
        optDesc.textContent = opt.description;
        optEl.appendChild(optDesc);
      }
      return optEl;
    };

    const optAEl = buildOptionEl(card.options[0]);
    const optBEl = buildOptionEl(card.options[1]);

    // Separator
    const separator = document.createElement("div");
    separator.className = "modal-separator";
    if (card.separatorIcon) {
      const sepIcon = document.createElement("img");
      sepIcon.src = card.separatorIcon;
      sepIcon.className = "modal-separator-icon";
      sepIcon.alt = "";
      separator.appendChild(sepIcon);
    }
    if (card.separatorText) {
      const sepText = document.createElement("span");
      sepText.className = "modal-separator-text";
      sepText.textContent = card.separatorText;
      separator.appendChild(sepText);
    }

    const handleSelect = (index) => {
      card.selectOption(index, battle);
      optAEl.disabled = true;
      optBEl.disabled = true;
      el.classList.add("modal-selected");
      onComplete();
    };

    optAEl.addEventListener("click", () => handleSelect(0));
    optBEl.addEventListener("click", () => handleSelect(1));

    el.appendChild(optAEl);
    el.appendChild(separator);
    el.appendChild(optBEl);

    return el;
  },

  renderHubrisThresholdFateCard(card, battle, onComplete) {
    const el = document.createElement("div");
    el.className = "fate-card modal-fate-card";

    const autoIndex = card.autoSelectIndex(battle);

    const buildOptionEl = (opt, isSelected) => {
      const optEl = document.createElement("div");
      optEl.className = "modal-option " + (isSelected ? "modal-option-auto-selected" : "modal-option-not-selected");
      const optText = document.createElement("div");
      optText.className = "modal-option-text";
      optText.textContent = opt.text;
      optEl.appendChild(optText);
      if (opt.effects && opt.effects.length > 0) {
        const effectsEl = document.createElement("div");
        effectsEl.className = "modal-option-effects";
        for (const e of opt.effects) {
          const effectDef = EffectPool.get(e.key);
          if (effectDef) {
            const badge = document.createElement("span");
            badge.className = "effect-badge";
            badge.textContent = effectDef.label(e.amount);
            badge.style.color = effectDef.color(e.amount);
            effectsEl.appendChild(badge);
          }
        }
        optEl.appendChild(effectsEl);
      } else if (opt.description) {
        const optDesc = document.createElement("div");
        optDesc.className = "modal-option-desc";
        optDesc.textContent = opt.description;
        optEl.appendChild(optDesc);
      }
      return optEl;
    };

    const optAEl = buildOptionEl(card.options[0], autoIndex === 0);
    const optBEl = buildOptionEl(card.options[1], autoIndex === 1);

    // Separator (no icon, hubris threshold text only)
    const separator = document.createElement("div");
    separator.className = "modal-separator";
    const sepText = document.createElement("span");
    sepText.className = "modal-separator-text modal-separator-text--hubris";
    sepText.textContent = card.separatorText;
    separator.appendChild(sepText);

    el.appendChild(optAEl);
    el.appendChild(separator);
    el.appendChild(optBEl);

    card.selectOption(autoIndex, battle);
    el.classList.add("modal-selected");
    setTimeout(onComplete, 1200);

    return el;
  },

  showBattleResult(result, battle) {
    const logArea = document.getElementById("battle-log");
    if (logArea) {
      logArea.innerHTML = `
        <div class="battle-result ${result.won ? "result-win" : "result-lose"}">
          <h3>${result.won ? "Victory!" : "Defeat!"}</h3>
          <p>Hero Strength: <strong>${result.heroStrength}</strong></p>
          <p>Monster Strength: <strong>${result.monsterStrength}</strong></p>
          <button class="btn btn-continue" id="continue-btn">Continue</button>
        </div>
      `;
      document.getElementById("continue-btn").addEventListener("click", () => {
        Timeline.next();
      });

      // Disable battle action buttons
      for (const btn of document.querySelectorAll(
        ".btn-equip, .btn-reroll, .btn-fight"
      )) {
        btn.disabled = true;
      }
    }
  },

  // ── Forge Screen ──

  showForge() {
    this.currentScreen = "forge";
    this.clearApp();
    const app = this.getApp();

    const container = document.createElement("div");
    container.className = "forge-screen";

    const title = document.createElement("h2");
    title.className = "screen-title";
    title.textContent = "The Forge";
    container.appendChild(title);

    const forgeLayout = document.createElement("div");
    forgeLayout.className = "forge-layout";

    // Create Item component
    if (Config.forgeComponents.createItem) {
      forgeLayout.appendChild(this.renderCreateItem());
    }

    // Upgrade Anvil component
    if (Config.forgeComponents.upgradeAnvil) {
      forgeLayout.appendChild(this.renderUpgradeAnvil());
    }

    // Augment Shelf component
    if (Config.forgeComponents.augmentShelf) {
      forgeLayout.appendChild(this.renderAugmentShelf());
    }

    container.appendChild(forgeLayout);

    // Continue button
    const continueBtn = document.createElement("button");
    continueBtn.className = "btn btn-continue forge-continue";
    continueBtn.textContent = "Continue to Next Battle";
    continueBtn.addEventListener("click", () => {
      Timeline.next();
    });
    container.appendChild(continueBtn);

    app.appendChild(container);
  },

  renderCreateItem() {
    const panel = document.createElement("div");
    panel.className = "forge-component create-item-panel";
    panel.innerHTML = "<h3>Create Item</h3>";

    // Name input
    const nameGroup = document.createElement("div");
    nameGroup.className = "form-group";
    nameGroup.innerHTML = '<label>Name:</label>';
    const nameInput = document.createElement("input");
    nameInput.type = "text";
    nameInput.className = "form-input";
    nameInput.placeholder = "Item name";
    nameGroup.appendChild(nameInput);
    panel.appendChild(nameGroup);

    // Type selector
    const typeGroup = document.createElement("div");
    typeGroup.className = "form-group";
    typeGroup.innerHTML = '<label>Type:</label>';
    const typeSelect = document.createElement("select");
    typeSelect.className = "form-select";
    for (const t of Config.itemTypes) {
      const opt = document.createElement("option");
      opt.value = t;
      opt.textContent = capitalize(t);
      typeSelect.appendChild(opt);
    }
    typeGroup.appendChild(typeSelect);
    panel.appendChild(typeGroup);

    // Quality selector
    const qualGroup = document.createElement("div");
    qualGroup.className = "form-group";
    qualGroup.innerHTML = '<label>Quality:</label>';
    const qualDiv = document.createElement("div");
    qualDiv.className = "number-selector";
    let qualityVal = Config.qualitySelector.min;
    const qualLabel = document.createElement("span");
    qualLabel.className = "number-value";
    qualLabel.textContent = String(qualityVal);

    const qualDown = document.createElement("button");
    qualDown.className = "btn btn-sm";
    qualDown.textContent = "−";
    qualDown.addEventListener("click", () => {
      qualityVal = Math.max(Config.qualitySelector.min, qualityVal - Config.qualitySelector.increment);
      qualLabel.textContent = String(qualityVal);
    });
    const qualUp = document.createElement("button");
    qualUp.className = "btn btn-sm";
    qualUp.textContent = "+";
    qualUp.addEventListener("click", () => {
      qualityVal = Math.min(Config.qualitySelector.max, qualityVal + Config.qualitySelector.increment);
      qualLabel.textContent = String(qualityVal);
    });

    qualDiv.appendChild(qualDown);
    qualDiv.appendChild(qualLabel);
    qualDiv.appendChild(qualUp);
    qualGroup.appendChild(qualDiv);
    panel.appendChild(qualGroup);

    // Create button
    const createBtn = document.createElement("button");
    createBtn.className = "btn btn-create";
    createBtn.textContent = "Create Item";
    createBtn.addEventListener("click", () => {
      const item = new Item({
        name: nameInput.value || typeSelect.value,
        type: typeSelect.value,
        baseQuality: qualityVal,
        value: 0,
        augments: [],
        variant: 0
      });
      ItemPool.items.push(item);
      nameInput.value = "";
      this.showForgeMessage("Item created: " + item.name);
    });
    panel.appendChild(createBtn);

    return panel;
  },

  renderUpgradeAnvil() {
    const panel = document.createElement("div");
    panel.className = "forge-component upgrade-anvil-panel";
    panel.innerHTML = "<h3>Upgrade Anvil</h3>";

    const itemContainer = document.createElement("div");
    itemContainer.className = "upgrade-items";

    // Show up to 3 items from pool
    ItemPool.shuffle();
    const upgradeItems = [];
    for (let i = 0; i < 3; i++) {
      const item = ItemPool.draw();
      if (item) upgradeItems.push(item);
    }

    if (upgradeItems.length === 0) {
      itemContainer.innerHTML =
        '<p class="empty-msg">No items available to upgrade</p>';
    } else {
      for (const item of upgradeItems) {
        const wrapper = document.createElement("div");
        wrapper.className = "upgrade-item-wrapper";

        let card = this.renderItemCard(item, false);
        wrapper.appendChild(card);

        const btn = document.createElement("button");
        btn.className = "btn btn-upgrade";
        btn.textContent = `Upgrade\n-$${item.baseQuality} +5◈`;
        btn.addEventListener("click", () => {
          item.upgrade();
          btn.disabled = true;
          btn.textContent = "Upgraded!";
          const newCard = this.renderItemCard(item, false);
          wrapper.replaceChild(newCard, card);
          card = newCard;
          this.showForgeMessage(item.name + " upgraded!");
        });
        wrapper.appendChild(btn);

        // Drop-target: allow augment cards to be dragged onto this item
        wrapper.addEventListener("dragover", (e) => {
          e.preventDefault();
          wrapper.classList.add("drop-target-active");
        });
        wrapper.addEventListener("dragleave", () => {
          wrapper.classList.remove("drop-target-active");
        });
        wrapper.addEventListener("drop", (e) => {
          e.preventDefault();
          wrapper.classList.remove("drop-target-active");
          const augName = e.dataTransfer.getData("text/plain");
          const augData = Config.defaultAugments.find(
            (a) => a.name === augName
          );
          if (!augData) return;
          const newAug = new Augment(augData);
          newAug.onAugment(item);
          item.augments.push(newAug);
          const newCard = this.renderItemCard(item, false);
          wrapper.replaceChild(newCard, card);
          card = newCard;
          this.showForgeMessage(`${augName} attached to ${item.name}!`);
        });

        itemContainer.appendChild(wrapper);
      }
    }

    panel.appendChild(itemContainer);
    return panel;
  },

  renderAugmentShelf() {
    const panel = document.createElement("div");
    panel.className = "forge-component augment-shelf-panel";
    panel.innerHTML = "<h3>Augment Shelf</h3>";

    const augmentList = document.createElement("div");
    augmentList.className = "augment-shelf-list";

    // Show available augments
    for (const augData of Config.defaultAugments) {
      const aug = new Augment(augData);
      const augCard = document.createElement("div");
      augCard.className = "augment-card";
      augCard.draggable = true;
      augCard.addEventListener("dragstart", (e) => {
        e.dataTransfer.setData("text/plain", augData.name);
        e.dataTransfer.effectAllowed = "copy";
      });

      const augName = document.createElement("div");
      augName.className = "augment-name";
      augName.textContent = aug.name;

      const augDesc = document.createElement("div");
      augDesc.className = "augment-desc";
      augDesc.textContent = aug.description;

      const augPrice = document.createElement("div");
      augPrice.className = "augment-price";
      augPrice.textContent = "$" + aug.value;

      augCard.appendChild(augName);
      augCard.appendChild(augDesc);
      augCard.appendChild(augPrice);
      augmentList.appendChild(augCard);
    }

    panel.appendChild(augmentList);
    return panel;
  },

  showForgeMessage(msg) {
    let msgArea = document.getElementById("forge-message");
    if (!msgArea) {
      msgArea = document.createElement("div");
      msgArea.id = "forge-message";
      msgArea.className = "forge-message";
      document.querySelector(".forge-screen").appendChild(msgArea);
    }
    msgArea.textContent = msg;
    setTimeout(() => {
      if (msgArea.textContent === msg) msgArea.textContent = "";
    }, 3000);
  },

  // ── Card Renderers ──

  renderItemCard(item, isHero) {
    const card = document.createElement("div");
    card.className = "card item-card";

    const nameEl = document.createElement("div");
    nameEl.className = "card-name";
    nameEl.textContent = capitalize(item.name);
    card.appendChild(nameEl);

    const qualEl = document.createElement("div");
    qualEl.className = "card-quality";
    qualEl.textContent = "◈ " + item.quality;
    card.appendChild(qualEl);

    if (item.value > 0) {
      const valEl = document.createElement("div");
      valEl.className = "card-value";
      valEl.textContent = "$" + item.value;
      card.appendChild(valEl);
    }

    if (isHero && item.hubris > 0) {
      const hubEl = document.createElement("div");
      hubEl.className = "card-hubris";
      hubEl.textContent = "Hubris: " + item.hubris;
      card.appendChild(hubEl);
    }

    if (item.augments && item.augments.length > 0) {
      const augList = document.createElement("div");
      augList.className = "card-augments";
      for (const aug of item.augments) {
        const augEl = document.createElement("div");
        augEl.className = "card-augment";
        augEl.innerHTML = `<strong>${aug.name}</strong>: ${aug.description}`;
        augList.appendChild(augEl);
      }
      card.appendChild(augList);
    }

    return card;
  },

  renderCompactItemCard(item) {
    const card = document.createElement("div");
    card.className = "card compact-card";

    const nameEl = document.createElement("span");
    nameEl.className = "compact-name";
    nameEl.textContent = item.name;

    const qualEl = document.createElement("span");
    qualEl.className = "compact-quality";
    qualEl.textContent = "◈ " + item.quality;

    card.appendChild(nameEl);
    card.appendChild(qualEl);

    if (item.augments && item.augments.length > 0) {
      const augIcons = document.createElement("span");
      augIcons.className = "compact-augments";
      for (const aug of item.augments) {
        const icon = document.createElement("span");
        icon.className = "augment-icon";
        icon.title = aug.name + ": " + aug.description;
        icon.textContent = "✦";
        augIcons.appendChild(icon);
      }
      card.appendChild(augIcons);
    }

    return card;
  }
};
