"""Revert ModelManager to load decoder on GPU but add memory optimization."""

with open("/app/tools/server/model_manager.py") as f:
    content = f.read()

# Revert CPU patch
old = '''        # Load decoder on CPU to save GPU VRAM (codec is less latency-sensitive)
        decoder_device = "cpu" if self.device == "cuda" else self.device
        self.load_decoder_model(
            decoder_config_name, decoder_checkpoint_path, decoder_device
        )'''

new = '''        self.load_decoder_model(
            decoder_config_name, decoder_checkpoint_path, self.device
        )'''

content = content.replace(old, new)

with open("/app/tools/server/model_manager.py", "w") as f:
    f.write(content)

print("ModelManager reverted to GPU decoder")
