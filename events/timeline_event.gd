class_name TimelineEvent
extends Resource

@export var name : String
@export var description: String
@export var icon : Texture
@export var scene : PackedScene

func initialize():
	pass

func execute():
	Timeline.change_scene(scene)
