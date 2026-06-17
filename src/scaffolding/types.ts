import type React from 'react'

export type Register = 'free' | 'driven' | 'showcase'

export type Directive =
  | { kind: 'activate'; model: string }
  | { kind: 'unlock'; tool: string }
  | { kind: 'setState'; payload: unknown }
  | { kind: 'showcase'; clip: string }

export interface Step {
  id: string
  copyType: 'вопрос' | 'инструкция' | 'определение' | 'формула' | 'врезка' | 'переход'
  register: Register
  directive?: Directive
  text: string
}

export interface SceneModelProps {
  activeStepId: string | null
  directive?: Directive
  register: Register
  /** Mark the currently-active beat's gate as satisfied (Part 2). */
  satisfyGate?: () => void
}

/* ---- Part 2: beats ---- */

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
}

export interface Scene {
  id: string
  model: React.FC<SceneModelProps>
  /** Legacy step list (auto-converted to pure-read beats until reauthored). */
  steps?: Step[]
  /** Part 2 beats. When present, these drive the scene instead of steps. */
  beats?: Beat[]
  panel?: 'single' | 'rich'
}
