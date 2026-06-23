import type React from 'react'

export interface SceneModelProps {
  activeBeatId: string | null
  modelState?: unknown
  /** Mark the currently-active beat's gate as satisfied. */
  satisfyGate?: () => void
  /**
   * Entrance choreography: the model panel reveals only after the section's
   * text has landed and the reader scrolls once more. Models may use this to
   * stagger their own internals, but the panel-level reveal is handled by the
   * shell.
   */
  revealed?: boolean
}

/* ---- beats ---- */

// Each kind names the *kind of thought* the manipulation embodies, so the beat
// cue can match the action:
//   roll   — throw / sample (frequency, randomness)
//   slider — pull a number or scale (a law of large numbers, N, a size)
//   select — mark out a subset (an event, which 5 of 10)
//   pick   — choose between competing alternatives (which hold, which path)
//   place  — drag / lay things out (stars into boxes)
//   build  — assemble or order a thing one piece at a time (add a die, a row)
//   hold   — keep dice across a reroll
//   toggle — flip between two worlds (independent/dependent, mean/win)
//   step   — perform one deductive step (collapse a count, run the count)
//   choice — a genuinely open either/or decision (kept rare on purpose)
export type GateKind =
  | 'roll'
  | 'slider'
  | 'select'
  | 'pick'
  | 'place'
  | 'build'
  | 'hold'
  | 'toggle'
  | 'step'
  | 'choice'

export interface GateSpec {
  kind: GateKind
  /** e.g. minimum number of rolls before the gate opens. */
  needed?: number
}

export interface Beat {
  id: string // 'B1.1'
  scene: string // 'scene-1'
  prompt: string // the ONE line shown first
  payoff?: string // revealed AFTER the gated interaction
  gate?: GateSpec // if present, beat is locked until satisfied
  modelState?: unknown
}

export interface Scene {
  id: string
  model: React.FC<SceneModelProps>
  beats: Beat[]
  /**
   * If set, the scene appears in the navigation menu with this label and the
   * menu entry scrolls to the scene's first beat. Used to build the
   * "Введение + 10 разделов" rail.
   */
  menuLabel?: string
}
