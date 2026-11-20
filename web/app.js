"use strict";

const canvas = document.querySelector("#tree-canvas");
const ctx = canvas.getContext("2d");
const playButton = document.querySelector("#play-button");
const playIcon = document.querySelector("#play-icon");
const playLabel = document.querySelector("#play-label");
const soundButton = document.querySelector("#sound-button");
const soundLabel = document.querySelector("#sound-label");
const restartButton = document.querySelector("#restart-button");
const themeSelect = document.querySelector("#theme-select");
const clockLabel = document.querySelector("#clock");
const snowStatus = document.querySelector("#snow-status");

const palette = ["#e6bd68", "#d66c5f", "#b8d2a4", "#d7e5df", "#e7d9bb"];
const melody = [
  ["E5", 1], ["E5", 1], ["E5", 2], ["E5", 1], ["E5", 1], ["E5", 2],
  ["E5", 1], ["G5", 1], ["C5", 1.5], ["D5", .5], ["E5", 4],
  ["F5", 1], ["F5", 1], ["F5", 1.5], ["F5", .5], ["F5", 1],
  ["E5", 1], ["E5", 1.5], ["E5", .5], ["E5", 1], ["D5", 1],
  ["D5", 1], ["E5", 1], ["D5", 2], ["G5", 2],
];
const chimes = [
  ["G5", .75], ["B5", .75], ["D6", 1.5], ["B5", .75], ["G5", 1.5],
  ["A5", .75], ["C6", .75], ["E6", 1.5], ["C6", .75], ["A5", 1.5],
  ["G5", .75], ["B5", .75], ["D6", 1.5], ["E6", .75], ["D6", 2],
];

let width = 0;
let height = 0;
let running = true;
let snowing = true;
let elapsed = 0;
let audioContext = null;
let soundOn = false;
let melodyTimer = null;
let melodyIndex = 0;
let flakes = [];
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
  flakes = Array.from({ length: Math.max(35, Math.floor(width / 5)) }, () => ({
    x: Math.random() * width,
    y: Math.random() * height,
    speed: randomBetween(12, 42),
    size: randomBetween(1, 2.4),
    phase: Math.random() * Math.PI * 2,
  }));
  stars = Array.from({ length: 42 }, () => ({
    x: Math.random() * width,
    y: Math.random() * height * .42,
    phase: Math.random() * Math.PI * 2,
  }));
  ornaments = Array.from({ length: 30 }, (_, i) => ({
    y: .32 + (i / 30) * .43,
    angle: i * 2.399,
    color: palette[i % palette.length],
    size: randomBetween(2, 4),
    phase: Math.random() * 6,
  }));
}

function drawText(text, x, y, color, size, alpha = 1) {
  ctx.globalAlpha = alpha;
  ctx.fillStyle = color;
  ctx.font = `${size}px Consolas, monospace`;
  ctx.fillText(text, x, y);
  ctx.globalAlpha = 1;
}

