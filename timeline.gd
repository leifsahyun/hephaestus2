extends Node

signal timeline_changed

@export var event_cycles : Array
@export var min_length = 10

var upcoming_events = []
var current_event = null

func populate():
	while len(upcoming_events) < min_length:
		var cycle = event_cycles.pick_random()
		for evt in cycle:
			var e = evt.duplicate()
			e.initialize()
			upcoming_events.append(e)
	timeline_changed.emit()

func pop():
	var event = upcoming_events.pop_front()
	timeline_changed.emit()
	if len(upcoming_events) < min_length:
		populate()
	return event

func push(event):
	upcoming_events.append(event)
	timeline_changed.emit()

func change_scene(scene):
	get_tree().change_scene_to_packed(scene)

func next():
	current_event = pop()
	current_event.execute()

func _ready():
	populate()
	next()
