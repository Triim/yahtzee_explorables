import type { SceneModelProps } from '@/scaffolding'

export function DemoModel({ activeStepId, register }: SceneModelProps) {
  return (
    <div className="demo-model">
      <div className="model-content">
        <h2>Demo Model</h2>
        <p>Active step: <code>{activeStepId || 'None'}</code></p>
        <p>Register: <code>{register}</code></p>
        <div className="demo-placeholder">
          This is where the interactive model will appear.
          <br />
          It will respond to scroll triggers.
        </div>
      </div>
    </div>
  )
}

export const demoScene = {
  id: 'demo',
  model: DemoModel,
  steps: [
    {
      id: 'demo-1',
      copyType: 'инструкция' as const,
      register: 'free' as const,
      directive: { kind: 'activate' as const, model: 'demo' },
      text: 'This is the first step. Watch the right panel change as you scroll.',
    },
    {
      id: 'demo-2',
      copyType: 'определение' as const,
      register: 'free' as const,
      text: 'Here is a definition. Notice how the step indicator in the right panel updates.',
    },
    {
      id: 'demo-3',
      copyType: 'формула' as const,
      register: 'free' as const,
      text: 'Here is a formula: $x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}$',
    },
  ],
}
