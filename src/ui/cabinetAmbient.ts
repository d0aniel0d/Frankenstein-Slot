import { initAudio, playCabinetHum, stopCabinetHum } from "./sounds";

let eyeTimer: ReturnType<typeof setInterval> | null = null;
let humStarted = false;
let audioUnlockBound = false;

function unlockAndStartHum(): void {
  initAudio();
  if (humStarted) return;
  humStarted = true;
  playCabinetHum();
}

export function initCabinetAmbient(): void {
  if (eyeTimer) return;
  eyeTimer = setInterval(() => {
    document.querySelector(".topper")?.classList.add("eyes-blink");
    setTimeout(() => document.querySelector(".topper")?.classList.remove("eyes-blink"), 180);
  }, 3200 + Math.random() * 2000);

  if (!audioUnlockBound) {
    audioUnlockBound = true;
    const onFirstInteract = () => {
      unlockAndStartHum();
      document.removeEventListener("pointerdown", onFirstInteract);
      document.removeEventListener("keydown", onFirstInteract);
    };
    document.addEventListener("pointerdown", onFirstInteract, { once: true });
    document.addEventListener("keydown", onFirstInteract, { once: true });
  }
}

export function startCabinetHum(): void {
  unlockAndStartHum();
}

export function stopCabinetAmbient(): void {
  if (eyeTimer) {
    clearInterval(eyeTimer);
    eyeTimer = null;
  }
  humStarted = false;
  stopCabinetHum();
}
