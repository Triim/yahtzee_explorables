import type { Beat, Scene } from './types'

export function getSceneBeats(scene: Scene): Beat[] {
  return scene.beats
}
