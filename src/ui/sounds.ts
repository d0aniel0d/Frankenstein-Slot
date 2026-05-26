let audioCtx: AudioContext | null = null;
let muted = false;
let humOscs: OscillatorNode[] = [];
let humGain: GainNode | null = null;
let windSource: AudioBufferSourceNode | null = null;
let windSource2: AudioBufferSourceNode | null = null;
let ambientCleanup: Array<() => void> = [];
let spookyEventTimer: ReturnType<typeof setInterval> | null = null;
let heartbeatTimer: ReturnType<typeof setInterval> | null = null;
let anticipationOscs: OscillatorNode[] = [];
let anticipationGain: GainNode | null = null;
let anticipationLfo: OscillatorNode | null = null;
let teasePulseTimer: ReturnType<typeof setInterval> | null = null;

export function initAudio(): void {
  if (!audioCtx) {
    audioCtx = new AudioContext();
  }
  if (audioCtx.state === "suspended") {
    void audioCtx.resume();
  }
}

function ctx(): AudioContext | null {
  return audioCtx;
}

function tone(
  freq: number,
  duration: number,
  type: OscillatorType = "square",
  gain = 0.08,
  when = 0,
  detune = 0
): void {
  const ac = ctx();
  if (!ac || muted) return;
  const osc = ac.createOscillator();
  const g = ac.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  osc.detune.value = detune;
  osc.connect(g);
  g.connect(ac.destination);
  const t = ac.currentTime + when;
  g.gain.setValueAtTime(gain, t);
  g.gain.exponentialRampToValueAtTime(0.001, t + duration);
  osc.start(t);
  osc.stop(t + duration + 0.04);
}

function dualTone(
  freq: number,
  duration: number,
  type: OscillatorType = "square",
  gain = 0.06,
  when = 0
): void {
  tone(freq, duration, type, gain, when, 0);
  tone(freq * 1.01, duration, type, gain * 0.65, when, 8);
}

function sweep(
  startFreq: number,
  endFreq: number,
  duration: number,
  type: OscillatorType = "sawtooth",
  gain = 0.07,
  when = 0
): void {
  const ac = ctx();
  if (!ac || muted) return;
  const osc = ac.createOscillator();
  const g = ac.createGain();
  osc.type = type;
  osc.connect(g);
  g.connect(ac.destination);
  const t = ac.currentTime + when;
  osc.frequency.setValueAtTime(startFreq, t);
  osc.frequency.exponentialRampToValueAtTime(Math.max(endFreq, 40), t + duration);
  g.gain.setValueAtTime(gain, t);
  g.gain.exponentialRampToValueAtTime(0.001, t + duration);
  osc.start(t);
  osc.stop(t + duration + 0.04);
}

function noiseBurst(
  duration: number,
  gain = 0.08,
  when = 0,
  highpass = 600
): void {
  const ac = ctx();
  if (!ac || muted) return;
  const bufferSize = Math.floor(ac.sampleRate * duration);
  const buffer = ac.createBuffer(1, bufferSize, ac.sampleRate);
  const data = buffer.getChannelData(0)!;
  for (let i = 0; i < bufferSize; i++) {
    data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize) ** 1.15;
  }
  const src = ac.createBufferSource();
  src.buffer = buffer;
  const g = ac.createGain();
  const filter = ac.createBiquadFilter();
  filter.type = "highpass";
  filter.frequency.value = highpass;
  src.connect(filter);
  filter.connect(g);
  g.connect(ac.destination);
  const t = ac.currentTime + when;
  g.gain.setValueAtTime(gain, t);
  g.gain.exponentialRampToValueAtTime(0.001, t + duration);
  src.start(t);
  src.stop(t + duration + 0.02);
}

function impact(lowFreq: number, gain = 0.14, when = 0): void {
  noiseBurst(0.12, gain * 0.75, when, 350);
  dualTone(lowFreq, 0.16, "sine", gain, when);
  tone(lowFreq * 2.5, 0.07, "triangle", gain * 0.4, when + 0.03);
}

function arpeggio(
  freqs: number[],
  step = 0.055,
  type: OscillatorType = "square",
  gain = 0.06,
  startWhen = 0
): void {
  freqs.forEach((f, i) => dualTone(f, step * 1.35, type, gain, startWhen + i * step));
}

