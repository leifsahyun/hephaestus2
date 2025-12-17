class_name FateCard
extends Resource

@export var value : int
@export var suit : String
@export var sign : String
@export var name : String

func _to_string():
	return str(value) + suit[0] + " " + sign
