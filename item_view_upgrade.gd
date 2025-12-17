extends VBoxContainer

@onready var item_view = $MarginContainer/ItemViewCompact
@onready var upgrade_button = $UpgradeButton
@onready var disabled_indicator = $MarginContainer/DisabledIndicator

var base_text = "Upgrade\n-$%d +5◈"

@export var item : Item :
	get:
		return item_view.item
	set(val):
		item_view.item = val
		reset_text()

func upgrade():
	upgrade_button.disabled = true
	disabled_indicator.visible = true
	item.upgrade()
	item = item

func reset_text():
	upgrade_button.text = base_text % item.base_quality

func _ready():
	reset_text()
