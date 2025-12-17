class_name Hero
extends Item

@export var base_hubris : int
var temp_hubris : int :
	get:
		hubris = hubris if hubris > 0 else base_hubris
		return hubris
	set(val):
		hubris = val

func _init():
	reset()

func reset():
	hubris = base_hubris
	chroma = ""

func upgrade():
	base_quality += 3
	base_hubris += 2
