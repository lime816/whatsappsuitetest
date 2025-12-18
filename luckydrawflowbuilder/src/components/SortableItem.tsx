import React from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical } from 'lucide-react'

export function SortableItem({ id, children }: { id: string; children: React.ReactNode }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id })
  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }
  
  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      className="flex items-stretch gap-2 bg-white border border-gray-200 rounded-lg p-3 hover:border-primary-400 hover:shadow-sm transition-all"
    >
      <div 
        {...attributes} 
        {...listeners}
        className="drag-handle flex items-center cursor-grab active:cursor-grabbing text-gray-400 hover:text-primary-600 transition-colors"
      >
        <GripVertical className="w-5 h-5" />
      </div>
      <div className="flex-1 min-w-0">{children}</div>
    </div>
  )
}
