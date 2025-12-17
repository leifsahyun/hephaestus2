extends HBoxContainer

signal value_changed

@onready var label = $Label

var _value = 10
@export var value : int :
	get:
		return _value
	set(val):
		_value = val
		reset_text()

@export var increment : int = 5
@export var minimum : int = 10
@export var maximum : int = 50

func _ready():
	value = minimum

func reset_text():
	label.text = str(value)

func next():
	value = min(value+increment, maximum)
	value_changed.emit()

func previous():
	value = max(value-increment, minimum)
	value_changed.emit()
