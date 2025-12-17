extends Node

@export var items = []
var current = []

func draw():
	return current.pop_back()

func peek():
	return current.back()

func erase(item):
	items.erase(item)

func shuffle():
	current = items.duplicate()
	current.shuffle()

func _ready():
	shuffle()