function drawTree(time) {
  ctx.clearRect(0, 0, width, height);
  const cx = width * .5;
  const treeTop = height * .20;
  const treeBottom = height * .78;
  const treeHeight = treeBottom - treeTop;
  const rotation = time * .35;

  for (const star of stars) {
    const glow = .2 + .65 * (.5 + .5 * Math.sin(time * 1.5 + star.phase));
    drawText(star.phase > 3 ? "." : "+", star.x, star.y, "#dce7dc", Math.max(7, width * .018), glow);
  }

  const starY = treeTop - 8;
  const pulse = .65 + .35 * Math.sin(time * 3);
  ctx.save();
  ctx.shadowColor = "#f4ce79";
  ctx.shadowBlur = 18 * pulse;
  ctx.fillStyle = "#f5d98d";
  ctx.beginPath();
  for (let i = 0; i < 10; i++) {
    const angle = -Math.PI / 2 + i * Math.PI / 5;
    const radius = i % 2 === 0 ? 13 : 5.5;
    const x = cx + Math.cos(angle) * radius;
    const y = starY + Math.sin(angle) * radius;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.fill();
  ctx.restore();

  const layers = 27;
  for (let i = 0; i < layers; i++) {
    const p = i / (layers - 1);
    const y = treeTop + p * treeHeight;
    const half = 13 + p * width * .29;
    const swing = Math.sin(rotation + p * 5) * width * .014;
    const span = Math.max(9, Math.floor(half / (width * .023)));
    let line = "";
    for (let j = -span; j <= span; j++) {
      const depth = 1 - Math.abs(j) / (span + 1);
      const sway = Math.sin(time * 1.4 + j * .7 + i) * .45;
      const glyph = depth > .78 ? (j % 2 ? "/" : "\\") : (depth > .5 ? "v" : (j % 3 ? "*" : "+"));
      line += glyph;
      const x = cx + swing + (j / span) * half;
      const green = Math.round(92 + depth * 92);
      const blue = Math.round(66 + depth * 25 + sway * 5);
      ctx.globalAlpha = .5 + depth * .45;
      ctx.fillStyle = `rgb(${Math.round(58 + depth * 34)},${green},${blue})`;
      ctx.font = `${Math.max(8, width * .024)}px Consolas, monospace`;
      ctx.textAlign = "center";
      ctx.fillText(glyph, x, y);
    }

    if (i % 3 === 0) {
      const snowY = y + 2;
      ctx.strokeStyle = "rgba(224, 238, 230, .32)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(cx - half * .84 + swing, snowY);
      ctx.quadraticCurveTo(cx + swing, snowY + 4, cx + half * .84 + swing, snowY);
      ctx.stroke();
    }
  }
  ctx.globalAlpha = 1;

  const trunkWidth = Math.max(10, width * .045);
  ctx.fillStyle = "#9c6e4c";
  ctx.fillRect(cx - trunkWidth / 2, treeBottom - 2, trunkWidth, height * .09);
  ctx.fillStyle = "#c69a62";
  ctx.fillRect(cx - trunkWidth / 2 + 3, treeBottom, 2, height * .07);

  for (const ornament of ornaments) {
    const y = treeTop + ornament.y * treeHeight;
    const p = (y - treeTop) / treeHeight;
    const spread = 12 + p * width * .27;
    const angle = ornament.angle + rotation;
    const x = cx + Math.sin(angle) * spread * .78;
    const twinkle = .6 + .4 * Math.sin(time * 4 + ornament.phase);
    ctx.save();
    ctx.globalAlpha = .8 + .2 * twinkle;
    ctx.shadowColor = ornament.color;
    ctx.shadowBlur = 7 * twinkle;
    ctx.fillStyle = ornament.color;
    ctx.beginPath();
    ctx.arc(x, y, ornament.size * Math.min(1, width / 360), 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  ctx.strokeStyle = "rgba(207, 173, 105, .6)";
  ctx.lineWidth = 1.3;
  ctx.beginPath();
  for (let i = 0; i <= 160; i++) {
    const p = i / 160;
    const y = treeTop + p * treeHeight;
    const half = 12 + p * width * .29;
    const angle = p * Math.PI * 7 + rotation;
    const x = cx + Math.sin(angle) * half * .78;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.stroke();

  ctx.textAlign = "center";
  drawText("MERRY CHRISTMAS", cx, height * .93, "#c8d7ba", Math.max(9, width * .026), .8);
  ctx.textAlign = "left";
}

let lastFrame = 0;
function frame(now) {
  const dt = Math.min(.05, Math.max(0, (now - lastFrame) / 1000));
  lastFrame = now;
  if (running) elapsed += dt;
  const time = elapsed;
  drawTree(time);
  if (snowing) {
    ctx.save();
    for (const flake of flakes) {
      flake.y += flake.speed * dt;
      flake.x += Math.sin(time + flake.phase) * dt * 9;
      if (flake.y > height) { flake.y = -4; flake.x = Math.random() * width; }
      ctx.globalAlpha = .3 + .5 * Math.sin(time * 2 + flake.phase) ** 2;
      ctx.fillStyle = "#e6eee8";
      ctx.fillRect(flake.x, flake.y, flake.size, flake.size);
    }
    ctx.restore();
  }
  clockLabel.textContent = `${String(Math.floor(time / 60)).padStart(2, "0")}:${String(Math.floor(time % 60)).padStart(2, "0")}`;
  requestAnimationFrame(frame);
}

function updatePlayButton() {
  playIcon.textContent = running ? "Ⅱ" : "▶";
  playLabel.textContent = running ? "Tạm dừng" : "Tiếp tục";
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
  const sequence = themeSelect.value === "jingle" ? melody : chimes;
  const [note, beats] = sequence[melodyIndex % sequence.length];
  melodyIndex += 1;
  const start = audioContext.currentTime;
  const oscillator = audioContext.createOscillator();
  const gain = audioContext.createGain();
  oscillator.type = "sine";
  oscillator.frequency.value = noteFrequency(note);
  gain.gain.setValueAtTime(.0001, start);
  gain.gain.exponentialRampToValueAtTime(.12, start + .025);
  gain.gain.exponentialRampToValueAtTime(.0001, start + Math.max(.18, beats * .28));
  oscillator.connect(gain).connect(audioContext.destination);
  oscillator.start(start);
  oscillator.stop(start + Math.max(.2, beats * .3));
  melodyTimer = window.setTimeout(playNextNote, beats * 310);
}

async function toggleSound() {
  if (soundOn) {
    soundOn = false;
    window.clearTimeout(melodyTimer);
    if (audioContext) await audioContext.suspend();
  } else {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) {
      soundLabel.textContent = "Trình duyệt không hỗ trợ nhạc";
      return;
    }
    audioContext = audioContext || new AudioContextClass();
    await audioContext.resume();
    soundOn = true;
    playNextNote();
  }
  soundButton.setAttribute("aria-pressed", String(soundOn));
  soundLabel.textContent = soundOn ? "Tắt nhạc" : "Bật nhạc";
}

playButton.addEventListener("click", () => {
  running = !running;
  updatePlayButton();
});
soundButton.addEventListener("click", () => { void toggleSound(); });
restartButton.addEventListener("click", () => {
  elapsed = 0;
  lastFrame = performance.now();
});
themeSelect.addEventListener("change", () => { melodyIndex = 0; });
canvas.addEventListener("click", () => {
  snowing = !snowing;
  snowStatus.textContent = snowing ? "SNOW ON" : "SNOW OFF";
});
window.addEventListener("resize", fitCanvas);
fitCanvas();
updatePlayButton();
requestAnimationFrame(frame);
