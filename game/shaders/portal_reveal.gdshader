shader_type canvas_item;

uniform float reveal : hint_range(0.0, 1.0) = 0.0;

void fragment() {
	float alpha = 1.0 - reveal;
	COLOR = vec4(0.0, 0.0, 0.0, alpha);
}
