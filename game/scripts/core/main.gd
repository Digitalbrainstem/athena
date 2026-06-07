## Nexus Academy — Main entry point.
## Manages game flow: Portal → Companion Picker → World
extends Node

@onready var portal_scene := preload("res://scenes/portal/portal.tscn")

var current_scene: Node = null

func _ready() -> void:
	# Force landscape on mobile
	if OS.has_feature("mobile"):
		DisplayServer.screen_set_orientation(DisplayServer.SCREEN_LANDSCAPE)
	
	# Force fullscreen on all platforms
	DisplayServer.window_set_mode(DisplayServer.WINDOW_MODE_FULLSCREEN)
	
	# Start with the portal
	_show_portal()

func _show_portal() -> void:
	_clear_current()
	var portal := portal_scene.instantiate()
	portal.portal_entered.connect(_on_portal_entered)
	add_child(portal)
	current_scene = portal

func _on_portal_entered() -> void:
	_show_companion_picker()

func _show_companion_picker() -> void:
	_clear_current()
	var picker_scene := preload("res://scenes/companion_picker/companion_picker.tscn")
	var picker := picker_scene.instantiate()
	picker.companion_chosen.connect(_on_companion_chosen)
	add_child(picker)
	current_scene = picker

func _on_companion_chosen(companion_id: String, player_name: String) -> void:
	_start_game(companion_id, player_name)

func _start_game(companion_id: String, player_name: String) -> void:
	_clear_current()
	var world_scene := preload("res://scenes/world/workshop.tscn")
	var world := world_scene.instantiate()
	world.set_meta("companion_id", companion_id)
	world.set_meta("player_name", player_name)
	add_child(world)
	current_scene = world

func _clear_current() -> void:
	if current_scene:
		current_scene.queue_free()
		current_scene = null
