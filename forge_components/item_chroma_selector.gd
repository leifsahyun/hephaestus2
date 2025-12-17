extends HBoxContainer

signal value_changed

@export var color_selected : String = "none"
var color_buttons = {}

# Called when the node enters the scene tree for the first time.
func _ready() -> void:
	color_buttons["red"] = $RedButton
	color_buttons["green"] = $GreenButton
	color_buttons["blue"] = $BlueButton
	for color in color_buttons.keys():
		color_buttons[color].pressed.connect(func(): set_color(color))

func set_color(c):
	color_selected = c
	if !color_buttons[c].checked:
		color_selected = "none"
		return
	for color in color_buttons.keys():
		if color != c:
			color_buttons[color].checked = false
	value_changed.emit()

# Called every frame. 'delta' is the elapsed time since the previous frame.
func _process(delta: float) -> void:
	pass
