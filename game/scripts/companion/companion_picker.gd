## Companion Picker — choose your learning companion.
## Each companion has a unique personality, voice, and 3D model.
extends Control

signal companion_chosen(companion_id: String, player_name: String)

const COMPANIONS := [
	{
		"id": "scout",
		"name": "Scout",
		"title": "The Explorer",
		"description": "Playful and adventurous — Scout can't wait to discover what's around the next corner!",
		"model": "res://models/companions/fox_new.glb",
		"voice": "res://audio/voice/companions/scout-intro.wav",
		"color": Color(0.93, 0.55, 0.24),
	},
	{
		"id": "merlin",
		"name": "Merlin",
		"title": "The Thinker",
		"description": "Wise and thoughtful — Merlin sees patterns everywhere and loves a good puzzle.",
		"model": "res://models/companions/owl_discovery.glb",
		"voice": "res://audio/voice/companions/merlin-intro.wav",
		"color": Color(0.47, 0.36, 0.67),
	},
	{
		"id": "clover",
		"name": "Clover",
		"title": "The Cheerleader",
		"description": "Boundless energy and endless encouragement — Clover believes you can do anything!",
		"model": "res://models/companions/rabbit_curious.glb",
		"voice": "res://audio/voice/companions/clover-intro.wav",
		"color": Color(0.36, 0.72, 0.36),
	},
	{
		"id": "rosie",
		"name": "Rosie",
		"title": "Mama Bear",
		"description": "Protective and nurturing — Rosie makes sure you feel safe to try new things.",
		"model": "res://models/companions/bear_new.glb",
		"voice": "res://audio/voice/companions/rosie-intro.wav",
		"color": Color(0.72, 0.36, 0.36),
	},
	{
		"id": "starla",
		"name": "Starla",
		"title": "The Star",
		"description": "A mischievous diva with flair — Starla turns every challenge into a performance!",
		"model": "res://models/companions/cat_curious.glb",
		"voice": "res://audio/voice/companions/starla-intro.wav",
		"color": Color(0.82, 0.62, 0.82),
	},
	{
		"id": "rune",
		"name": "Rune",
		"title": "The Ancient Soul",
		"description": "Wise beyond measure with an Irish lilt — Rune knows stories older than the stars.",
		"model": "res://models/companions/dragon_innovator.glb",
		"voice": "res://audio/voice/companions/rune-intro.wav",
		"color": Color(0.24, 0.65, 0.65),
	},
]

var selected_index := 0
var cards: Array[Control] = []

@onready var name_entry: LineEdit = $VBox/NameEntry
@onready var carousel: HBoxContainer = $VBox/Carousel
@onready var description_label: Label = $VBox/Description
@onready var choose_button: Button = $VBox/ChooseButton
@onready var voice_player: AudioStreamPlayer = $VoicePlayer
@onready var title_label: Label = $VBox/Title

func _ready() -> void:
	_build_carousel()
	_select_companion(0)
	choose_button.pressed.connect(_on_choose)

func _build_carousel() -> void:
	for i in range(COMPANIONS.size()):
		var card := _create_card(COMPANIONS[i], i)
		carousel.add_child(card)
		cards.append(card)

func _create_card(data: Dictionary, index: int) -> PanelContainer:
	var panel := PanelContainer.new()
	panel.custom_minimum_size = Vector2(220, 300)

	var vbox := VBoxContainer.new()
	vbox.alignment = BoxContainer.ALIGNMENT_CENTER
	panel.add_child(vbox)

	# 3D preview viewport
	var vp_container := SubViewportContainer.new()
	vp_container.custom_minimum_size = Vector2(200, 200)
	vp_container.stretch = true
	vbox.add_child(vp_container)

	var viewport := SubViewport.new()
	viewport.transparent_bg = true
	viewport.size = Vector2i(200, 200)
	viewport.render_target_update_mode = SubViewport.UPDATE_ONCE
	vp_container.add_child(viewport)

	# Camera and light in viewport
	var cam := Camera3D.new()
	cam.position = Vector3(0, 0.8, 2.5)
	cam.look_at(Vector3(0, 0.5, 0))
	viewport.add_child(cam)

	var light := DirectionalLight3D.new()
	light.rotation_degrees = Vector3(-45, 30, 0)
	viewport.add_child(light)

	# Load model
	var model_scene := load(data.model) as PackedScene
	if model_scene:
		var model := model_scene.instantiate()
		viewport.add_child(model)
		viewport.render_target_update_mode = SubViewport.UPDATE_ALWAYS

	# Name label
	var name_label := Label.new()
	name_label.text = data.name
	name_label.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	var name_settings := LabelSettings.new()
	name_settings.font_size = 24
	name_settings.font_color = data.color
	name_label.label_settings = name_settings
	vbox.add_child(name_label)

	# Title label
	var title := Label.new()
	title.text = data.title
	title.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	var title_settings := LabelSettings.new()
	title_settings.font_size = 16
	title_settings.font_color = Color(0.7, 0.7, 0.7)
	title.label_settings = title_settings
	vbox.add_child(title)

	# Click handling
	panel.gui_input.connect(func(event: InputEvent) -> void:
		if event is InputEventMouseButton and event.pressed:
			_select_companion(index)
	)

	return panel

func _select_companion(index: int) -> void:
	selected_index = index
	var data: Dictionary = COMPANIONS[index]
	description_label.text = data.description

	# Highlight selected, dim others
	for i in range(cards.size()):
		if i == index:
			cards[i].modulate = Color.WHITE
			cards[i].scale = Vector2(1.05, 1.05)
		else:
			cards[i].modulate = Color(0.6, 0.6, 0.6)
			cards[i].scale = Vector2.ONE

	# Play companion intro voice
	var stream := load(data.voice) as AudioStream
	if stream:
		voice_player.stream = stream
		voice_player.play()

func _on_choose() -> void:
	var player_name := name_entry.text.strip_edges()
	if player_name.is_empty():
		player_name = "Explorer"
	var companion_id: String = COMPANIONS[selected_index].id
	companion_chosen.emit(companion_id, player_name)

func _unhandled_input(event: InputEvent) -> void:
	if event is InputEventKey and event.pressed:
		if event.keycode == KEY_LEFT:
			_select_companion(wrapi(selected_index - 1, 0, COMPANIONS.size()))
		elif event.keycode == KEY_RIGHT:
			_select_companion(wrapi(selected_index + 1, 0, COMPANIONS.size()))
		elif event.keycode == KEY_ENTER:
			_on_choose()
