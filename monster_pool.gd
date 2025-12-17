extends Node

@export var tier = 1
@export var monsters : Dictionary
var current = []

func draw():
	if len(current) == 0:
		load_tier(tier)
	return current.pop_back()

func erase(monster):
	current.erase(monster)

func load_tier(t):
	tier = t
	current = monsters[tier].duplicate()
	current.shuffle()
