extends CenterContainer

signal pressed

@onready var style_panel = $PanelContainer
@onready var checkbox_label = $PanelContainer/Label

@export var checked_style : Theme
@export var unchecked_style : Theme

@export var checked_size = 40
@export var unchecked_size = 20

var _checked = false
@export var checked : bool :
	get:
		return _checked
	set(val):
		_checked = val
		reset()

# Called when the node enters the scene tree for the first time.
func _ready() -> void:
	reset()

func reset():
	var new_size = checked_size if checked else unchecked_size
	style_panel.theme = checked_style if checked else unchecked_style
	style_panel.custom_minimum_size = Vector2(new_size, new_size)
	checkbox_label.visible = checked

func _gui_input(event: InputEvent) -> void:
	if event is InputEventMouseButton:
		if event.pressed and event.button_index == MOUSE_BUTTON_LEFT:
			checked = !checked
			pressed.emit()
