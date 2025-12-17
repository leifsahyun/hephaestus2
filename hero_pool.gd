extends Node

@export var bonds = 3
@export var heroes = []
@export var cities = []
var current = {}
var remaining = []

func draw():
	return current.values().pick_random()

func draw_new_hero():
	if len(remaining) == 0:
		remaining = heroes.duplicate(true)
		remaining.shuffle()
	return remaining.pop_back()

func erase(hero):
	current.erase(current.find_key(hero))

func populate():
	for c in cities:
		current[c] = draw_new_hero()

func _ready():
	populate()
