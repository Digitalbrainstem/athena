// Debug logging — enabled when ?debug=true in URL or import.meta.env.DEV

const IS_DEBUG = import.meta.env.DEV || new URLSearchParams(window.location.search).has('debug');

const COLORS: Record<string, string> = {
  core: '#22d3ee',
  render: '#a78bfa', 
  input: '#fbbf24',
  audio: '#34d399',
  scene: '#f97171',
  camera: '#60a5fa',
  quest: '#f472b6',
  a11y: '#c084fc',
};

export function debug(system: string, ...args: unknown[]): void {
  if (!IS_DEBUG) return;
  const color = COLORS[system] ?? '#94a3b8';
  console.log(`%c[${system}]`, `color: ${color}; font-weight: bold`, ...args);
}

export function debugWarn(system: string, ...args: unknown[]): void {
  if (!IS_DEBUG) return;
  console.warn(`[${system}]`, ...args);
}

export function debugError(system: string, ...args: unknown[]): void {
  console.error(`[${system}]`, ...args);
}

// Dump scene graph summary to console
export function debugSceneGraph(sg: { objects: unknown[]; lights: unknown[]; ground: { color: string }; sky: { primaryColor: string }; audio: unknown[]; announcements: unknown[]; captions: unknown[] }): void {
  if (!IS_DEBUG) return;
  console.groupCollapsed('%c[scene] Scene Graph Summary', 'color: #f97171; font-weight: bold');
  console.log('Objects:', sg.objects.length);
  console.log('Lights:', sg.lights.length);
  console.log('Ground color:', sg.ground.color);
  console.log('Sky color:', sg.sky.primaryColor);
  console.log('Audio cues:', sg.audio.length);
  console.log('Announcements:', sg.announcements.length);
  console.log('Captions:', sg.captions.length);
  if (sg.objects.length > 0) {
    console.table((sg.objects as Array<{ entityId: number; position: unknown; renderable: { meshType: string; color?: string; modelId?: string } }>).map(o => ({
      entityId: o.entityId,
      meshType: o.renderable.meshType,
      color: o.renderable.color ?? '—',
      modelId: o.renderable.modelId ?? '—',
      pos: JSON.stringify(o.position),
    })));
  }
  console.groupEnd();
}

export const DEBUG_ENABLED = IS_DEBUG;
