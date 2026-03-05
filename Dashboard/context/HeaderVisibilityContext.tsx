import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';

type HeaderVisibilityContextType = {
  headerVisible: boolean;
  setModalOverlay: (key: string, open: boolean) => void;
};

const HeaderVisibilityContext = createContext<HeaderVisibilityContextType | null>(null);

type ProviderProps = {
  children: React.ReactNode;
  externalOverlays?: Record<string, boolean>;
};

export function HeaderVisibilityProvider({ children, externalOverlays = {} }: ProviderProps) {
  const [headerVisible, setHeaderVisible] = useState(true);
  const modalKeys = useRef<Set<string>>(new Set());
  const hasExternal = Object.values(externalOverlays).some(Boolean);
  const [modalOverlay, setModalOverlayState] = useState(false);
  const lastScrollY = useRef(0);
  const ticking = useRef(false);

  const setModalOverlayFn = useCallback((key: string, open: boolean) => {
    if (open) modalKeys.current.add(key);
    else modalKeys.current.delete(key);
    setModalOverlayState(modalKeys.current.size > 0);
  }, []);

  const anyModalOpen = modalOverlay || hasExternal;

  useEffect(() => {
    const handleScroll = () => {
      if (anyModalOpen) {
        setHeaderVisible(false);
        return;
      }
      const currentScrollY = window.scrollY;
      if (!ticking.current) {
        window.requestAnimationFrame(() => {
          const diff = currentScrollY - lastScrollY.current;
          if (diff > 20 && currentScrollY > 60) {
            setHeaderVisible(false);
          } else if (diff < -10) {
            setHeaderVisible(true);
          }
          lastScrollY.current = currentScrollY;
          ticking.current = false;
        });
        ticking.current = true;
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [anyModalOpen]);

  useEffect(() => {
    if (anyModalOpen) setHeaderVisible(false);
    else setHeaderVisible(true);
  }, [anyModalOpen]);

  const value: HeaderVisibilityContextType = {
    headerVisible: headerVisible && !anyModalOpen,
    setModalOverlay: setModalOverlayFn
  };

  return (
    <HeaderVisibilityContext.Provider value={value}>
      {children}
    </HeaderVisibilityContext.Provider>
  );
}

export function useHeaderVisibility() {
  const ctx = useContext(HeaderVisibilityContext);
  return ctx;
}
