import React, { useRef, useState } from 'react';
import { Bot, GripVertical } from 'lucide-react';
import { useAssistant } from './AssistantContext';

export const AssistantEdgeHandle: React.FC = () => {
  const { isOpen, isDragging, startEdgeDrag, updateEdgeDrag, endEdgeDrag, openAssistant } = useAssistant();
  const [isHovered, setIsHovered] = useState(false);
  const handleRef = useRef<HTMLDivElement>(null);
  const isPointerDownRef = useRef(false);
  const startXRef = useRef(0);

  // If already fully open and not dragging, the edge handle is not needed since the drawer has its left resize bar
  if (isOpen && !isDragging) {
    return null;
  }

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.preventDefault();
    isPointerDownRef.current = true;
    startXRef.current = e.clientX;
    handleRef.current?.setPointerCapture(e.pointerId);
    startEdgeDrag(e.clientX);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isPointerDownRef.current) return;
    e.preventDefault();
    updateEdgeDrag(e.clientX);
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isPointerDownRef.current) return;
    isPointerDownRef.current = false;
    try {
      handleRef.current?.releasePointerCapture(e.pointerId);
    } catch (err) {}
    
    const deltaX = startXRef.current - e.clientX;
    if (deltaX < 10) {
      // It was a click/tap
      openAssistant();
    } else {
      endEdgeDrag();
    }
  };

  const handlePointerCancel = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isPointerDownRef.current) return;
    isPointerDownRef.current = false;
    try {
      handleRef.current?.releasePointerCapture(e.pointerId);
    } catch (err) {}
    endEdgeDrag();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      openAssistant();
    }
  };

  return (
    <div
      ref={handleRef}
      role="button"
      tabIndex={0}
      aria-label="Open AI Assistant. Drag left to open or press Enter"
      title="Drag left or click to open LeakLens Assistant"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerCancel}
      onKeyDown={handleKeyDown}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`fixed right-0 top-1/2 -translate-y-1/2 z-40 select-none touch-none cursor-ew-resize focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50 rounded-l-lg transition-transform duration-150 ${
        isHovered || isDragging ? 'translate-x-0' : 'translate-x-1'
      }`}
    >
      {/* Edge Handle Tab */}
      <div
        className={`flex items-center gap-1.5 py-4 pl-1.5 pr-1 rounded-l-lg border-y border-l transition-all duration-200 shadow-sm ${
          isHovered || isDragging
            ? 'bg-blue-600 border-blue-500 text-white shadow-md'
            : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-400 dark:text-slate-500 hover:text-blue-600 dark:hover:text-blue-400'
        }`}
      >
        <GripVertical className="w-3.5 h-3.5 shrink-0 opacity-75" />
        <Bot className={`w-3.5 h-3.5 shrink-0 transition-transform ${isHovered || isDragging ? 'scale-110' : ''}`} />
      </div>
    </div>
  );
};
