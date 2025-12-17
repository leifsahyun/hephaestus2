extends Control

signal battle_complete
signal before_battle_resolve

var ItemViewCompactScene = preload("res://item_view_compact.tscn")

@export var hero : Item
@export var monster : Item

@onready var offer_item_view = $PanelContainer/MarginContainer/VBoxContainer/MarginContainer/GridRoot/VBoxContainer/ItemView
@onready var equipped_item_view = $PanelContainer/MarginContainer/VBoxContainer/MarginContainer/GridRoot/HBoxContainer/MarginContainer/ScrollContainer/EquippedItems
@onready var equipped_item_scroll = $PanelContainer/MarginContainer/VBoxContainer/MarginContainer/GridRoot/HBoxContainer/MarginContainer/ScrollContainer
@onready var hero_view = $PanelContainer/MarginContainer/VBoxContainer/MarginContainer/GridRoot/HBoxContainer/HeroCard
@onready var monster_view = $PanelContainer/MarginContainer/VBoxContainer/MarginContainer/GridRoot/VBoxContainer2/MonsterCard
@onready var expected_stats_view = $PanelContainer/MarginContainer/VBoxContainer/MarginContainer/GridRoot/VBoxContainer2/ExpectedStats

var _offer_item
var offer_item : Item :
	get:
		return _offer_item
	set(val):
		_offer_item = val
		if offer_item_view:
			offer_item_view.item = _offer_item

var equipped_items = []
var fate_cards = []

func next_event():
	Timeline.next()

func _ready():
	var titleLabel = $PanelContainer/MarginContainer/VBoxContainer/MarginContainer/GridRoot/TitleLabel
	titleLabel.text = Timeline.current_event.description
	ItemPool.shuffle()
	hero = Timeline.current_event.hero
	hero.reset()
	hero_view.item = hero
	for aug in hero.augments:
		aug.on_equip(self, hero)
	monster = Timeline.current_event.monster
	monster_view.item = monster
	for aug in monster.augments:
		aug.on_equip(self, monster)
	reroll_free()
	set_expected_stats()

func reroll():
	add_hubris(3)
	reroll_free()

func reroll_free():
	offer_item = ItemPool.draw()

func equip():
	add_hubris(10)
	equip_free()

func equip_free():
	if offer_item:
		equipped_items.append(offer_item)
		for aug in offer_item.augments:
			aug.on_equip(self, offer_item)
		set_hero_chroma()
		reset_equipped()
		reroll_free()

func set_hero_chroma():
	var chroma_counts = {"red": 0, "blue": 0, "green": 0}
	for item in equipped_items:
		chroma_counts[item.chroma] += 1
	var sorted_keys = chroma_counts.keys()
	sorted_keys.sort_custom(func (k1, k2): return chroma_counts[k1] > chroma_counts[k2])
	if chroma_counts[sorted_keys[0]] > 0 and chroma_counts[sorted_keys[0]] > chroma_counts[sorted_keys[1]]:
		hero.chroma = sorted_keys[0]
		hero_view.item = hero

func add_hubris(amount):
	hero.hubris += amount
	hero_view.item = hero
	set_expected_stats()

func reset_equipped():
	for c in equipped_item_view.get_children():
		equipped_item_view.remove_child(c)
		c.queue_free()
	for item in equipped_items:
		var view = ItemViewCompactScene.instantiate()
		view.item = item
		equipped_item_view.add_child(view)
	var scroll_defer = func(): equipped_item_scroll.scroll_horizontal = equipped_item_scroll.get_h_scroll_bar().max_value
	(func(): scroll_defer.call_deferred()).call_deferred()

func resolve_battle():
	before_battle_resolve.emit()
	draw_fate_cards()
	var hero_strength = hero.quality
	for i in equipped_items:
		hero_strength += i.quality
	var monster_strength = monster.quality
	for f in fate_cards:
		monster_strength += f.value
	print("hero strength ", hero_strength, " monster_strength ", monster_strength)
	if hero_strength >= monster_strength:
		print("You Win!")
	else:
		print("You Lose!")
	battle_complete.emit()
	next_event()

func draw_fate_cards():
	FatePool.shuffle()
	var cards_to_draw = get_expected_draw()
	for i in cards_to_draw:
		fate_cards.append(FatePool.draw())
	print("cards drawn ", fate_cards)

func get_expected_draw():
	return int(0.08*pow((0.1*hero.hubris),3)+1.03)

func set_expected_stats():
	var expected_draw = get_expected_draw()
	expected_stats_view.cards = expected_draw
	expected_stats_view.quality = [monster.quality + expected_draw, monster.quality + 12*expected_draw]