function playDistantSpookyAccent(): void {
  if (muted) return;
  const roll = Math.random();
  if (roll < 0.22) {
    sweep(220, 48, 2.2, "sine", 0.055);
    noiseBurst(0.8, 0.03, 0.1, 60);
    tone(49, 1.8, "triangle", 0.04, 0.3);
  } else if (roll < 0.42) {
    dualTone(73.4, 0.9, "sawtooth", 0.04);
    tone(103.8, 0.7, "sine", 0.03, 0.15);
    noiseBurst(0.35, 0.035, 0, 100);
  } else if (roll < 0.58) {
    arpeggio([49, 46.2, 43.6, 41.2], 0.22, "sine", 0.038);
    noiseBurst(0.2, 0.04, 0.5, 200);
  } else if (roll < 0.74) {
    sweep(55, 28, 1.6, "sawtooth", 0.05);
    noiseBurst(1.1, 0.04, 0, 45);
    [0, 0.4, 0.85].forEach((w) => tone(62, 0.25, "sine", 0.035, w));
  } else if (roll < 0.88) {
    noiseBurst(0.15, 0.07, 0, 400);
    sweep(160, 520, 0.35, "square", 0.035);
    sweep(520, 90, 0.5, "sine", 0.03, 0.2);
  } else {
    dualTone(155.6, 0.5, "triangle", 0.032);
    tone(77.8, 1.2, "sine", 0.038, 0.08);
    noiseBurst(0.5, 0.025, 0.2, 90);
  }
}

function playSubtleHeartbeat(): void {
  if (muted) return;
  tone(30, 0.18, "sine", 0.055);
  tone(45, 0.1, "triangle", 0.028, 0.06);
  noiseBurst(0.09, 0.028, 0.02, 90);
}

function makeWindBuffer(ac: AudioContext, seconds: number, harshness: number): AudioBuffer {
  const windLen = Math.floor(ac.sampleRate * seconds);
  const windBuf = ac.createBuffer(1, windLen, ac.sampleRate);
  const windData = windBuf.getChannelData(0)!;
  let prev = 0;
  for (let i = 0; i < windLen; i++) {
    const raw = (Math.random() * 2 - 1) * harshness;
    prev = prev * 0.92 + raw * 0.08;
    windData[i] = prev;
  }
  return windBuf;
}

function trackAmbient(cleanup: () => void): void {
  ambientCleanup.push(cleanup);
}

function clearAmbientExtras(): void {
  for (const fn of ambientCleanup) fn();
  ambientCleanup = [];
}

