## First-person controller for the workshop world.
## WASD + mouse look on desktop, dual-touch on mobile.
extends CharacterBody3D

const SPEED := 5.0
const SPRINT_SPEED := 8.0
const JUMP_VELOCITY := 4.5
const MOUSE_SENSITIVITY := 0.003
const TOUCH_LOOK_SENSITIVITY := 0.005
const TOUCH_MOVE_SCALE := 0.01

@onready var pivot: Node3D = $Pivot
@onready var camera: Camera3D = $Pivot/Camera3D

var gravity: float = ProjectSettings.get_setting("physics/3d/default_gravity")

# Touch state
var touch_move_index := -1
var touch_look_index := -1
var touch_move_start := Vector2.ZERO
var touch_move_current := Vector2.ZERO
var touch_look_last := Vector2.ZERO

func _ready() -> void:
	Input.mouse_mode = Input.MOUSE_MODE_CAPTURED

func _unhandled_input(event: InputEvent) -> void:
	# Mouse look
	if event is InputEventMouseMotion and Input.mouse_mode == Input.MOUSE_MODE_CAPTURED:
		rotate_y(-event.relative.x * MOUSE_SENSITIVITY)
		pivot.rotate_x(-event.relative.y * MOUSE_SENSITIVITY)
		pivot.rotation.x = clampf(pivot.rotation.x, -deg_to_rad(89.0), deg_to_rad(89.0))

	# Escape releases mouse
	if event is InputEventKey and event.pressed and event.keycode == KEY_ESCAPE:
		Input.mouse_mode = Input.MOUSE_MODE_VISIBLE

	# Click recaptures mouse
	if event is InputEventMouseButton and event.pressed:
		if Input.mouse_mode != Input.MOUSE_MODE_CAPTURED:
			Input.mouse_mode = Input.MOUSE_MODE_CAPTURED

	# Touch: left half = move joystick, right half = look
	if event is InputEventScreenTouch:
		_handle_touch(event)
	elif event is InputEventScreenDrag:
		_handle_drag(event)

func _handle_touch(event: InputEventScreenTouch) -> void:
	var half_w := get_viewport().get_visible_rect().size.x * 0.5
	if event.pressed:
		if event.position.x < half_w and touch_move_index == -1:
			touch_move_index = event.index
			touch_move_start = event.position
			touch_move_current = event.position
		elif event.position.x >= half_w and touch_look_index == -1:
			touch_look_index = event.index
			touch_look_last = event.position
	else:
		if event.index == touch_move_index:
			touch_move_index = -1
		elif event.index == touch_look_index:
			touch_look_index = -1

func _handle_drag(event: InputEventScreenDrag) -> void:
	if event.index == touch_move_index:
		touch_move_current = event.position
	elif event.index == touch_look_index:
		var delta := event.position - touch_look_last
		touch_look_last = event.position
		rotate_y(-delta.x * TOUCH_LOOK_SENSITIVITY)
		pivot.rotate_x(-delta.y * TOUCH_LOOK_SENSITIVITY)
		pivot.rotation.x = clampf(pivot.rotation.x, -deg_to_rad(89.0), deg_to_rad(89.0))

func _physics_process(delta: float) -> void:
	# Gravity
	if not is_on_floor():
		velocity.y -= gravity * delta

	# Jump
	if Input.is_action_just_pressed("jump") and is_on_floor():
		velocity.y = JUMP_VELOCITY

	# Keyboard movement
	var input_dir := Input.get_vector("move_left", "move_right", "move_forward", "move_back")

	# Touch virtual joystick
	if touch_move_index >= 0:
		var touch_delta := (touch_move_current - touch_move_start) * TOUCH_MOVE_SCALE
		touch_delta = touch_delta.limit_length(1.0)
		input_dir += touch_delta
		input_dir = input_dir.limit_length(1.0)

	var direction := (transform.basis * Vector3(input_dir.x, 0, input_dir.y)).normalized()

	var speed := SPEED
	if direction:
		velocity.x = direction.x * speed
		velocity.z = direction.z * speed
	else:
		velocity.x = move_toward(velocity.x, 0, speed)
		velocity.z = move_toward(velocity.z, 0, speed)

	move_and_slide()
