extends Node

@export var augments = []
var current = []

func draw():
	return current.pick_random().duplicate()

func shuffle():
	current = augments.duplicate()
	current.shuffle()

func _ready():
	shuffle()
