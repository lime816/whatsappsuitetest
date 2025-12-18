import React from 'react'
import { useFlowStore } from '../state/store'
import type { AnyElement } from '../types'

export function Editor({ screenId, el }: { screenId: string; el: AnyElement }) {
  const { updateElement } = useFlowStore()
  const set = (patch: Partial<any>) => updateElement(screenId, { ...el, ...patch } as AnyElement)

  switch (el.type) {
    case 'TextSubheading':
      return (
        <div className="editor">
          <label>Text</label>
          <input value={el.text} onChange={e => set({ text: e.target.value })} />
        </div>
      )
    case 'RadioButtonsGroup':
      return (
        <div className="editor">
          <label>Label</label>
          <input value={el.label} onChange={e => set({ label: e.target.value })} />
          <label>Name</label>
          <input value={el.name} onChange={e => set({ name: e.target.value })} />
          <label><input type="checkbox" checked={!!el.required} onChange={e => set({ required: e.target.checked })} /> Required</label>
          <OptionsEditor value={el.options} onChange={opts => set({ options: opts })} />
        </div>
      )
    case 'TextArea':
      return (
        <div className="editor">
          <label>Label</label>
          <input value={el.label} onChange={e => set({ label: e.target.value })} />
          <label>Name</label>
          <input value={el.name} onChange={e => set({ name: e.target.value })} />
          <label><input type="checkbox" checked={!!el.required} onChange={e => set({ required: e.target.checked })} /> Required</label>
        </div>
      )
    case 'Dropdown':
      return (
        <div className="editor">
          <label>Label</label>
          <input value={el.label} onChange={e => set({ label: e.target.value })} />
          <label>Name</label>
          <input value={el.name} onChange={e => set({ name: e.target.value })} />
          <label><input type="checkbox" checked={!!el.required} onChange={e => set({ required: e.target.checked })} /> Required</label>
          <OptionsEditor value={el.options} onChange={opts => set({ options: opts })} />
        </div>
      )
    case 'Footer':
      return (
        <div className="editor">
          <label>Label</label>
          <input value={el.label} onChange={e => set({ label: e.target.value })} />
          <label>Action</label>
          <select value={el.action} onChange={e => set({ action: e.target.value })}>
            <option value="navigate">navigate</option>
            <option value="complete">complete</option>
          </select>
          {el.action === 'navigate' && (
            <>
              <label>Next Screen</label>
              <input value={el.nextScreen ?? ''} onChange={e => set({ nextScreen: e.target.value })} />
            </>
          )}
          <label>Payload Keys (comma separated)</label>
          <input value={el.payloadKeys.join(',')} onChange={e => set({ payloadKeys: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })} />
        </div>
      )
    default:
      return null
  }
}

function OptionsEditor({ value, onChange }: { value: { id: string; title: string }[]; onChange: (v: { id: string; title: string }[]) => void }) {
  const add = () => onChange([...value, { id: `${value.length}_Option`, title: 'Option' }])
  const set = (i: number, patch: Partial<{ id: string; title: string }>) => onChange(value.map((v, idx) => idx === i ? { ...v, ...patch } : v))
  const remove = (i: number) => onChange(value.filter((_, idx) => idx !== i))
  return (
    <div className="options-editor">
      <div className="options-list">
        {value.map((o, i) => (
          <div className="option-row" key={i}>
            <input value={o.id} onChange={e => set(i, { id: e.target.value })} />
            <input value={o.title} onChange={e => set(i, { title: e.target.value })} />
            <button onClick={() => remove(i)}>✕</button>
          </div>
        ))}
      </div>
      <button className="secondary" onClick={add}>Add option</button>
    </div>
  )
}
