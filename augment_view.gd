class_name AugmentView
extends Control

var _augment
@export var augment : Augment :
	get:
		return _augment
	set(val):
		_augment = val
		reset()
			
func reset():
	if is_node_ready():
		$VBoxContainer/HBoxContainer/NameLabel.text = augment.name.capitalize()
		$VBoxContainer/DescriptionLabel.text = augment.description
		if augment.icon:
			$VBoxContainer/HBoxContainer/IconTexture.texture = augment.icon
		else:
			$VBoxContainer/HBoxContainer/IconTexture.visible = false

func _ready():
	reset()
