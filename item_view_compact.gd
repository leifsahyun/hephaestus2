class_name ItemViewCompact
extends ItemView

func populate_augments():
	clear_list(augments_list)
	for aug in item.augments:
		var list_item = TextureRect.new()
		list_item.texture = aug.icon
		list_item.custom_minimum_size = Vector2(64,64)
		list_item.expand_mode = TextureRect.ExpandMode.EXPAND_FIT_WIDTH_PROPORTIONAL
		augments_list.add_child(list_item)

func set_chroma():
	self.theme.get_stylebox("panel", "PanelContainer").border_color = Color(item.chroma)

func _ready():
	augments_list = $MarginContainer/VBoxContainer/HBoxContainer/VBoxContainer/VBoxContainer/AugmentsList
	reset()
