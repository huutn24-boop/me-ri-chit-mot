"use strict";

const canvas = document.querySelector("#tree-canvas");
const ctx = canvas.getContext("2d");
const notes = [
  ["E5", 1], ["E5", 1], ["E5", 2], ["E5", 1], ["E5", 1], ["E5", 2],
  ["E5", 1], ["G5", 1], ["C5", 1.5], ["D5", .5], ["E5", 4],
  ["F5", 1], ["F5", 1], ["F5", 1.5], ["F5", .5], ["F5", 1],
  ["E5", 1], ["E5", 1.5], ["E5", .5], ["E5", 1], ["D5", 1],
  ["D5", 1], ["E5", 1], ["D5", 2], ["G5", 2],
];
const colors = ["#e6bd68", "#d66c5f", "#b8d2a4", "#d7e5df", "#e7d9bb"];

let width = 0;
let height = 0;
let elapsed = 0;
let lastFrame = 0;
let audioContext = null;
let soundOn = false;
let noteIndex = 0;
let noteTimer = 0;
let snowflakes = [];
let stars = [];
let ornaments = [];

function randomBetween(min, max) {
  return min + Math.random() * (max - min);
}

function fitCanvas() {
  const rect = canvas.getBoundingClientRect();
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  width = rect.width;
  height = rect.height;
  canvas.width = Math.round(width * dpr);
  canvas.height = Math.round(height * dpr);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  const flakeCount = Math.min(150, Math.max(50, Math.round(width / 5)));
  snowflakes = Array.from({ length: flakeCount }, () => ({
    x: Math.random() * width,
    y: Math.random() * height,
    speed: randomBetween(18, 54),
    size: randomBetween(1, 2.5),
    phase: Math.random() * Math.PI * 2,
  }));
  stars = Array.from({ length: 70 }, () => ({
    x: Math.random() * width,
    y: Math.random() * height,
    phase: Math.random() * Math.PI * 2,
  }));
  ornaments = Array.from({ length: 36 }, (_, i) => ({
    y: .13 + (i / 36) * .75,
    angle: i * 2.399,
    color: colors[i % colors.length],
    size: randomBetween(2, 4),
    phase: Math.random() * 6,
  }));
}

function drawBackground(time) {
  ctx.clearRect(0, 0, width, height);
  const glow = ctx.createRadialGradient(width * .5, height * .53, 0, width * .5, height * .53, Math.max(width, height) * .7);
  glow.addColorStop(0, "rgba(30, 66, 58, .22)");
  glow.addColorStop(1, "rgba(7, 16, 21, 0)");
  ctx.fillStyle = "#071015";
  ctx.fillRect(0, 0, width, height);
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, width, height);

  for (const star of stars) {
    const alpha = .2 + .65 * (.5 + .5 * Math.sin(time * 1.5 + star.phase));
    ctx.globalAlpha = alpha;
    ctx.fillStyle = "#dce7dc";
    ctx.font = `${Math.max(8, Math.min(14, width * .018))}px Consolas, monospace`;
    ctx.fillText(star.phase > 3 ? "." : "+", star.x, star.y);
  }
  ctx.globalAlpha = 1;
}

