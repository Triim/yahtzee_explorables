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
}

export interface Scene {
  id: string
  model: React.FC<SceneModelProps>
  steps: Step[]
  panel?: 'single' | 'rich'
}
