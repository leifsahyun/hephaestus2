class_name Augment
extends Resource

@export var name : String
@export var description : String
@export var icon : Texture2D
@export var value : int
var item

func on_augment(target):
	item = target

func on_equip(context):
	pass