function drawTopStar(x, y, time, scale) {
  ctx.save();
  ctx.shadowColor = "#f4ce79";
  ctx.shadowBlur = 22 * (.65 + .35 * Math.sin(time * 3));
  ctx.fillStyle = "#f5d98d";
  ctx.beginPath();
  for (let i = 0; i < 10; i++) {
    const angle = -Math.PI / 2 + i * Math.PI / 5;
    const radius = (i % 2 === 0 ? 13 : 5.5) * scale;
    const px = x + Math.cos(angle) * radius;
    const py = y + Math.sin(angle) * radius;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

function drawTree(time) {
  drawBackground(time);
  const cx = width * .5;
  const mobile = height > width;
  const treeHeight = mobile
    ? Math.min(height * .78, width * 1.42)
    : Math.min(height * .84, width * .92);
  const treeTop = (height - treeHeight) * .5;
  const treeBottom = treeTop + treeHeight;
  const rotation = time * .24;
  const scale = Math.max(.65, Math.min(1.35, treeHeight / 650));

  drawTopStar(cx, treeTop - 8 * scale, time, scale);

  for (let i = 0; i < 36; i++) {
    const p = i / 35;
    const y = treeTop + p * treeHeight * .88;
    const half = (mobile ? .34 : .43) * p * treeHeight;
    const swing = Math.sin(rotation + p * 5) * treeHeight * .012;
    const span = Math.max(5, Math.floor(half / Math.max(7, width * .023)));
    for (let j = -span; j <= span; j++) {
      const depth = 1 - Math.abs(j) / (span + 1);
      const sway = Math.sin(time * 1.4 + j * .7 + i) * .45;
      const glyph = depth > .78 ? (j % 2 ? "/" : "\\") : (depth > .5 ? "v" : (j % 3 ? "*" : "+"));
      const x = cx + swing + (j / span) * half;
      const green = Math.round(88 + depth * 92);
      const blue = Math.round(60 + depth * 29 + sway * 5);
      ctx.globalAlpha = .45 + depth * .5;
      ctx.fillStyle = `rgb(${Math.round(43 + depth * 35)},${green},${blue})`;
      ctx.font = `${Math.max(8, Math.min(20, treeHeight * .022))}px Consolas, monospace`;
      ctx.textAlign = "center";
      ctx.fillText(glyph, x, y);
    }

    if (i % 3 === 0) {
      const half = (mobile ? .34 : .43) * p * treeHeight;
      ctx.strokeStyle = "rgba(224, 238, 230, .24)";
      ctx.lineWidth = Math.max(1, scale);
      ctx.beginPath();
      ctx.moveTo(cx - half * .84 + swing, y + 2 * scale);
      ctx.quadraticCurveTo(cx + swing, y + 7 * scale, cx + half * .84 + swing, y + 2 * scale);
      ctx.stroke();
    }
  }
  ctx.globalAlpha = 1;

  const trunkWidth = Math.max(10, treeHeight * .04);
  ctx.fillStyle = "#9c6e4c";
  ctx.fillRect(cx - trunkWidth / 2, treeBottom - treeHeight * .1, trunkWidth, treeHeight * .09);
  ctx.fillStyle = "#c69a62";
  ctx.fillRect(cx - trunkWidth / 2 + 3 * scale, treeBottom - treeHeight * .1, 2 * scale, treeHeight * .07);

  for (const ornament of ornaments) {
    const y = treeTop + ornament.y * treeHeight;
    const p = (y - treeTop) / treeHeight;
    const half = (mobile ? .34 : .43) * p * treeHeight;
    const angle = ornament.angle + rotation;
    const x = cx + Math.sin(angle) * half * .78;
    const twinkle = .6 + .4 * Math.sin(time * 4 + ornament.phase);
    ctx.save();
    ctx.globalAlpha = .8 + .2 * twinkle;
    ctx.shadowColor = ornament.color;
    ctx.shadowBlur = 8 * twinkle * scale;
    ctx.fillStyle = ornament.color;
    ctx.beginPath();
    ctx.arc(x, y, ornament.size * scale, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  ctx.strokeStyle = "rgba(207, 173, 105, .58)";
  ctx.lineWidth = Math.max(1, scale * 1.2);
  ctx.beginPath();
  for (let i = 0; i <= 180; i++) {
    const p = i / 180;
    const y = treeTop + p * treeHeight * .88;
    const half = (mobile ? .34 : .43) * p * treeHeight;
    const angle = p * Math.PI * 7 + rotation;
    const x = cx + Math.sin(angle) * half * .78;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.stroke();
  ctx.textAlign = "left";
}

function drawSnow(dt, time) {
  for (const flake of snowflakes) {
    flake.y += flake.speed * dt;
    flake.x += Math.sin(time + flake.phase) * dt * 10;
    if (flake.y > height + 4) {
      flake.y = -4;
      flake.x = Math.random() * width;
    }
    ctx.globalAlpha = .25 + .55 * Math.sin(time * 2 + flake.phase) ** 2;
    ctx.fillStyle = "#e6eee8";
    ctx.fillRect(flake.x, flake.y, flake.size, flake.size);
  }
  ctx.globalAlpha = 1;
}

function frame(now) {
  const dt = Math.min(.05, Math.max(0, (now - lastFrame) / 1000));
  lastFrame = now;
  elapsed += dt;
  drawTree(elapsed);
  drawSnow(dt, elapsed);
  requestAnimationFrame(frame);
}

function noteFrequency(note) {
  const match = /^([A-G])(#?)(\d)$/.exec(note);
  if (!match) return 440;
  const semitone = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 }[match[1]] + (match[2] ? 1 : 0);
  const midi = 12 * (Number(match[3]) + 1) + semitone;
  return 440 * 2 ** ((midi - 69) / 12);
}

function playNextNote() {
  if (!soundOn || !audioContext) return;
  const [note, beats] = notes[noteIndex % notes.length];
  noteIndex++;
  const start = audioContext.currentTime;
  const oscillator = audioContext.createOscillator();
  const gain = audioContext.createGain();
  oscillator.type = "sine";
  oscillator.frequency.value = noteFrequency(note);
  gain.gain.setValueAtTime(.0001, start);
  gain.gain.exponentialRampToValueAtTime(.1, start + .025);
  gain.gain.exponentialRampToValueAtTime(.0001, start + Math.max(.18, beats * .28));
  oscillator.connect(gain).connect(audioContext.destination);
  oscillator.start(start);
  oscillator.stop(start + Math.max(.2, beats * .3));
  noteTimer = window.setTimeout(playNextNote, beats * 310);
}

async function toggleMusic() {
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextClass) return;
  if (!audioContext) audioContext = new AudioContextClass();

  if (soundOn) {
    soundOn = false;
    window.clearTimeout(noteTimer);
    await audioContext.suspend();
    return;
  }

  await audioContext.resume();
  soundOn = true;
  playNextNote();
}

window.addEventListener("pointerdown", () => { void toggleMusic(); });
window.addEventListener("keydown", (event) => {
  if (event.code === "Space" || event.key.toLowerCase() === "m") {
    event.preventDefault();
    void toggleMusic();
  }
});
window.addEventListener("resize", fitCanvas);
window.addEventListener("orientationchange", fitCanvas);
document.addEventListener("visibilitychange", () => {
  if (soundOn && audioContext) {
    if (document.hidden) void audioContext.suspend();
    else void audioContext.resume();
  }
});

fitCanvas();
requestAnimationFrame(frame);
