extends HBoxContainer

signal value_changed

@onready var type_label = $Label

@export var type : String
var _index = 0
var index : int :
	get:
		return _index
	set(val):
		_index = val
		type = Constants.item_types[index]
		reset_text()

func _ready() -> void:
	if type:
		index = Constants.item_types.find(type)

func reset_text():
	type_label.text = type.capitalize()

func next():
	index = index+1 if index+1 < Constants.item_types.size() else 0
	value_changed.emit()

func previous():
	index = index-1 if index-1 >= 0 else Constants.item_types.size() - 1
	value_changed.emit()
