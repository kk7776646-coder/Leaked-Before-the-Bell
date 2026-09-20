import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { AiAssistantContext } from '../../services/api';

interface AssistantContextType {
  isOpen: boolean;
  drawerWidth: number;
  isDragging: boolean;
  dragWidth: number | null;
  pageContext: AiAssistantContext;
  triggerRef: React.RefObject<HTMLButtonElement>;
  openAssistant: (customContext?: Partial<AiAssistantContext>) => void;
  closeAssistant: () => void;
  toggleAssistant: () => void;
  setPageContext: (ctx: Partial<AiAssistantContext>) => void;
  setDrawerWidth: (width: number) => void;
  startEdgeDrag: (clientX: number) => void;
  updateEdgeDrag: (clientX: number) => void;
  endEdgeDrag: () => void;
  startResizeDrag: (clientX: number) => void;
  updateResizeDrag: (clientX: number) => void;
  endResizeDrag: () => void;
}

const AssistantContext = createContext<AssistantContextType | undefined>(undefined);

const DEFAULT_WIDTH = 400;
const MIN_WIDTH = 320;
const MAX_WIDTH = 580;
const SNAP_OPEN_THRESHOLD = 80;
const SNAP_CLOSE_THRESHOLD = 200;

export const AssistantProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [drawerWidth, setDrawerWidthState] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('leaklens_assistant_width');
      if (saved) {
        const parsed = parseInt(saved, 10);
        if (!isNaN(parsed) && parsed >= MIN_WIDTH && parsed <= MAX_WIDTH) {
          return parsed;
        }
      }
    } catch (e) {}
    return DEFAULT_WIDTH;
  });

  const [isDragging, setIsDragging] = useState(false);
  const [dragWidth, setDragWidth] = useState<number | null>(null);
  const [pageContext, setPageContextState] = useState<AiAssistantContext>({});
  
  const triggerRef = useRef<HTMLButtonElement>(null);
  const dragModeRef = useRef<'open-edge' | 'resize-left' | null>(null);

  // Sync route context automatically
  useEffect(() => {
    const pathname = location.pathname;
    const ctx: Partial<AiAssistantContext> = { currentRoute: pathname };

    if (pathname.startsWith('/detected-content/')) {
      const id = pathname.split('/')[2];
      if (id) ctx.selectedDetectedContentId = id;
    } else if (pathname.startsWith('/candidates/')) {
      const id = pathname.split('/')[2];
      if (id) ctx.selectedDetectedContentId = id;
    }

    setPageContextState((prev) => ({ ...prev, ...ctx, currentRoute: pathname }));
  }, [location.pathname]);

  const setDrawerWidth = useCallback((width: number) => {
    const maxAllowed = Math.min(MAX_WIDTH, Math.floor(window.innerWidth * 0.48));
    const clamped = Math.max(MIN_WIDTH, Math.min(maxAllowed, width));
    setDrawerWidthState(clamped);
    try {
      localStorage.setItem('leaklens_assistant_width', clamped.toString());
    } catch (e) {}
  }, []);

  const openAssistant = useCallback((customContext?: Partial<AiAssistantContext>) => {
    if (customContext) {
      setPageContextState((prev) => ({ ...prev, ...customContext }));
    }
    setIsOpen(true);
    setDragWidth(null);
    setIsDragging(false);
  }, []);

  const closeAssistant = useCallback(() => {
    setIsOpen(false);
    setDragWidth(null);
    setIsDragging(false);
    // Restore focus gracefully
    setTimeout(() => {
      triggerRef.current?.focus();
    }, 50);
  }, []);

  const toggleAssistant = useCallback(() => {
    setIsOpen((prev) => {
      if (prev) {
        setTimeout(() => triggerRef.current?.focus(), 50);
        return false;
      }
      return true;
    });
  }, []);

  const setPageContext = useCallback((ctx: Partial<AiAssistantContext>) => {
    setPageContextState((prev) => ({ ...prev, ...ctx }));
  }, []);

  // Drag-to-open from the right screen edge
  const startEdgeDrag = useCallback((_clientX: number) => {
    dragModeRef.current = 'open-edge';
    setIsDragging(true);
    setDragWidth(20);
  }, []);

  const updateEdgeDrag = useCallback((clientX: number) => {
    if (dragModeRef.current !== 'open-edge') return;
    const calculatedWidth = Math.max(0, window.innerWidth - clientX);
    const maxAllowed = Math.min(MAX_WIDTH, Math.floor(window.innerWidth * 0.48));
    setDragWidth(Math.min(maxAllowed, calculatedWidth));
  }, []);

  const endEdgeDrag = useCallback(() => {
    if (dragModeRef.current === 'open-edge') {
      if (dragWidth !== null && dragWidth >= SNAP_OPEN_THRESHOLD) {
        setIsOpen(true);
        if (dragWidth >= MIN_WIDTH) {
          setDrawerWidth(dragWidth);
        }
      } else {
        setIsOpen(false);
      }
    }
    dragModeRef.current = null;
    setIsDragging(false);
    setDragWidth(null);
  }, [dragWidth, setDrawerWidth]);

  // Resize or drag-to-close from drawer's left border
  const startResizeDrag = useCallback((_clientX: number) => {
    dragModeRef.current = 'resize-left';
    setIsDragging(true);
  }, []);

  const updateResizeDrag = useCallback((clientX: number) => {
    if (dragModeRef.current !== 'resize-left') return;
    const calculatedWidth = Math.max(0, window.innerWidth - clientX);
    const maxAllowed = Math.min(MAX_WIDTH, Math.floor(window.innerWidth * 0.48));
    setDragWidth(Math.min(maxAllowed, calculatedWidth));
  }, []);

  const endResizeDrag = useCallback(() => {
    if (dragModeRef.current === 'resize-left') {
      if (dragWidth !== null) {
        if (dragWidth < SNAP_CLOSE_THRESHOLD) {
          closeAssistant();
        } else {
          setDrawerWidth(dragWidth);
          setIsOpen(true);
        }
      }
    }
    dragModeRef.current = null;
    setIsDragging(false);
    setDragWidth(null);
  }, [dragWidth, closeAssistant, setDrawerWidth]);

  return (
    <AssistantContext.Provider
      value={{
        isOpen,
        drawerWidth,
        isDragging,
        dragWidth,
        pageContext,
        triggerRef,
        openAssistant,
        closeAssistant,
        toggleAssistant,
        setPageContext,
        setDrawerWidth,
        startEdgeDrag,
        updateEdgeDrag,
        endEdgeDrag,
        startResizeDrag,
        updateResizeDrag,
        endResizeDrag,
      }}
    >
      {children}
    </AssistantContext.Provider>
  );
};

export const useAssistant = (): AssistantContextType => {
  const context = useContext(AssistantContext);
  if (!context) {
    throw new Error('useAssistant must be used within an AssistantProvider');
  }
  return context;
};
