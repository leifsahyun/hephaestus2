@tool
class_name FootprintGridContainer
extends Container

var _columns : int
@export var columns : int :
	get:
		return _columns
	set(val):
		_columns = val
		queue_sort()
var _rows : int
@export var rows : int :
	get:
		return _rows
	set(val):
		_rows = val
		queue_sort()
var _stretch_rows : bool
@export var stretch_rows : bool :
	get:
		return _stretch_rows
	set(val):
		_stretch_rows = val
		queue_sort()

@export var child_footprints : Array[ChildFootprint]

var grid_atom : Vector2 :
	get:
		var x = size.x / columns
		var y = size.y / rows if stretch_rows else x
		return Vector2(x,y)

func get_child_position(child : Node):
	for dim in child_footprints:
		if dim.child == child:
			return dim
	return null

func set_child_position(child: Node, child_position : Vector2i = Vector2i.ZERO, child_size : Vector2i = Vector2i.ZERO, child_footprint : Array[Vector2i] = []):
	assert(child_position.x + child_size.x <= columns && child_position.y + child_size.y <= rows, "Out of bounds position set in FootprintGridContainer")
	var dim = get_child_position(child)
	dim.set_props_optional(child, child_position, child_size, child_footprint)

func get_child_at(pos : Vector2i):
	for dim in child_footprints:
		if dim.has_point(pos):
			return dim.child
	return null

func get_first_available_slot():
	for y in rows:
		for x in columns:
			if get_child_at(Vector2i(x,y)) == null:
				return Vector2(x,y)
	return null

func add_child_at_position(child : Node, child_position : Vector2i = Vector2i.ZERO, child_size : Vector2i = Vector2i.ZERO, child_footprint : Array[Vector2i] = []):
	assert(child_position.x + child_size.x <= columns && child_position.y + child_size.y <= rows, "Out of bounds insert in FootprintGridContainer")
	var dim = ChildFootprint.new(child, child_position, child_size, child_footprint)
	child_footprints.append(dim)
	add_child(child)
	
func on_sort_children():
	for dim in child_footprints:
		var child = dim.child if !Engine.is_editor_hint() else get_node(dim.initial_child)
		fit_child_in_rect(child, Rect2(Vector2(dim.position) * grid_atom, Vector2(dim.size) * grid_atom))

func _init():
	sort_children.connect(on_sort_children)

func _ready():
	if !Engine.is_editor_hint():
		for dim in child_footprints:
			if !dim.child and dim.initial_child:
				dim.child = get_node(dim.initial_child)
