/**
 * SOURCE OF TRUTH KEYWORDS: sound, Web Audio, synthesized UI sounds, unlock, play, patches, film audio
 * WHAT:  The film's sound effects, synthesized with Web Audio from short tone and noise layers.
 * WHY:   No audio files to ship; every sound stays quiet, short and on brand. Off until the visitor asks.
 * WHERE: src/components/landing/film/use-player.ts (cues from script.ts).
 */
type Tone = { type: "tone"; wave: OscillatorType; freq: number; to?: number; glide?: number };
type Noise = { type: "noise"; filter: BiquadFilterType; freq: number; to?: number; q?: number };
type Layer = (Tone | Noise) & { at?: number; attack: number; decay: number; peak: number };
type Patch = { layers: Layer[]; air?: number };

export type Sound = "key" | "switch" | "pop" | "tick" | "whoosh" | "sweep" | "chime" | "start" | "type";

const PATCHES: Record<Sound, Patch> = {
  key: {
    layers: [
      { type: "noise", filter: "highpass", freq: 4000, q: 0.7, attack: 0.001, decay: 0.024, peak: 0.1 },
      { type: "tone", wave: "sine", freq: 2000, attack: 0.001, decay: 0.03, peak: 0.014 },
    ],
    air: 0.05,
  },
  type: {
    layers: [{ type: "noise", filter: "highpass", freq: 5200, q: 0.6, attack: 0.001, decay: 0.012, peak: 0.035 }],
  },
  switch: {
    layers: [
      { type: "noise", filter: "bandpass", freq: 1700, q: 1.5, attack: 0.001, decay: 0.02, peak: 0.08 },
      { type: "tone", wave: "sine", freq: 1400, attack: 0.001, decay: 0.04, peak: 0.018 },
    ],
  },
  pop: {
    layers: [
      { type: "tone", wave: "sine", freq: 600, to: 1020, glide: 0.05, attack: 0.002, decay: 0.1, peak: 0.05 },
      { type: "noise", filter: "bandpass", freq: 2000, q: 2, attack: 0.001, decay: 0.015, peak: 0.03 },
    ],
    air: 0.12,
  },
  tick: { layers: [{ type: "tone", wave: "sine", freq: 2600, attack: 0.001, decay: 0.018, peak: 0.02 }] },
  whoosh: {
    layers: [{ type: "noise", filter: "lowpass", freq: 260, to: 1700, q: 0.8, attack: 0.08, decay: 0.4, peak: 0.07 }],
    air: 0.1,
  },
  sweep: {
    layers: [
      { type: "noise", filter: "bandpass", freq: 500, to: 5000, q: 1.2, attack: 0.03, decay: 0.5, peak: 0.05 },
      { type: "tone", wave: "sine", freq: 392, to: 784, glide: 0.4, attack: 0.02, decay: 0.45, peak: 0.018 },
    ],
    air: 0.15,
  },
  chime: {
    layers: [
      { type: "tone", wave: "sine", freq: 880, attack: 0.004, decay: 0.7, peak: 0.055 },
      { type: "tone", wave: "sine", freq: 1318.51, at: 0.12, attack: 0.004, decay: 0.9, peak: 0.045 },
      { type: "tone", wave: "sine", freq: 1760, at: 0.12, attack: 0.004, decay: 0.5, peak: 0.01 },
    ],
    air: 0.35,
  },
  start: {
    layers: [
      { type: "tone", wave: "sine", freq: 150, to: 90, glide: 0.08, attack: 0.002, decay: 0.1, peak: 0.09 },
      { type: "tone", wave: "sine", freq: 880, at: 0.01, attack: 0.003, decay: 0.12, peak: 0.045 },
      { type: "tone", wave: "sine", freq: 1318.51, at: 0.1, attack: 0.003, decay: 0.24, peak: 0.04 },
    ],
    air: 0.2,
  },
};

type Engine = { ctx: AudioContext; master: GainNode; send: GainNode; noise: AudioBuffer };
let engine: Engine | null = null;

function setup(): Engine | null {
  if (engine) return engine;
  if (typeof AudioContext === "undefined") return null;
  const ctx = new AudioContext();
  const master = ctx.createGain();
  master.gain.value = 0.9;
  master.connect(ctx.destination);

  // A short feedback delay through a low-pass adds a little room to the louder sounds.
  const send = ctx.createGain();
  const delay = ctx.createDelay(1);
  delay.delayTime.value = 0.13;
  const feedback = ctx.createGain();
  feedback.gain.value = 0.28;
  const tone = ctx.createBiquadFilter();
  tone.type = "lowpass";
  tone.frequency.value = 2800;
  send.connect(delay);
  delay.connect(tone);
  tone.connect(feedback);
  feedback.connect(delay);
  tone.connect(master);

  const noise = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
  const data = noise.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
  engine = { ctx, master, send, noise };
  return engine;
}

/** Creates or resumes the audio context. Browsers only allow this inside a user gesture. */
export function unlock() {
  const e = setup();
  if (e?.ctx.state === "suspended") void e.ctx.resume();
}

/** Plays a sound now. `variant` nudges the pitch so repeats don't sound identical. */
export function play(name: Sound, variant = 0) {
  if (!engine || engine.ctx.state !== "running") return;
  const { ctx, master, send } = engine;
  const patch = PATCHES[name];
  const out = ctx.createGain();
  out.connect(master);
  if (patch.air) {
    const wet = ctx.createGain();
    wet.gain.value = patch.air;
    out.connect(wet);
    wet.connect(send);
  }
  const pitch = 1 + (((variant * 7) % 5) - 2) * 0.025;
  const now = ctx.currentTime + 0.005;
  for (const layer of patch.layers) voice(engine, out, layer, now + (layer.at ?? 0), pitch);
}

function voice({ ctx, noise }: Engine, out: AudioNode, layer: Layer, t0: number, pitch: number) {
  const end = t0 + layer.attack + layer.decay;
  const env = ctx.createGain();
  env.gain.setValueAtTime(0, t0);
  env.gain.linearRampToValueAtTime(layer.peak, t0 + layer.attack);
  env.gain.exponentialRampToValueAtTime(0.0001, end);
  env.connect(out);

  let source: AudioScheduledSourceNode;
  if (layer.type === "tone") {
    const osc = ctx.createOscillator();
    osc.type = layer.wave;
    osc.frequency.setValueAtTime(layer.freq * pitch, t0);
    if (layer.to) osc.frequency.exponentialRampToValueAtTime(layer.to * pitch, t0 + (layer.glide ?? layer.decay));
    osc.connect(env);
    source = osc;
  } else {
    const buffer = ctx.createBufferSource();
    buffer.buffer = noise;
    const filter = ctx.createBiquadFilter();
    filter.type = layer.filter;
    filter.frequency.setValueAtTime(layer.freq * pitch, t0);
    if (layer.to) filter.frequency.exponentialRampToValueAtTime(layer.to * pitch, end);
    filter.Q.value = layer.q ?? 1;
    buffer.connect(filter);
    filter.connect(env);
    source = buffer;
  }
  source.start(t0);
  source.stop(end + 0.05);
}
