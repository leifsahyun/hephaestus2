class_name ChildFootprint
extends Resource

@export var initial_child : NodePath = ""
var child : Node
@export var position : Vector2i
@export var size : Vector2i
@export var footprint : Array[Vector2i] = []

func _init(c : Node = null, p : Vector2i = Vector2i.ZERO, s : Vector2i = Vector2i.ZERO, f : Array[Vector2i] = []):
	set_props_optional(c,p,s,f)

func set_props_optional(c : Node = null, p : Vector2i = Vector2i.ZERO, s : Vector2i = Vector2i.ZERO, f : Array[Vector2i] = []):
	child = c if c else child
	position = p if p else position
	size = s if s else size
	footprint = f if !f.is_empty() else footprint

func has_point(point : Vector2i):
	var bounds = Rect2i(position, size)
	if !bounds.has_point(point):
		return false
	elif footprint.is_empty():
		return true
	else:
		for p in footprint:
			if position + p == point:
				return true
		return false
