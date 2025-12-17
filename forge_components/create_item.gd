extends PanelContainer

@onready var nameTextEdit = $VBoxContainer/TextEdit
@onready var typeSelector = $VBoxContainer/ItemTypeSelector
@onready var chromaSelector = $VBoxContainer/ItemChromaSelector
@onready var qualitySelector = $VBoxContainer/NumberSelector

func create_item():
	var item = Item.new()
	item.name = nameTextEdit.text
	item.type = typeSelector.type
	item.chroma = chromaSelector.color_selected
	item.base_quality = qualitySelector.value
	ItemPool.items.append(item)
