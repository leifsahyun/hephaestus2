/**
 * UI rendering for battle and forge screens.
 */

const UI = {
  currentScreen: null,

  init() {
    Timeline.onSceneChange = (sceneType) => {
      this.renderTimeline();
      if (sceneType === "battle" || sceneType === "dialog") {
        this.showBattle();
      } else if (sceneType === "forge") {
        this.showForge();
      }
    };
    this.updatePlayerStats();
  },

  updatePlayerStats() {
    const moneyEl = document.getElementById("player-money");
    if (moneyEl) moneyEl.textContent = "$" + PlayerState.money;
    const bondsEl = document.getElementById("player-bonds");
    if (bondsEl) bondsEl.textContent = "🔗" + PlayerState.bonds;
    if (this.currentScreen === "forge") {
      this.updateForgeAffordability();
    }
  },

  updateForgeAffordability() {
    for (const btn of document.querySelectorAll("[data-upgrade-cost]")) {
      if (!btn.hasAttribute("data-upgraded")) {
        const cost = parseInt(btn.dataset.upgradeCost, 10);
        btn.disabled = PlayerState.money < cost;
      }
    }
    for (const card of document.querySelectorAll("[data-augment-cost]")) {
      const cost = parseInt(card.dataset.augmentCost, 10);
      const canAfford = PlayerState.money >= cost;
      card.classList.toggle("augment-card--disabled", !canAfford);
      card.draggable = canAfford;
    }
  },

  renderTimeline() {
    const container = document.getElementById("event-timeline");
    if (!container) return;

    const ICONS = { battle: "⚔️", forge: "⚒", dialog: "💬" };
    const MAX_UPCOMING_DISPLAYED = 9;
    const events = [];
    if (Timeline.currentEvent) {
      events.push({ event: Timeline.currentEvent, isCurrent: true });
    }
    const upcoming = Timeline.upcomingEvents.slice(0, MAX_UPCOMING_DISPLAYED);
    for (const evt of upcoming) {
      events.push({ event: evt, isCurrent: false });
    }

    const track = document.createElement("div");
    track.className = "timeline-track";

    events.forEach(({ event, isCurrent }, i) => {
      if (i > 0) {
        const connector = document.createElement("div");
        connector.className = "timeline-connector";
        track.appendChild(connector);
      }

      const node = document.createElement("div");
      node.className = "timeline-node" + (isCurrent ? " timeline-node--current" : "");

      const circle = document.createElement("div");
      circle.className = "timeline-node-circle";
      const icon = ICONS[event.sceneType];
      if (!icon) {
        console.warn("Unknown event sceneType:", event.sceneType);
      }
      circle.textContent = icon || "●";
      circle.title = event.name;

      node.appendChild(circle);
      track.appendChild(node);
    });

    container.innerHTML = "";
    container.appendChild(track);
  },

  getApp() {
    return document.getElementById("app");
  },

  clearApp() {
    this.getApp().innerHTML = "";
  },

  showTitleScreen() {
    document.getElementById("title-screen").style.display = "";
  },

  showGameOverPopup(title, message) {
    RunStats.finalize(PlayerState.bonds);
    const summary = RunStats.saveToHistory();
    this.updateHistoryButton();

    const overlay = document.createElement("div");
    overlay.className = "game-over-overlay";

    const popup = document.createElement("div");
    popup.className = "game-over-popup";

    const heading = document.createElement("h2");
    heading.textContent = title;

    const text = document.createElement("p");
    text.textContent = message;

    const statsEl = this._buildRunStatsEl(summary);

    const btn = document.createElement("button");
    btn.className = "btn btn-continue";
    btn.id = "game-over-continue-btn";
    btn.textContent = "Continue";

    popup.appendChild(heading);
    popup.appendChild(text);
    popup.appendChild(statsEl);
    popup.appendChild(btn);
    overlay.appendChild(popup);
    document.body.appendChild(overlay);

    btn.addEventListener("click", () => {
      overlay.remove();
      this.showTitleScreen();
    });
  },

  _buildRunStatsEl(summary) {
    const el = document.createElement("div");
    el.className = "run-stats";

    const rows = [
      ["Highest Hero Score", summary.highestHeroScore],
      ["Highest Monster Strength", summary.highestMonsterQuality],
      ["Median Hubris", summary.medianHubris],
      ["Monsters Defeated", summary.monstersDefeated],
      ["Total Money Earned", "$" + summary.totalMoneyEarned],
      ["Bonds Remaining", "🔗" + summary.bondsRemaining],
    ];

    for (const [label, value] of rows) {
      const row = document.createElement("div");
      row.className = "run-stats-row";
      const labelEl = document.createElement("span");
      labelEl.className = "run-stats-label";
      labelEl.textContent = label;
      const valueEl = document.createElement("span");
      valueEl.className = "run-stats-value";
      valueEl.textContent = value;
      row.appendChild(labelEl);
      row.appendChild(valueEl);
      el.appendChild(row);
    }

    if (summary.topEquippedItems && summary.topEquippedItems.length > 0) {
      const itemsHeading = document.createElement("div");
      itemsHeading.className = "run-stats-items-heading";
      itemsHeading.textContent = "Most Equipped Items";
      el.appendChild(itemsHeading);

      for (const entry of summary.topEquippedItems) {
        const row = document.createElement("div");
        row.className = "run-stats-row run-stats-item-row";
        const nameEl = document.createElement("span");
        nameEl.className = "run-stats-label";
        nameEl.textContent = capitalize(entry.name);
        const detailEl = document.createElement("span");
        detailEl.className = "run-stats-value";
        const augText = entry.augments.length > 0 ? ` [${entry.augments.join(", ")}]` : "";
        detailEl.textContent = `◈${entry.quality}${augText} ×${entry.count}`;
        row.appendChild(nameEl);
        row.appendChild(detailEl);
        el.appendChild(row);
      }
    }

    return el;
  },

  updateHistoryButton() {
    const btn = document.getElementById("btn-history");
    if (!btn) return;
    const history = RunStats.loadHistory();
    btn.disabled = history.length === 0;
  },

  showHistoryScreen() {
    const history = RunStats.loadHistory();

    const overlay = document.createElement("div");
    overlay.className = "game-over-overlay history-overlay";

    const panel = document.createElement("div");
    panel.className = "game-over-popup history-popup";

    const heading = document.createElement("h2");
    heading.textContent = "Run History";
    panel.appendChild(heading);

    if (history.length === 0) {
      const empty = document.createElement("p");
      empty.textContent = "No runs recorded yet.";
      panel.appendChild(empty);
    } else {
      const list = document.createElement("div");
      list.className = "history-list";

      history.forEach((summary, idx) => {
        const entry = document.createElement("div");
        entry.className = "history-entry";

        const entryHeading = document.createElement("div");
        entryHeading.className = "history-entry-heading";
        const date = new Date(summary.timestamp).toLocaleString();
        entryHeading.textContent = `Run ${history.length - idx} — ${date}`;
        entry.appendChild(entryHeading);

        entry.appendChild(this._buildRunStatsEl(summary));
        list.appendChild(entry);
      });

      panel.appendChild(list);
    }

    const closeBtn = document.createElement("button");
    closeBtn.className = "btn btn-continue";
    closeBtn.textContent = "Close";
    closeBtn.addEventListener("click", () => overlay.remove());
    panel.appendChild(closeBtn);

    overlay.appendChild(panel);
    document.body.appendChild(overlay);
  },

  // ── Battle Screen ──

  showBattle() {
    this.currentScreen = "battle";
    this.clearApp();
    const event = Timeline.currentEvent;
    const isDialog = event instanceof DialogTimelineEvent;

    if (!isDialog && (!event || !event.hero || !event.monster)) {
      this.getApp().innerHTML = "<p>No battle event available.</p>";
      return;
    }

    const battle = isDialog ? new DialogBattle(event) : new Battle(event.hero, event.monster);
    const app = this.getApp();

    // Track items that just became critical for the flash animation
    const criticalAnimItems = new Set();
    let criticalUIUpdateScheduled = false;
    battle.onItemCriticalCallbacks.push((b, item) => {
      criticalAnimItems.add(item);
      if (!criticalUIUpdateScheduled) {
        criticalUIUpdateScheduled = true;
        setTimeout(() => {
          criticalUIUpdateScheduled = false;
          this.updateBattleUI(battle, criticalAnimItems);
        }, 0);
      }
    });

    const container = document.createElement("div");
    container.className = "battle-screen";

    const layout = document.createElement("div");
    layout.className = "battle-layout";

    // Left: Hero card
    const heroSection = document.createElement("div");
    heroSection.className = "battle-section hero-section";
    heroSection.innerHTML = "<h3>" + (isDialog ? event.heroName : "Hero") + "</h3>";
    const heroStrengthDisplay = document.createElement("div");
    heroStrengthDisplay.id = "hero-strength-display";
    heroStrengthDisplay.className = "strength-display hero-strength-display";
    heroSection.appendChild(heroStrengthDisplay);
    const heroCard = this.renderItemCard(battle.hero, true);
    heroCard.id = "hero-card";
    heroSection.appendChild(heroCard);

    // Equipped items (always shown under hero card)
    const equippedArea = document.createElement("div");
    equippedArea.className = "equipped-area";
    equippedArea.innerHTML = "<h3>Equipped Items</h3>";
    const equippedList = document.createElement("div");
    equippedList.id = "equipped-list";
    equippedList.className = "equipped-list";
    equippedArea.appendChild(equippedList);
    heroSection.appendChild(equippedArea);

    layout.appendChild(heroSection);

    // Center: Fate Cards section
    const fateCardsSection = document.createElement("div");
    fateCardsSection.className = "battle-section fate-cards-section";
    const fateCardsDisplay = document.createElement("div");
    fateCardsDisplay.id = "fate-cards-display";
    fateCardsDisplay.className = "fate-cards-display";
    fateCardsSection.appendChild(fateCardsDisplay);
    layout.appendChild(fateCardsSection);

    // Right: Monster card
    const monsterSection = document.createElement("div");
    monsterSection.className = "battle-section monster-section";
    monsterSection.innerHTML = "<h3>" + (isDialog ? event.enemyName : "Monster") + "</h3>";
    const monsterStrengthDisplay = document.createElement("div");
    monsterStrengthDisplay.id = "monster-strength-display";
    monsterStrengthDisplay.className = "strength-display monster-strength-display";
    monsterSection.appendChild(monsterStrengthDisplay);
    const monsterCard = this.renderItemCard(battle.monster, false);
    monsterCard.id = "monster-card";
    monsterSection.appendChild(monsterCard);
    layout.appendChild(monsterSection);

    let dialogTextBlock = null;
    if (isDialog) {
      // Dialog container occupies the offer area position (row 2, col 2)
      const dialogContainer = document.createElement("div");
      dialogContainer.id = "dialog-container";
      dialogContainer.className = "dialog-container dialog-container--text-only";

      dialogTextBlock = document.createElement("div");
      dialogTextBlock.id = "dialog-text-block";
      dialogTextBlock.className = "dialog-text-block";
      dialogContainer.appendChild(dialogTextBlock);

      layout.appendChild(dialogContainer);
    } else {
      // Offered items area (row 2, col 2)
      const offerArea = document.createElement("div");
      offerArea.className = "offer-area";
      offerArea.innerHTML = "<h3>Offered Items</h3>";

      const offerRow = document.createElement("div");
      offerRow.id = "offer-items-row";
      offerRow.className = "offer-items-row";

      for (let i = 0; i < 3; i++) {
        const slot = document.createElement("div");
        slot.className = "offer-slot";

        const cardDiv = document.createElement("div");
        cardDiv.id = `offer-slot-${i}`;
        slot.appendChild(cardDiv);

        const equipBtn = document.createElement("button");
        equipBtn.id = `offer-equip-${i}`;
        equipBtn.className = "btn btn-equip";
        equipBtn.textContent = "Equip";
        equipBtn.addEventListener("click", () => {
          const item = battle.offerItems[i];
          if (!item) return;
          battle.selectOffer(item);
          this.updateBattleUI(battle, criticalAnimItems);
        });
        slot.appendChild(equipBtn);

        offerRow.appendChild(slot);
      }
      offerArea.appendChild(offerRow);

      // Action buttons (fight only)
      const actions = document.createElement("div");
      actions.className = "battle-actions";

      const fightBtn = document.createElement("button");
      fightBtn.className = "btn btn-fight";
      fightBtn.textContent = "Fight!";
      fightBtn.addEventListener("click", () => {
        for (const btn of document.querySelectorAll(".btn-equip")) {
          btn.disabled = true;
        }
        fightBtn.disabled = true;
        battle.drawFateCards();
        this.showFateCards(battle, () => {
          const result = battle.resolveBattle();
          this.showBattleResult(result, battle);
        });
      });

      actions.appendChild(fightBtn);
      offerArea.appendChild(actions);
      layout.appendChild(offerArea);
    }

    // Battle log (row 2, col 3)
    const logArea = document.createElement("div");
    logArea.id = "battle-log";
    logArea.className = "battle-log battle-section";
    layout.appendChild(logArea);

    container.appendChild(layout);
    app.appendChild(container);

    this.updateBattleUI(battle, criticalAnimItems);

    if (isDialog) {
      // Load dialog steps as fate cards and auto-start
      battle.fateCards = battle.dialogSteps;
      this.showFateCards(battle, () => {
        const result = battle.resolveBattle();
        this.showDialogResult(result, battle);
      }, { textBlock: dialogTextBlock, initialText: battle.initialText || null });
    }
  },

  showDialogResult(result, battle) {
    const logArea = document.getElementById("battle-log");
    if (logArea) {
      logArea.innerHTML = `
        <div class="battle-result">
          <button class="btn btn-continue" id="continue-btn">Continue</button>
        </div>
      `;
      document.getElementById("continue-btn").addEventListener("click", () => {
        Timeline.next();
      });
    }
  },

  updateBattleUI(battle, criticalAnimItems) {
    // Update hero card
    const heroCard = document.getElementById("hero-card");
    if (heroCard) {
      const newHeroCard = this.renderItemCard(battle.hero, true);
      newHeroCard.id = "hero-card";
      heroCard.replaceWith(newHeroCard);
    }

    // Update strength displays
    let heroStrength = battle.hero.quality;
    for (const item of battle.equippedItems) {
      heroStrength += item.quality;
    }
    const monsterStrength = battle.monster.quality;

    const heroStrengthEl = document.getElementById("hero-strength-display");
    if (heroStrengthEl) {
      const prev = heroStrengthEl.dataset.strength;
      if (prev !== undefined && parseInt(prev, 10) !== heroStrength) {
        heroStrengthEl.classList.remove("strength-flash");
        void heroStrengthEl.offsetWidth; // trigger reflow to restart CSS animation
        heroStrengthEl.classList.add("strength-flash");
      }
      heroStrengthEl.textContent = heroStrength;
      heroStrengthEl.dataset.strength = heroStrength;
    }

    const monsterStrengthEl = document.getElementById("monster-strength-display");
    if (monsterStrengthEl) {
      const prev = monsterStrengthEl.dataset.strength;
      if (prev !== undefined && parseInt(prev, 10) !== monsterStrength) {
        monsterStrengthEl.classList.remove("strength-flash");
        void monsterStrengthEl.offsetWidth; // trigger reflow to restart CSS animation
        monsterStrengthEl.classList.add("strength-flash");
      }
      monsterStrengthEl.textContent = monsterStrength;
      monsterStrengthEl.dataset.strength = monsterStrength;
    }

    // Update offer slots
    for (let i = 0; i < 3; i++) {
      const slotEl = document.getElementById(`offer-slot-${i}`);
      const equipBtn = document.getElementById(`offer-equip-${i}`);
      if (slotEl) {
        slotEl.innerHTML = "";
        const item = battle.offerItems[i];
        if (item) {
          slotEl.appendChild(this.renderItemCard(item, false));
        } else {
          slotEl.innerHTML = '<div class="card empty-card">Empty</div>';
        }
      }
      if (equipBtn) {
        const item = battle.offerItems[i];
        if (item) {
          equipBtn.textContent = "Equip ";
          const hubrisSpan = document.createElement("span");
          hubrisSpan.className = "equip-btn-hubris-cost";
          hubrisSpan.textContent = `(+${item.hubrisCost}H)`;
          equipBtn.appendChild(hubrisSpan);
          equipBtn.disabled = false;
        } else {
          equipBtn.textContent = "Equip";
          equipBtn.disabled = true;
        }
      }
    }

    // Update equipped list
    const equippedList = document.getElementById("equipped-list");
    if (equippedList) {
      equippedList.innerHTML = "";
      for (const item of battle.equippedItems) {
        const card = this.renderCompactItemCard(item);
        const isCritical = criticalAnimItems && criticalAnimItems.has(item);
        if (isCritical) criticalAnimItems.delete(item);
        equippedList.appendChild(card);
        if (isCritical) {
          requestAnimationFrame(() => {
            this._showCriticalFlash(card);
            this._showCriticalPopup(card);
          });
        }
      }
    }
  },

  _showCriticalFlash(cardEl) {
    const rect = cardEl.getBoundingClientRect();
    const overlay = document.createElement("div");
    overlay.className = "critical-flash-overlay";
    overlay.style.left   = rect.left + "px";
    overlay.style.top    = rect.top + "px";
    overlay.style.width  = rect.width + "px";
    overlay.style.height = rect.height + "px";
    document.body.appendChild(overlay);
    overlay.addEventListener("animationend", () => overlay.remove());
  },

  _showCriticalPopup(cardEl) {
    const rect = cardEl.getBoundingClientRect();
    const popup = document.createElement("div");
    popup.className = "critical-popup";
    popup.textContent = "Critical!";
    const angle = (Math.random() * 24 - 12).toFixed(1) + "deg";
    popup.style.setProperty("--popup-angle", angle);
    popup.style.left = (rect.left + rect.width / 2) + "px";
    popup.style.top = (rect.top - 4) + "px";
    document.body.appendChild(popup);
    popup.addEventListener("animationend", () => popup.remove());
  },

  _typewriterAnimate(textBlock, text, onComplete) {
    const CHAR_DELAY_MS = 25;
    textBlock.textContent = "";
    let charIndex = 0;
    let done = false;

    const finish = () => {
      if (done) return;
      done = true;
      textBlock.removeEventListener("click", skipHandler);
      document.removeEventListener("keydown", skipHandler);
      textBlock.textContent = text;
      if (onComplete) onComplete();
    };

    const skipHandler = () => finish();

    textBlock.addEventListener("click", skipHandler);
    document.addEventListener("keydown", skipHandler);

    const addChar = () => {
      if (done) return;
      if (charIndex < text.length) {
        textBlock.textContent += text[charIndex];
        charIndex++;
        setTimeout(addChar, CHAR_DELAY_MS);
      } else {
        finish();
      }
    };

    setTimeout(addChar, 0);
  },

  showFateCards(battle, onComplete, options = {}) {
    const { textBlock = null, initialText = null } = options;
    const display = document.getElementById("fate-cards-display");
    if (!display) {
      if (onComplete) onComplete();
      return;
    }
    display.innerHTML = "";

    const MAX_VISIBLE = 2;
    const MAX_STACK_LAYERS = 4;
    const LAYER_OFFSET = 4; // px offset per depth level
    const MIN_OPACITY = 0.2;
    const MAX_OPACITY = 1;
    const OPACITY_STEP = 0.2;
    const stackedCards = [];  // card objects in stack, oldest first
    const visiblePairs = [];  // { card, el } for on-screen cards, oldest first

    const updateStack = () => {
      let stackEl = display.querySelector(".fate-stack");
      if (stackedCards.length === 0) {
        if (stackEl) stackEl.remove();
        return;
      }
      if (!stackEl) {
        stackEl = document.createElement("div");
        stackEl.className = "fate-stack";
        display.insertBefore(stackEl, display.firstChild);
      }
      stackEl.innerHTML = "";

      // Badge showing total stacked count
      const badge = document.createElement("div");
      badge.className = "fate-stack-badge";
      badge.textContent = stackedCards.length;
      stackEl.appendChild(badge);

      // Show up to MAX_STACK_LAYERS visual layers (most recently stacked cards)
      const layers = stackedCards.slice(-MAX_STACK_LAYERS);
      const n = layers.length;
      layers.forEach((card, idx) => {
        // idx 0 = oldest shown layer, idx n-1 = most recently stacked (front)
        const depthFromFront = n - 1 - idx;
        const offset = depthFromFront * LAYER_OFFSET;

        let cardEl = null;
        if (card instanceof HubrisThresholdFateCard) {
          cardEl = this.renderHubrisThresholdFateCard(card, battle, () => {});
          cardEl.className = "fate-stack-card modal-fate-card";
        } else if (card instanceof ModalFateCard) {
          cardEl = this.renderModalFateCard(card, battle, () => {});
          cardEl.className = "fate-stack-card modal-fate-card";
        } else {
          cardEl = document.createElement("div");
          cardEl.textContent = card.toString();
          cardEl.className = "fate-stack-card";
        }
        
        cardEl.style.top = `${offset}px`;
        cardEl.style.right = `${offset}px`;
        cardEl.style.zIndex = n - depthFromFront;
        cardEl.style.opacity = Math.max(MIN_OPACITY, MAX_OPACITY - depthFromFront * OPACITY_STEP);
        stackEl.appendChild(cardEl);
      });
    };

    let i = 0;
    let pendingResponseText = null;

    const renderCard = (card) => {
      // If already at max visible, move oldest to the stack
      if (visiblePairs.length >= MAX_VISIBLE) {
        const oldest = visiblePairs.shift();
        oldest.el.remove();
        stackedCards.push(oldest.card);
        updateStack();
      }

      if (card instanceof HubrisThresholdFateCard) {
        const cardEl = this.renderHubrisThresholdFateCard(card, battle, () => {
          setTimeout(drawNext, 300);
        });
        display.appendChild(cardEl);
        visiblePairs.push({ card, el: cardEl });
      } else if (card instanceof ModalFateCard) {
        const cardEl = this.renderModalFateCard(card, battle, (responseText) => {
          if (responseText) pendingResponseText = responseText;
          setTimeout(drawNext, 300);
        });
        display.appendChild(cardEl);
        visiblePairs.push({ card, el: cardEl });
      } else {
        const cardEl = document.createElement("div");
        cardEl.className = "fate-card";
        cardEl.textContent = card.toString();
        display.appendChild(cardEl);
        visiblePairs.push({ card, el: cardEl });
        setTimeout(drawNext, 600);
      }
    };

    const drawNext = () => {
      if (i >= battle.fateCards.length) {
        if (onComplete) onComplete();
        return;
      }
      const card = battle.fateCards[i];
      i++;

      // Determine the text to display in the dialog text block before showing the card
      let textToShow = null;
      if (textBlock) {
        if (pendingResponseText !== null) {
          textToShow = pendingResponseText;
          pendingResponseText = null;
        } else if (card instanceof DialogModalFateCard && card.statement) {
          textToShow = card.statement;
        }
      }

      if (textToShow) {
        this._typewriterAnimate(textBlock, textToShow, () => renderCard(card));
      } else {
        renderCard(card);
      }
    };

    // Show initial text before drawing the first card, if provided
    if (initialText && textBlock) {
      this._typewriterAnimate(textBlock, initialText, drawNext);
    } else {
      drawNext();
    }
  },

  renderModalFateCard(card, battle, onComplete) {
    const el = document.createElement("div");
    el.className = "fate-card modal-fate-card";

    const buildOptionEl = (opt) => {
      const optEl = document.createElement("button");
      optEl.className = "modal-option";
      if (opt.zodiac) {
        const zodiacBadge = document.createElement("span");
        zodiacBadge.className = "zodiac-badge";
        zodiacBadge.textContent = UI.zodiacIcon(opt.zodiac);
        zodiacBadge.title = opt.zodiac;
        optEl.appendChild(zodiacBadge);
      }
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

    // Call onDraw for each option before building elements, allowing dynamic text updates
    for (const opt of card.options) {
      if (opt.onDrawFn) opt.onDrawFn.call(opt);
    }

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
      this.updateBattleUI(battle);
      onComplete(card.options[index].response || null);
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
      if (opt.zodiac) {
        const zodiacBadge = document.createElement("span");
        zodiacBadge.className = "zodiac-badge";
        zodiacBadge.textContent = UI.zodiacIcon(opt.zodiac);
        zodiacBadge.title = opt.zodiac;
        optEl.appendChild(zodiacBadge);
      }
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
    this.updateBattleUI(battle);
    setTimeout(onComplete, 300);

    return el;
  },

  showBattleResult(result, battle) {
    const logArea = document.getElementById("battle-log");
    if (logArea) {
      let rewardText = "";
      if (result.won) {
        const earned = PlayerState.awardBattleReward();
        rewardText = `<p>Earned: <strong>$${earned}</strong></p>`;
      } else {
        PlayerState.removeBond();
        if (HeroPool.champion === battle.hero) {
          HeroPool.champion = null;
        }
        rewardText = `<p>Lost: <strong>🔗1</strong></p>`;
      }

      RunStats.recordBattle(battle, result);

      logArea.innerHTML = `
        <div class="battle-result ${result.won ? "result-win" : "result-lose"}">
          <h3>${result.won ? "Victory!" : "Defeat!"}</h3>
          <p>Hero Strength: <strong>${result.heroStrength}</strong></p>
          <p>Monster Strength: <strong>${result.monsterStrength}</strong></p>
          ${rewardText}
          <button class="btn btn-continue" id="continue-btn">Continue</button>
        </div>
      `;

      // Disable battle action buttons
      for (const btn of document.querySelectorAll(
        ".btn-equip, .btn-fight"
      )) {
        btn.disabled = true;
      }

      if (result.won && battle.monster.name === "Cloaked Figure") {
        document.getElementById("continue-btn").addEventListener("click", () => {
          this.showGameOverPopup("Victory!", "You have defeated the Cloaked Figure and brought peace to the land.");
        });
      } else if (!result.won && PlayerState.bonds <= 0) {
        document.getElementById("continue-btn").addEventListener("click", () => {
          this.showGameOverPopup("Defeat!", "You have broken all your bonds. Your heroes can fight no more.");
        });
      } else {
        document.getElementById("continue-btn").addEventListener("click", () => {
          Timeline.next();
        });
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

    // Type selector
    const typeGroup = document.createElement("div");
    typeGroup.className = "form-group";
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

    // Zodiac tag selector
    const zodiacSigns = ["none", "aries", "taurus", "gemini", "cancer", "leo", "virgo", "libra", "scorpio", "sagittarius", "capricorn", "aquarius", "pisces"];
    let zodiacIdx = 0;
    const zodiacGroup = document.createElement("div");
    zodiacGroup.className = "form-group qual-group";
    zodiacGroup.innerHTML = '<label class="qual-label">Zodiac:</label>';
    const zodiacDiv = document.createElement("div");
    zodiacDiv.className = "number-selector";
    const zodiacLabel = document.createElement("span");
    zodiacLabel.className = "number-value";
    zodiacLabel.textContent = "—";

    const zodiacLeft = document.createElement("button");
    zodiacLeft.className = "btn btn-sm";
    zodiacLeft.textContent = "◀";
    const zodiacRight = document.createElement("button");
    zodiacRight.className = "btn btn-sm";
    zodiacRight.textContent = "▶";

    function updateZodiacLabel() {
      const sign = zodiacSigns[zodiacIdx];
      zodiacLabel.textContent = sign === "none" ? "—" : UI.zodiacIcon(sign);
      zodiacLabel.title = sign === "none" ? "None" : capitalize(sign);
    }

    zodiacLeft.addEventListener("click", () => {
      zodiacIdx = (zodiacIdx - 1 + zodiacSigns.length) % zodiacSigns.length;
      updateZodiacLabel();
    });
    zodiacRight.addEventListener("click", () => {
      zodiacIdx = (zodiacIdx + 1) % zodiacSigns.length;
      updateZodiacLabel();
    });

    zodiacDiv.appendChild(zodiacLeft);
    zodiacDiv.appendChild(zodiacLabel);
    zodiacDiv.appendChild(zodiacRight);
    zodiacGroup.appendChild(zodiacDiv);
    panel.appendChild(zodiacGroup);

    // Quality selector (0 allowed as minimum)
    const qualGroup = document.createElement("div");
    qualGroup.className = "form-group qual-group";
    qualGroup.innerHTML = '<label class="qual-label">Quality:</label>';
    const qualDiv = document.createElement("div");
    qualDiv.className = "number-selector";
    let qualityVal = Config.qualitySelector.min;
    const qualLabel = document.createElement("span");
    qualLabel.className = "number-value";
    qualLabel.textContent = String(qualityVal);

    const qualDown = document.createElement("button");
    qualDown.className = "btn btn-sm";
    qualDown.textContent = "−";
    const qualUp = document.createElement("button");
    qualUp.className = "btn btn-sm";
    qualUp.textContent = "+";

    // Value and Hubris cost display
    const statsDiv = document.createElement("div");
    statsDiv.className = "create-item-stats";
    const hubrisDisplay = document.createElement("span");
    hubrisDisplay.className = "create-item-stat-hubris";

    function getItemValue(q) {
      return q === 0 ? 3 : q;
    }
    function getHubrisCost(q) {
      return q === 0 ? 1 : Math.round(getItemValue(q) * 0.4);
    }
    function updateStats() {
      hubrisDisplay.textContent = "Hubris: " + getHubrisCost(qualityVal);
    }

    qualDown.addEventListener("click", () => {
      qualityVal = Math.max(0, qualityVal - Config.qualitySelector.increment);
      qualLabel.textContent = String(qualityVal);
      updateStats();
    });
    qualUp.addEventListener("click", () => {
      qualityVal = Math.min(Config.qualitySelector.max, qualityVal + Config.qualitySelector.increment);
      qualLabel.textContent = String(qualityVal);
      updateStats();
    });

    qualDiv.appendChild(qualDown);
    qualDiv.appendChild(qualLabel);
    qualDiv.appendChild(qualUp);
    qualGroup.appendChild(qualDiv);

    statsDiv.appendChild(hubrisDisplay);
    updateStats();

    // Augment slot carousels (3 slots)
    const slotTypes = Config.augmentSlotTypes;
    const slotsDiv = document.createElement("div");
    slotsDiv.className = "create-item-slots";

    const slotStates = [
      { typeIdx: 0, augData: null, locked: false },
      { typeIdx: 1, augData: null, locked: false },
      { typeIdx: 2, augData: null, locked: false },
    ];
    const carouselEls = [];

    for (let i = 0; i < 3; i++) {
      const carousel = document.createElement("div");
      carousel.className = "slot-carousel";

      const prevBtn = document.createElement("button");
      prevBtn.className = "btn btn-sm slot-carousel-btn";
      prevBtn.textContent = "▲";

      const img = document.createElement("img");
      img.className = "slot-icon slot-carousel-icon";

      const nextBtn = document.createElement("button");
      nextBtn.className = "btn btn-sm slot-carousel-btn";
      nextBtn.textContent = "▼";

      carousel.appendChild(prevBtn);
      carousel.appendChild(img);
      carousel.appendChild(nextBtn);
      slotsDiv.appendChild(carousel);
      carouselEls.push({ el: carousel, img, prevBtn, nextBtn });
    }

    function updateCarouselIcon(i) {
      const state = slotStates[i];
      const typeName = slotTypes[state.typeIdx];
      const suffix = state.augData ? "filled" : "empty";
      carouselEls[i].img.src = `icons/augment_slot/${typeName}_slot_${suffix}.png`;
      carouselEls[i].img.alt = typeName;
      carouselEls[i].img.title = state.augData ? `${state.augData.name}: ${state.augData.description}` : "";
      carouselEls[i].prevBtn.style.visibility = state.locked ? "hidden" : "";
      carouselEls[i].nextBtn.style.visibility = state.locked ? "hidden" : "";
    }

    for (let i = 0; i < 3; i++) {
      updateCarouselIcon(i);
      const idx = i;

      carouselEls[i].prevBtn.addEventListener("click", () => {
        if (slotStates[idx].locked) return;
        slotStates[idx].typeIdx = (slotStates[idx].typeIdx - 1 + slotTypes.length) % slotTypes.length;
        updateCarouselIcon(idx);
      });

      carouselEls[i].nextBtn.addEventListener("click", () => {
        if (slotStates[idx].locked) return;
        slotStates[idx].typeIdx = (slotStates[idx].typeIdx + 1) % slotTypes.length;
        updateCarouselIcon(idx);
      });

      carouselEls[i].el.addEventListener("dragover", (e) => {
        if (slotStates[idx].locked) return;
        e.preventDefault();
        carouselEls[idx].el.classList.add("drop-target-active");
      });

      carouselEls[i].el.addEventListener("dragleave", () => {
        carouselEls[idx].el.classList.remove("drop-target-active");
      });

      carouselEls[i].el.addEventListener("drop", (e) => {
        e.preventDefault();
        carouselEls[idx].el.classList.remove("drop-target-active");
        if (slotStates[idx].locked) return;
        const augName = e.dataTransfer.getData("text/plain");
        const augData = defaultAugments.find(a => a.name === augName);
        if (!augData) return;
        if (PlayerState.money < augData.value) {
          this.showForgeMessage(`Cannot afford ${augName} ($${augData.value})`);
          return;
        }
        const currentSlotType = slotTypes[slotStates[idx].typeIdx];
        if (augData.type !== currentSlotType) {
          this.showForgeMessage(`${augName} requires a ${augData.type} slot`);
          return;
        }
        PlayerState.addMoney(-augData.value);
        slotStates[idx].augData = augData;
        slotStates[idx].locked = true;
        updateCarouselIcon(idx);
        const shelfCard = document.querySelector(`[data-augment-name="${augName}"]`);
        if (shelfCard) shelfCard.remove();
        this.showForgeMessage(`${augName} reserved for new item!`);
      });
    }

    // Create button
    const createBtn = document.createElement("button");
    createBtn.className = "btn btn-create";
    createBtn.textContent = "Create Item";
    createBtn.addEventListener("click", () => {
      const value = getItemValue(qualityVal);
      const hubrisCost = getHubrisCost(qualityVal);
      const slots = slotStates.map(s => ({ type: slotTypes[s.typeIdx], augment: null }));
      const selectedZodiac = zodiacSigns[zodiacIdx];
      const item = new Item({
        name: capitalize(typeSelect.value),
        type: typeSelect.value,
        baseQuality: qualityVal,
        value,
        hubrisCost,
        augments: [],
        variant: 0,
        slots,
        zodiacTags: selectedZodiac !== "none" ? [selectedZodiac] : []
      });
      for (let i = 0; i < slotStates.length; i++) {
        const state = slotStates[i];
        if (state.augData) {
          const aug = new Augment(state.augData);
          aug.onAugment(item);
          item.slots[i].augment = aug;
          item.augments.push(aug);
        }
      }
      ItemPool.items.push(item);
      this.showForgeMessage("Item created: " + capitalize(item.name));
      createBtn.disabled = true;
    });
    panel.appendChild(slotsDiv);
    panel.appendChild(qualGroup);
    panel.appendChild(statsDiv);
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
        btn.textContent = `Upgrade\n-$${item.value} +5◈`;
        btn.dataset.upgradeCost = item.value;
        btn.disabled = PlayerState.money < item.value;
        btn.addEventListener("click", () => {
          const cost = item.baseQuality;
          if (PlayerState.money < cost) return;
          PlayerState.addMoney(-cost);
          item.upgrade();
          btn.disabled = true;
          btn.dataset.upgraded = "1";
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
          const augData = defaultAugments.find(
            (a) => a.name === augName
          );
          if (!augData) return;
          if (PlayerState.money < augData.value) {
            this.showForgeMessage(`Cannot afford ${augName} ($${augData.value})`);
            return;
          }
          const matchingSlot = augData.type
            ? item.slots.find(s => s.type === augData.type && !s.augment)
            : null;
          if (!matchingSlot) {
            const slotType = augData.type || "unknown";
            this.showForgeMessage(`No matching ${slotType} slot on ${item.name}`);
            return;
          }
          const newAug = new Augment(augData);
          newAug.onAugment(item);
          matchingSlot.augment = newAug;
          item.augments.push(newAug);
          PlayerState.addMoney(-augData.value);
          const newCard = this.renderItemCard(item, false);
          wrapper.replaceChild(newCard, card);
          card = newCard;
          const shelfCard = document.querySelector(`[data-augment-name="${augName}"]`);
          if (shelfCard) shelfCard.remove();
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

    // Show 3 randomly selected augments from the pool
    for (const augData of AugmentPool.sample(3)) {
      const aug = new Augment(augData);
      const augCard = document.createElement("div");
      const canAfford = PlayerState.money >= aug.value;
      augCard.className = "augment-card" + (canAfford ? "" : " augment-card--disabled");
      augCard.draggable = canAfford;
      augCard.dataset.augmentCost = aug.value;
      augCard.dataset.augmentName = augData.name;
      augCard.addEventListener("dragstart", (e) => {
        e.dataTransfer.setData("text/plain", augData.name);
        e.dataTransfer.effectAllowed = "copy";
      });

      const augName = document.createElement("div");
      augName.className = "augment-name";
      augName.textContent = aug.name;

      const augType = document.createElement("div");
      augType.className = "augment-type";
      if (augData.type) {
        const augTypeImg = document.createElement("img");
        augTypeImg.src = `icons/augment_slot/${augData.type}_slot_filled.png`;
        augTypeImg.className = "slot-icon slot-icon--sm";
        augTypeImg.alt = augData.type;
        augType.appendChild(augTypeImg);
        const augTypeLabel = document.createElement("span");
        augTypeLabel.textContent = capitalize(augData.type);
        augType.appendChild(augTypeLabel);
      }

      const augDesc = document.createElement("div");
      augDesc.className = "augment-desc";
      augDesc.textContent = aug.description;

      const augPrice = document.createElement("div");
      augPrice.className = "augment-price";
      augPrice.textContent = "$" + aug.value;

      augCard.appendChild(augName);
      augCard.appendChild(augType);
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

    if (isHero) {
      const MAX_HUBRIS = 21;
      const hubRow = document.createElement("div");
      hubRow.className = "card-hubris";

      const hubLabel = document.createElement("span");
      hubLabel.className = "card-hubris-label";
      hubLabel.textContent = "Hubris: " + item.hubris;
      hubRow.appendChild(hubLabel);

      const barTrack = document.createElement("div");
      barTrack.className = "hubris-bar-track";
      const barFill = document.createElement("div");
      barFill.className = "hubris-bar-fill";
      barFill.style.width = Math.min(100, (Math.max(0, item.hubris) / MAX_HUBRIS) * 100) + "%";
      barTrack.appendChild(barFill);
      hubRow.appendChild(barTrack);

      if (item.hubris >= MAX_HUBRIS) {
        const dangerIcon = document.createElement("span");
        dangerIcon.className = "hubris-danger-icon";
        dangerIcon.textContent = "⚠";
        dangerIcon.title = "Hubris over 21 will trigger every bad fate card and lead to almost certain death.";
        hubRow.appendChild(dangerIcon);
      }

      card.appendChild(hubRow);
    }

    if (!isHero && item.fateCards != null) {
      const fateEl = document.createElement("div");
      fateEl.className = "card-fate-cards";
      fateEl.textContent = "▋ " + item.fateCards + " fate cards";
      card.appendChild(fateEl);
    }

    if (item.slots && item.slots.length > 0) {
      const slotsEl = document.createElement("div");
      slotsEl.className = "card-slots";
      for (const slot of item.slots) {
        const slotRow = document.createElement("div");
        slotRow.className = "card-slot" + (slot.augment ? " card-slot--filled" : " card-slot--empty");
        const slotImg = document.createElement("img");
        const state = slot.augment ? "filled" : "empty";
        slotImg.src = `icons/augment_slot/${slot.type}_slot_${state}.png`;
        slotImg.className = "slot-icon";
        slotImg.alt = slot.augment ? slot.augment.name : `${slot.type} slot`;
        slotImg.title = slot.augment
          ? `${slot.augment.name}: ${slot.augment.description}`
          : `Empty ${slot.type} slot`;
        slotRow.appendChild(slotImg);
        slotsEl.appendChild(slotRow);
      }
      card.appendChild(slotsEl);
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

    if (item.counters && item.counters.size > 0) {
      const namedCounters = Array.from(item.counters.entries()).filter(([name, val]) => val > 0 && !name.startsWith("_"));
      if (namedCounters.length > 0) {
        const total = namedCounters.reduce((sum, [, val]) => sum + val, 0);
        const badge = document.createElement("div");
        badge.className = "counter-badge";
        badge.textContent = total;
        badge.title = namedCounters.map(([name, val]) => `${val} ${capitalize(name)}`).join("\n");
        card.appendChild(badge);
      }
    }

    if (item.zodiacTags && item.zodiacTags.length > 0) {
      const hasCounter = item.counters && Array.from(item.counters.values()).some(v => v > 0);
      card.appendChild(this.renderItemZodiacBadges(item.zodiacTags, hasCounter));
    }

    return card;
  },

  renderCompactItemCard(item) {
    const card = document.createElement("div");
    card.className = "card compact-card" + (item.critical ? " compact-card--critical" : "");

    const nameEl = document.createElement("span");
    nameEl.className = "compact-name";
    nameEl.textContent = item.name;

    const qualEl = document.createElement("span");
    qualEl.className = "compact-quality";
    qualEl.textContent = "◈ " + item.quality;

    card.appendChild(nameEl);
    card.appendChild(qualEl);

    if (item.slots && item.slots.length > 0) {
      const filledSlots = item.slots.filter(s => s.augment);
      if (filledSlots.length > 0) {
        const slotsEl = document.createElement("span");
        slotsEl.className = "compact-slots";
        for (const slot of filledSlots) {
          const slotImg = document.createElement("img");
          slotImg.src = `icons/augment_slot/${slot.type}_slot_filled.png`;
          slotImg.className = "slot-icon slot-icon--compact";
          slotImg.alt = slot.augment.name;
          slotImg.title = `${slot.augment.name}: ${slot.augment.description}`;
          slotsEl.appendChild(slotImg);
        }
        card.appendChild(slotsEl);
      }
    }

    if (item.zodiacTags && item.zodiacTags.length > 0) {
      card.appendChild(this.renderItemZodiacBadges(item.zodiacTags, false));
    }

    return card;
  },

  renderItemZodiacBadges(zodiacTags, withCounter) {
    const container = document.createElement("div");
    container.className = "item-zodiac-badges" + (withCounter ? " item-zodiac-badges--with-counter" : "");
    for (const tag of zodiacTags) {
      const badge = document.createElement("span");
      badge.className = "zodiac-badge";
      badge.textContent = UI.zodiacIcon(tag);
      badge.title = tag;
      container.appendChild(badge);
    }
    return container;
  },

  zodiacIcon(zodiac) {
    const icons = {
      aries: "♈", taurus: "♉", gemini: "♊", cancer: "♋",
      leo: "♌", virgo: "♍", libra: "♎", scorpio: "♏",
      sagittarius: "♐", capricorn: "♑", aquarius: "♒", pisces: "♓"
    };
    return icons[zodiac] || "";
  }
};