/** 持续阴森环境音（墓地风 + 不协和低音 + 洞穴混响 + 远处怪声） */
export function playCabinetHum(): void {
  const ac = ctx();
  if (!ac || muted) return;
  stopCabinetHum();

  const master = ac.createGain();
  master.gain.value = 0.042;
  humGain = master;

  const dryBus = ac.createGain();
  dryBus.gain.value = 0.72;
  const wetBus = ac.createGain();
  wetBus.gain.value = 0.55;

  const delay = ac.createDelay(3);
  delay.delayTime.value = 0.62;
  const feedback = ac.createGain();
  feedback.gain.value = 0.48;
  const delayIn = ac.createGain();
  delayIn.gain.value = 1;

  const toneFilter = ac.createBiquadFilter();
  toneFilter.type = "lowpass";
  toneFilter.frequency.value = 155;
  toneFilter.Q.value = 0.9;

  toneFilter.connect(dryBus);
  toneFilter.connect(delayIn);
  delayIn.connect(delay);
  delay.connect(feedback);
  feedback.connect(delay);
  delay.connect(wetBus);
  dryBus.connect(master);
  wetBus.connect(master);
  master.connect(ac.destination);

  trackAmbient(() => {
    delay.disconnect();
    feedback.disconnect();
    delayIn.disconnect();
    dryBus.disconnect();
    wetBus.disconnect();
    toneFilter.disconnect();
  });

  const dronePairs: Array<[number, number, number]> = [
    [32.7, 46.2, 0.32],
    [41.2, 58.3, 0.28],
    [49, 69.3, 0.24],
    [65.4, 92.5, 0.2],
  ];
  for (const [f1, f2, vol] of dronePairs) {
    for (const f of [f1, f2]) {
      const osc = ac.createOscillator();
      osc.type = "sawtooth";
      osc.frequency.value = f;
      osc.detune.value = f === f1 ? -7 : 9;
      const g = ac.createGain();
      g.gain.value = vol;
      osc.connect(g);
      g.connect(toneFilter);
      osc.start();
      humOscs.push(osc);
    }
  }

  const sub = ac.createOscillator();
  sub.type = "sine";
  sub.frequency.value = 24.5;
  const subG = ac.createGain();
  subG.gain.value = 0.38;
  sub.connect(subG);
  subG.connect(toneFilter);
  sub.start();
  humOscs.push(sub);

  const unease = ac.createOscillator();
  unease.type = "triangle";
  unease.frequency.value = 103;
  const uneaseG = ac.createGain();
  uneaseG.gain.value = 0.06;
  unease.connect(uneaseG);
  uneaseG.connect(toneFilter);
  unease.start();
  humOscs.push(unease);

  const subPulse = ac.createOscillator();
  subPulse.type = "sine";
  subPulse.frequency.value = 0.9;
  const subPulseG = ac.createGain();
  subPulseG.gain.value = 0.12;
  subPulse.connect(subPulseG);
  subPulseG.connect(subG.gain);
  subPulse.start();
  humOscs.push(subPulse);

  const howlLfo = ac.createOscillator();
  howlLfo.type = "sine";
  howlLfo.frequency.value = 0.11;
  const howlLfoG = ac.createGain();
  howlLfoG.gain.value = 55;
  howlLfo.connect(howlLfoG);
  howlLfo.start();
  humOscs.push(howlLfo);

  const howlOsc = ac.createOscillator();
  howlOsc.type = "sawtooth";
  howlOsc.frequency.value = 138;
  const howlOscG = ac.createGain();
  howlOscG.gain.value = 0.04;
  howlOsc.connect(howlOscG);
  howlOscG.connect(toneFilter);
  howlLfoG.connect(howlOsc.frequency);
  howlOsc.start();
  humOscs.push(howlOsc);

  windSource = ac.createBufferSource();
  windSource.buffer = makeWindBuffer(ac, 4, 0.7);
  windSource.loop = true;
  const windFilter = ac.createBiquadFilter();
  windFilter.type = "bandpass";
  windFilter.frequency.value = 240;
  windFilter.Q.value = 0.55;
  const windG = ac.createGain();
  windG.gain.value = 0.2;
  windSource.connect(windFilter);
  windFilter.connect(windG);
  windG.connect(toneFilter);
  windSource.start();

  const windLfo = ac.createOscillator();
  windLfo.type = "sine";
  windLfo.frequency.value = 0.07;
  const windLfoG = ac.createGain();
  windLfoG.gain.value = 0.09;
  windLfo.connect(windLfoG);
  windLfoG.connect(windG.gain);
  windLfo.start();
  humOscs.push(windLfo);

  windSource2 = ac.createBufferSource();
  windSource2.buffer = makeWindBuffer(ac, 5, 0.85);
  windSource2.loop = true;
  const wind2Filter = ac.createBiquadFilter();
  wind2Filter.type = "lowpass";
  wind2Filter.frequency.value = 120;
  const wind2G = ac.createGain();
  wind2G.gain.value = 0.16;
  windSource2.connect(wind2Filter);
  wind2Filter.connect(wind2G);
  wind2G.connect(toneFilter);
  windSource2.start();

  const wind2Lfo = ac.createOscillator();
  wind2Lfo.type = "sine";
  wind2Lfo.frequency.value = 0.14;
  const wind2LfoG = ac.createGain();
  wind2LfoG.gain.value = 0.07;
  wind2Lfo.connect(wind2LfoG);
  wind2LfoG.connect(wind2G.gain);
  wind2Lfo.start();
  humOscs.push(wind2Lfo);

  spookyEventTimer = setInterval(
    () => playDistantSpookyAccent(),
    3200 + Math.random() * 4800
  );

  heartbeatTimer = setInterval(
    () => playSubtleHeartbeat(),
    1600 + Math.random() * 1200
  );
}

export function stopCabinetHum(): void {
  if (spookyEventTimer) {
    clearInterval(spookyEventTimer);
    spookyEventTimer = null;
  }
  if (heartbeatTimer) {
    clearInterval(heartbeatTimer);
    heartbeatTimer = null;
  }
  clearAmbientExtras();
  for (const src of [windSource, windSource2]) {
    if (!src) continue;
    try {
      src.stop();
    } catch {
      /* already stopped */
    }
    src.disconnect();
  }
  windSource = null;
  windSource2 = null;
  for (const osc of humOscs) {
    try {
      osc.stop();
    } catch {
      /* already stopped */
    }
    osc.disconnect();
  }
  humOscs = [];
  humGain?.disconnect();
  humGain = null;
}

