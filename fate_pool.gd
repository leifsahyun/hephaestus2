extends Node

@export var cards = []
var current = []

func draw():
	return current.pop_back()

func peek():
	return current.back()

func shuffle():
	current = cards.duplicate()
	current.shuffle()

func _ready():
	shuffle()
