extends PanelContainer

@onready var item_container = $VBoxContainer/MarginContainer/CenterContainer/HBoxContainer
var item_views = []

func _ready():
	ItemPool.shuffle()
	for c in item_container.get_children():
		c.item = ItemPool.draw()
		item_views.append(c)