export function stopCollectAnticipation(): void {
  stopReelTeasePulse();
  if (anticipationLfo) {
    try {
      anticipationLfo.stop();
    } catch {
      /* already stopped */
    }
    anticipationLfo.disconnect();
    anticipationLfo = null;
  }
  for (const osc of anticipationOscs) {
    try {
      osc.stop();
    } catch {
      /* already stopped */
    }
    osc.disconnect();
  }
  anticipationOscs = [];
  anticipationGain?.disconnect();
  anticipationGain = null;
}

/** 第 1 列停到 It's Alive：紧张垫音（其余列仍在转） */
export function startCollectAnticipation(): void {
  const ac = ctx();
  if (!ac || muted) return;
  stopCollectAnticipation();

  const master = ac.createGain();
  master.gain.value = 0.052;
  const filter = ac.createBiquadFilter();
  filter.type = "bandpass";
  filter.frequency.value = 200;
  filter.Q.value = 1.1;
  filter.connect(master);
  master.connect(ac.destination);
  anticipationGain = master;

  anticipationLfo = ac.createOscillator();
  anticipationLfo.type = "sine";
  anticipationLfo.frequency.value = 0.45;
  const lfoG = ac.createGain();
  lfoG.gain.value = 90;
  anticipationLfo.connect(lfoG);
  lfoG.connect(filter.frequency);
  anticipationLfo.start();

  for (const f of [70, 95, 140, 190, 260, 330]) {
    const osc = ac.createOscillator();
    osc.type = f < 160 ? "sawtooth" : "square";
    osc.frequency.value = f;
    const g = ac.createGain();
    g.gain.value = 0.2;
    osc.connect(g);
    g.connect(filter);
    osc.start();
    anticipationOscs.push(osc);
  }

  const pulse = ac.createOscillator();
  pulse.type = "sine";
  pulse.frequency.value = 2.8;
  const pulseG = ac.createGain();
  pulseG.gain.value = 0.028;
  pulse.connect(pulseG);
  pulseG.connect(filter);
  pulse.start();
  anticipationOscs.push(pulse);
}

/** It's Alive 后进一步拉高期待感 */
export function rampCollectAnticipation(): void {
  const ac = ctx();
  if (!ac || muted) return;
  if (!anticipationGain) startCollectAnticipation();
  const t = ac.currentTime;
  anticipationGain?.gain.cancelScheduledValues(t);
  anticipationGain?.gain.setValueAtTime(anticipationGain?.gain.value ?? 0.05, t);
  anticipationGain?.gain.linearRampToValueAtTime(0.078, t + 0.5);

  sweep(120, 520, 0.55, "sawtooth", 0.09);
  arpeggio([196, 247, 294, 370], 0.09, "square", 0.055, 0.08);
  noiseBurst(0.2, 0.1, 0.15, 200);
}

export function playAliveReelLand(): void {
  noiseBurst(0.25, 0.14, 0, 150);
  sweep(80, 320, 0.2, "sawtooth", 0.11);
  dualTone(440, 0.12, "square", 0.08);
  tone(55, 0.25, "sine", 0.1);
  rampCollectAnticipation();
}

/** 第 2–5 列在期待模式下停轮 */
export function playAnticipationReelLand(reelIndex: number): void {
  const tension = reelIndex / 4;
  impact(40 + reelIndex * 10, 0.12 + tension * 0.06);
  sweep(180 + reelIndex * 90, 680 + reelIndex * 120, 0.22, "sawtooth", 0.08 + tension * 0.03);
  dualTone(330 + reelIndex * 55, 0.1, "square", 0.07, 0.06);
  if (reelIndex >= 3) {
    arpeggio([392, 494, 587, 740], 0.08, "sine", 0.05, 0.12);
  }
  if (reelIndex === 4) {
    noiseBurst(0.18, 0.08, 0.2, 500);
    dualTone(880, 0.14, "sine", 0.06, 0.25);
  }
}

/** 第 5 轴拖长转动时的心跳滴答 */
export function startReelTeasePulse(): void {
  stopReelTeasePulse();
  if (muted) return;
  let beat = 0;
  teasePulseTimer = setInterval(() => {
    beat++;
    const freq = 58 + beat * 4;
    tone(freq, 0.1, "sine", 0.1);
    noiseBurst(0.04, 0.055, 0, 180 + beat * 40);
    if (beat % 2 === 0) tone(freq * 1.5, 0.06, "triangle", 0.05, 0.04);
  }, 260);
}

export function stopReelTeasePulse(): void {
  if (teasePulseTimer) {
    clearInterval(teasePulseTimer);
    teasePulseTimer = null;
  }
}

