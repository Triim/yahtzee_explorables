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

export type GateKind = 'roll' | 'slider' | 'choice' | 'hold' | 'toggle'

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
