extends Node

@export var relics = []
var current = []

func draw():
	return current.pick_random().duplicate()

func shuffle():
	current = relics.duplicate()
	current.shuffle()

func _ready():
	shuffle()