export function playReelTeaseTick(reelIndex: number): void {
  const f = 140 + reelIndex * 35 + Math.random() * 40;
  tone(f, 0.028, "square", 0.045);
  noiseBurst(0.015, 0.03, 0, 2200);
}

export function startCollectClimax(): void {
  stopCollectAnticipation();
  const ac = ctx();
  if (!ac || muted) return;
  const master = ac.createGain();
  master.gain.value = 0.055;
  master.connect(ac.destination);
  anticipationGain = master;

  for (const f of [60, 100, 200, 400]) {
    const osc = ac.createOscillator();
    osc.type = "sawtooth";
    osc.frequency.value = f;
    const g = ac.createGain();
    g.gain.value = 0.28;
    osc.connect(g);
    g.connect(master);
    osc.start();
    anticipationOscs.push(osc);
  }
}

export function playSpinStart(): void {
  noiseBurst(0.22, 0.11, 0, 280);
  sweep(60, 200, 0.28, "sawtooth", 0.1);
  sweep(200, 620, 0.18, "square", 0.07, 0.1);
  dualTone(740, 0.08, "sine", 0.05, 0.22);
  tone(55, 0.2, "sine", 0.06, 0);
}

export function playReelSpinTick(reelIndex: number): void {
  const f = 120 + reelIndex * 28 + Math.random() * 35;
  tone(f, 0.022, "square", 0.038);
  noiseBurst(0.012, 0.02, 0, 1800);
}

export function playReelStop(reelIndex: number): void {
  const base = 48 + reelIndex * 14;
  impact(base, 0.18);
  noiseBurst(0.07, 0.09, 0.04, 2200);
  dualTone(280 + reelIndex * 65, 0.1, "square", 0.085, 0.05);
  sweep(1100 - reelIndex * 50, 140, 0.12, "sawtooth", 0.07, 0.07);
  if (reelIndex === 4) {
    arpeggio([392, 523, 659, 784], 0.07, "sine", 0.055, 0.14);
    noiseBurst(0.15, 0.06, 0.35, 800);
  }
}

export function playLightning(): void {
  noiseBurst(0.28, 0.16, 0, 120);
  noiseBurst(0.1, 0.12, 0.04, 4000);
  sweep(30, 90, 0.1, "sawtooth", 0.12);
  sweep(150, 1200, 0.16, "square", 0.08, 0.05);
  dualTone(80, 0.1, "sine", 0.1, 0.08);
  [0, 0.06, 0.11].forEach((w) => noiseBurst(0.04, 0.07, w, 2500));
}

export function playCollectCoin(): void {
  arpeggio([659, 831, 988, 1318, 1568, 2093], 0.04, "sine", 0.075);
  noiseBurst(0.05, 0.06, 0.2, 5000);
  dualTone(2637, 0.1, "sine", 0.06, 0.28);
}

/** Free Games 风车符号停到可见格时 */
export function playFreeGamesLand(): void {
  noiseBurst(0.2, 0.1, 0, 200);
  sweep(180, 520, 0.22, "sawtooth", 0.09);
  arpeggio([392, 494, 587, 740, 988], 0.07, "square", 0.065, 0.06);
  dualTone(1175, 0.14, "sine", 0.07, 0.22);
  noiseBurst(0.12, 0.08, 0.35, 1200);
  tone(880, 0.18, "triangle", 0.06, 0.4);
}

export function playPowerUp(): void {
  sweep(120, 380, 0.14, "square", 0.09);
  sweep(380, 1100, 0.16, "sawtooth", 0.08, 0.12);
  arpeggio([294, 370, 440, 587, 740, 988], 0.055, "square", 0.07, 0.2);
  noiseBurst(0.14, 0.08, 0.4, 3000);
  dualTone(1175, 0.2, "sine", 0.05, 0.55);
}

export function playBigWin(): void {
  impact(38, 0.14);
  arpeggio([196, 262, 330, 392, 523, 659, 784, 1047, 1318], 0.09, "square", 0.075);
  sweep(180, 1400, 0.45, "sawtooth", 0.09, 0.35);
  [523, 659, 784, 1047, 1318, 1568].forEach((f, i) => {
    dualTone(f, 0.2, "sine", 0.065, 0.75 + i * 0.12);
  });
  noiseBurst(0.35, 0.1, 1.2, 400);
}

export function setMuted(value: boolean): void {
  muted = value;
  if (muted) {
    stopCabinetHum();
    stopCollectAnticipation();
  } else if (humOscs.length === 0 && !windSource && !windSource2) playCabinetHum();
}
