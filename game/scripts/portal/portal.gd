## Portal intro — cinematic first-time experience.
## Emily (Nexus Voice) welcomes the player with 6 voice lines
## as the portal materializes from darkness.
extends Control

signal portal_entered
signal _first_tap

# Cinematic voice lines (Emily — Nexus Voice)
const VOICE_LINES := [
	"res://audio/voice/cinematic/intro-01.wav",  # "Have you ever wondered..."
	"res://audio/voice/cinematic/intro-02.wav",  # "Not what someone told you..."
	"res://audio/voice/cinematic/intro-03.wav",  # "This is the Nexus..."
	"res://audio/voice/cinematic/intro-04.wav",  # "Here, every question you ask..."
	"res://audio/voice/cinematic/intro-05.wav",  # "There are no grades here..."
	"res://audio/voice/cinematic/intro-06.wav",  # "Step through..."
]

const MUSIC_PATH := "res://audio/music/music-portal-ambient.wav"

# Reveal phases — how bright the portal is (0.0 = black, 1.0 = full)
const REVEAL_TARGETS := [0.0, 0.3, 0.5, 0.7, 0.85, 1.0, 1.0]
const REVEAL_DURATIONS := [3.0, 4.0, 3.0, 3.0, 4.0, 3.0, 0.0]

@onready var color_rect: ColorRect = $ColorRect
@onready var tap_label: Label = $TapLabel
@onready var voice_player: AudioStreamPlayer = $VoicePlayer
@onready var music_player: AudioStreamPlayer = $MusicPlayer
@onready var portal_viewport: SubViewportContainer = $PortalViewport

var first_time := true
var ready_to_enter := false
var entering := false
var waiting_for_tap := false
var reveal := 0.0
var reveal_target := 0.0
var reveal_speed := 0.0

func _ready() -> void:
	first_time = not _has_seen_intro()
	
	if first_time:
		reveal = 0.0
		tap_label.text = "✦ Tap to begin ✦"
		tap_label.modulate.a = 1.0
		# Wait for tap before starting cinematic
		await _wait_for_input()
		tap_label.modulate.a = 0.0
		await _run_cinematic()
	else:
		reveal = 1.0
		_start_music()
		# Returning player — portal visible, ready to enter after 1.5s
		await get_tree().create_timer(1.5).timeout
		ready_to_enter = true
		tap_label.text = "✦ Tap anywhere to enter ✦"
		_fade_in_label()

func _input(event: InputEvent) -> void:
	# Phase 1: waiting for initial tap to start cinematic
	if waiting_for_tap:
		if event is InputEventMouseButton and event.pressed:
			_first_tap.emit()
			return
		elif event is InputEventScreenTouch and event.pressed:
			_first_tap.emit()
			return
		elif event is InputEventKey and event.pressed:
			_first_tap.emit()
			return
	# Phase 2: portal is ready, waiting for tap to enter
	if not ready_to_enter or entering:
		return
	if event is InputEventMouseButton and event.pressed:
		_enter_portal()
	elif event is InputEventScreenTouch and event.pressed:
		_enter_portal()
	elif event is InputEventKey and event.pressed:
		if event.keycode == KEY_ENTER or event.keycode == KEY_SPACE:
			_enter_portal()

func _process(delta: float) -> void:
	# Smoothly animate reveal
	if reveal_speed > 0.0 and reveal < reveal_target:
		reveal = minf(reveal_target, reveal + reveal_speed * delta)
	elif reveal_speed < 0.0 and reveal > reveal_target:
		reveal = maxf(reveal_target, reveal + reveal_speed * delta)
	
	# Update portal shader brightness
	if color_rect and color_rect.material:
		(color_rect.material as ShaderMaterial).set_shader_parameter("reveal", reveal)

# ── Cinematic ────────────────────────────────────────────────────

func _run_cinematic() -> void:
	_start_music()
	
	# PHASE 1: The Void — black screen, music builds (3s)
	await get_tree().create_timer(3.0).timeout
	
	# PHASE 2-4: Voice lines with reveal progression
	for i in range(VOICE_LINES.size()):
		_drive_reveal(REVEAL_TARGETS[i + 1], REVEAL_DURATIONS[i + 1])
		await _play_voice(VOICE_LINES[i])
		
		# Pause between lines (shorter as it builds)
		var pause := 1.2 if i == 0 else (0.8 if i < 3 else 1.0)
		if i < VOICE_LINES.size() - 1:
			await get_tree().create_timer(pause).timeout
	
	# Mark as seen
	_mark_intro_seen()
	
	# Ready to enter
	ready_to_enter = true
	tap_label.text = "✦ Tap anywhere to enter ✦"
	_fade_in_label()

func _play_voice(path: String) -> void:
	var stream := load(path) as AudioStream
	if not stream:
		await get_tree().create_timer(3.0).timeout
		return
	voice_player.stream = stream
	voice_player.play()
	await voice_player.finished

func _start_music() -> void:
	var stream := load(MUSIC_PATH) as AudioStream
	if not stream:
		return
	music_player.stream = stream
	music_player.volume_db = -40.0
	music_player.play()
	# Fade in
	var tween := create_tween()
	tween.tween_property(music_player, "volume_db", -12.0, 3.0)

func _drive_reveal(target: float, duration: float) -> void:
	reveal_target = target
	var delta := target - reveal
	reveal_speed = delta / maxf(duration, 0.01)

func _enter_portal() -> void:
	if entering:
		return
	entering = true
	tap_label.modulate.a = 0.0
	
	# Fade music out
	var tween := create_tween()
	tween.tween_property(music_player, "volume_db", -80.0, 3.0)
	
	# Fly-through animation (3 seconds)
	# TODO: Animate wormhole shader
	await get_tree().create_timer(3.0).timeout
	
	portal_entered.emit()

# ── Helpers ──────────────────────────────────────────────────────

func _wait_for_input() -> void:
	waiting_for_tap = true
	await _first_tap
	waiting_for_tap = false

func _fade_in_label() -> void:
	tap_label.modulate.a = 0.0
	var tween := create_tween()
	tween.tween_property(tap_label, "modulate:a", 1.0, 0.8)
	# Pulse effect
	var pulse := create_tween().set_loops()
	pulse.tween_property(tap_label, "modulate:a", 0.6, 1.0)
	pulse.tween_property(tap_label, "modulate:a", 1.0, 1.0)

func _has_seen_intro() -> bool:
	var config := ConfigFile.new()
	if config.load("user://settings.cfg") == OK:
		return config.get_value("game", "intro_seen", false)
	return false

func _mark_intro_seen() -> void:
	var config := ConfigFile.new()
	config.load("user://settings.cfg")
	config.set_value("game", "intro_seen", true)
	config.save("user://settings.cfg")
