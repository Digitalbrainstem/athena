#!/bin/bash
# Generate Priority 1 Nexus Voice lines
# Fish Audio TTS API on 192.168.3.8:8090

API="http://192.168.3.8:8090/v1/tts"
OUTDIR="/home/blue/repo/athena/content/audio/voice/nexus"
mkdir -p "$OUTDIR"

generate() {
    local id="$1"
    local text="$2"
    local outfile="$OUTDIR/${id}.wav"
    
    if [ -f "$outfile" ] && [ "$(stat -c%s "$outfile")" -gt 1000 ]; then
        echo "[SKIP] $id already exists ($(stat -c%s "$outfile") bytes)"
        return 0
    fi
    
    echo "[GEN] $id: $text"
    curl -s --max-time 600 -X POST "$API" \
        -H "Content-Type: application/json" \
        -d "{\"text\": \"$text\", \"format\": \"wav\", \"temperature\": 0.7, \"top_p\": 0.8, \"max_new_tokens\": 200}" \
        -o "$outfile"
    
    local size=$(stat -c%s "$outfile" 2>/dev/null || echo 0)
    if [ "$size" -gt 1000 ]; then
        echo "[OK]  $id: ${size} bytes"
    else
        echo "[FAIL] $id: only ${size} bytes"
        rm -f "$outfile"
    fi
}

echo "=== Generating 20 Nexus Voice Lines ==="
echo ""

generate "nv-welcome-01" "Welcome to Nexus Academy. Your journey begins now."
generate "nv-welcome-02" "A new mind enters the Nexus. The world has been waiting for you."
generate "nv-welcome-back-01" "Welcome back, explorer. The world remembers you."
generate "nv-welcome-back-02" "You've returned. Your creations still stand."
generate "nv-portal-01" "Step through. Everything you need is on the other side."
generate "nv-portal-02" "The gateway awaits. Are you ready?"
generate "nv-first-steps-01" "Look around. This is the Workshop, your home."
generate "nv-first-steps-02" "Everything here was built by someone who started just like you."
generate "nv-companion-intro-01" "Choose wisely. Your companion will grow with you."
generate "nv-companion-intro-02" "They're more than a guide. They're a friend."
generate "nv-tier-up-foundation" "You've taken your first steps. The world opens before you."
generate "nv-tier-up-discovery" "Discovery awaits. The unknown becomes familiar."
generate "nv-tier-up-builder" "You build now. The world responds to your hands."
generate "nv-tier-up-innovator" "Innovation flows through you. Create what hasn't existed."
generate "nv-tier-up-creator" "You are a Creator now. Teach others what you've learned."
generate "nv-nexus-core-01" "The Nexus Core. Few reach this place. Fewer understand it."
generate "nv-hint-gentle-01" "Take your time. There's no rush here."
generate "nv-hint-gentle-02" "Try a different approach. The answer is closer than you think."
generate "nv-night-01" "The stars are out. Even the Nexus rests."
generate "nv-break-01" "You've been exploring a while. Stretch your legs?"

echo ""
echo "=== Generation Complete ==="
ls -la "$OUTDIR"/*.wav 2>/dev/null | wc -l
echo "files generated"
