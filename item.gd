class_name Item
extends Resource

@export var base_quality: int
var temp_quality: int
var quality: int :
	get:
		temp_quality = temp_quality if temp_quality else base_quality
		return temp_quality
	set(val):
		temp_quality = val

@export var value: int
@export var name: String
@export var type: String
@export var variant: int
@export var chroma: String
@export var augments: Array
var hubris: int

func _init():
	name = name if name else type

func upgrade():
	value += base_quality
	temp_quality += 5
	base_quality += 5
