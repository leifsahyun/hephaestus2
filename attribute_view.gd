extends Control

var _attribute
@export_enum("strength", "stamina", "foresight") var attribute : String :
	get:
		return _attribute
	set(val):
		_attribute = val
		reset()

func reset():
	if is_node_ready():
		theme = Constants.attribute_themes[attribute]
		$HBoxContainer/IconTexture.texture = Constants.attribute_icons[attribute]
		$HBoxContainer/AttributeLabel.text = attribute.capitalize()

func _ready():
	attribute = _attribute
