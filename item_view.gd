class_name ItemView
extends Control

const AttributeView = preload("res://attribute_view.tscn")
const AugmentView = preload("res://augment_view.tscn")

var _item = null
@export var item : Item :
	get:
		return _item
	set(val):
		_item = val
		reset()

@onready var icon_texture = $MarginContainer/VBoxContainer/HBoxContainer/IconTexture
@onready var name_label = $MarginContainer/VBoxContainer/HBoxContainer/VBoxContainer/NameLabel
@onready var quality_label = $MarginContainer/VBoxContainer/HBoxContainer/VBoxContainer/QualityLabel
@onready var value_label = $MarginContainer/VBoxContainer/ValueLabel
@onready var augments_list = $MarginContainer/VBoxContainer/AugmentsList
@onready var hubris_label = $MarginContainer/VBoxContainer/HBoxContainer/VBoxContainer/HubrisLabel
@onready var chroma_label = $MarginContainer/VBoxContainer/HBoxContainer/VBoxContainer/ChromaLabel

func reset():
	if is_node_ready() and item:
		name_label.text = item.name.capitalize()
		quality_label.text = "[char=25C8] "+str(item.quality)
		if value_label:
			if item.value > 0:
				value_label.text = "$"+str(item.value)
			else:
				value_label.visible = false
		if hubris_label:
			if item.hubris > 0:
				hubris_label.text = "Hubris "+str(item.hubris)
			else:
				hubris_label.visible = false
		if item.variant < 0:
			icon_texture.visible = false
		populate_augments()
		set_chroma()

func populate_augments():
	clear_list(augments_list)
	for aug in item.augments:
		var list_item = AugmentView.instantiate()
		list_item.augment = aug
		augments_list.add_child(list_item)

func set_chroma():
	if item.chroma:
		chroma_label.text = "Chroma: [color=\"%s\"]%s[/color]" % [item.chroma, item.chroma.capitalize()]
		chroma_label.visible = true
	else:
		chroma_label.visible = false

func clear_list(list_box):
	for c in list_box.get_children():
		list_box.remove_child(c)
		c.queue_free()

func _ready():
	reset()
