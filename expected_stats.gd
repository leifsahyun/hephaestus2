extends PanelContainer

@onready var cards_label = $MarginContainer/VBoxContainer/CardsLabel
@onready var quality_label = $MarginContainer/VBoxContainer/QualityLabel

var _cards : int
@export var cards : int :
	get:
		return _cards
	set(val):
		_cards = val
		reset()
		
var _quality : Array
@export var quality : Array :
	get:
		return _quality
	set(val):
		_quality = val
		reset()

func reset():
	if is_node_ready():
		cards_label.text = " [char=258B] " + str(cards) + " cards"
		quality_label.text = "[char=25C8] " + str(quality[0]) + " - " + str(quality[1]) 

func _ready():
	reset()
