extends MarginContainer

signal pressed

@onready var augment_view = $AugmentViewCompact
@onready var pricetag = $VBoxContainer/PriceTag

@export var augment : Augment :
	get:
		return augment_view.augment
	set(val):
		augment_view.augment = val
		pricetag.text = "$%d" % val.value

func _gui_input(event: InputEvent) -> void:
	if event is InputEventMouseButton:
		if event.pressed and event.button_index == MOUSE_BUTTON_LEFT:
			pressed.emit()
