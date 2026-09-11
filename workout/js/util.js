/* Shared helpers: time maths, tiny DOM builder, audio. */
import { exerciseById } from './exercises.js';
import { getSettings } from './storage.js';

/* ─── Time ─────────────────────────────────────────────────────────────── */

/** seconds -> "M:SS" */
export function fmtTime(total) {
  const t = Math.max(0, Math.round(total));
  const s = t % 60;
  return `${Math.floor(t / 60)}:${s < 10 ? '0' : ''}${s}`;
}

/*
 * How many reps an item asks for. A plain count is the common case and stays a
 * plain number; `repsMax` makes it a range, and `toFailure` replaces the count
 * with "as many as you have". Only ever one of the three.
 */
export function repsLabel(item) {
  if (item.toFailure) return 'To failure';
  const low = Number(item.reps) || 0;
  const high = Number(item.repsMax) || 0;
  // An en dash, not a hyphen: this is a span, not a subtraction.
  return high > low ? `${low}–${high}` : String(low);
}

/* The rep count to budget time against — the top of a range, so an estimate
 * errs long rather than short. To failure has no number, so it uses a nominal. */
function repsForEstimate(item) {
  if (item.toFailure) return Number(item.reps) || 10;
  return Math.max(Number(item.reps) || 0, Number(item.repsMax) || 0) || 8;
}

/**
 * Rep-mode items still need a time budget for the estimate and the player.
 * Rough: 3s per rep, min 20s.
 */
export function estimateRepSeconds(item) {
  return Math.max(20, repsForEstimate(item) * 3);
}

/**
 * Estimated duration of a circuit, in seconds. An AMRAP runs for exactly as
 * long as you set it to, so there is nothing to estimate. A perSide item on a
 * unilateral exercise counts its work twice.
 */
export function circuitSeconds(circuit) {
  if (circuit.type === 'amrap') return Number(circuit.duration) || 0;

  let perRound = 0;
  for (const item of circuit.items || []) {
    const ex = exerciseById(item.exerciseId);
    const sides = item.perSide && ex && ex.unilateral ? 2 : 1;
    const work = item.mode === 'reps' ? estimateRepSeconds(item) : Number(item.work) || 0;
    perRound += work * sides + (Number(item.rest) || 0);
  }
  const rounds = Math.max(1, Number(circuit.rounds) || 1);
  const between = (Number(circuit.restBetweenRounds) || 0) * (rounds - 1);
  return perRound * rounds + between;
}

/** A rough count of how long one lap of an AMRAP takes, for the estimate. */
export function amrapRoundSeconds(circuit) {
  return (circuit.items || []).reduce((total, item) => {
    return total + estimateRepSeconds(item) * (item.perSide ? 2 : 1);
  }, 0);
}

/* ─── Text ─────────────────────────────────────────────────────────────── */

/** "half-kneeling" -> "Half kneeling". Sentence case, per the design system. */
export function sentenceCase(s) {
  const flat = String(s).replace(/-/g, ' ');
  return flat.charAt(0).toUpperCase() + flat.slice(1);
}

/* ─── DOM ──────────────────────────────────────────────────────────────── */

export function el(tag, attrs, children) {
  const node = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs || {})) {
    if (v == null) continue;
    if (k === 'class') node.className = v;
    else if (k === 'text') node.textContent = v;
    else if (k.startsWith('on') && typeof v === 'function') node.addEventListener(k.slice(2), v);
    else node.setAttribute(k, v);
  }
  for (const child of children || []) {
    if (child == null) continue;
    node.appendChild(typeof child === 'string' ? document.createTextNode(child) : child);
  }
  return node;
}

export function clear(node) {
  while (node.firstChild) node.removeChild(node.firstChild);
  return node;
}

/* ─── Audio ────────────────────────────────────────────────────────────── */

/* A WebAudio blip, so there are no asset files to ship or cache. */
let actx = null;

export function beep(freq = 660, ms = 150) {
  if (!getSettings().beeps) return;
  try {
    actx = actx || new (window.AudioContext || window.webkitAudioContext)();
    if (actx.state === 'suspended') actx.resume();

    const osc = actx.createOscillator();
    const gain = actx.createGain();
    osc.frequency.value = freq;
    osc.type = 'sine';
    gain.gain.setValueAtTime(0.001, actx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.25, actx.currentTime + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.001, actx.currentTime + ms / 1000);
    osc.connect(gain).connect(actx.destination);
    osc.start();
    osc.stop(actx.currentTime + ms / 1000 + 0.02);
  } catch (e) {
    /* muted is survivable; throwing isn't */
  }
}
