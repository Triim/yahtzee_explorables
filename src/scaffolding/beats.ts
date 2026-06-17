import type { Beat, Scene } from './types'

/**
 * Returns a scene's beats. Scenes already authored with `beats` use them
 * directly; legacy scenes still carrying `steps` are converted to pure-read
 * beats (no gate) so the whole article renders under the beat system until
 * each scene is reauthored (Part 2 §E).
 */
export function getSceneBeats(scene: Scene): Beat[] {
  if (scene.beats && scene.beats.length > 0) {
    return scene.beats
  }
  return (scene.steps ?? []).map((step) => ({
    id: step.id,
    scene: scene.id,
    prompt: step.text,
    // No payoff/gate: legacy steps are pure-read beats.
  }))
}
