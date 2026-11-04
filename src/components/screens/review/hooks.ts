import { type RefObject, useEffect, useState } from 'react';

/** null until the browser has answered, so the server render stays neutral. */
export function useReducedMotion(): boolean | null {
  const [reduced, setReduced] = useState<boolean | null>(null);
  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduced(query.matches);
    const onChange = () => setReduced(query.matches);
    query.addEventListener('change', onChange);
    return () => query.removeEventListener('change', onChange);
  }, []);
  return reduced;
}

/**
 * True while part of the element sits in the middle of the viewport and the
 * tab is visible. Works for elements taller than the screen.
 */
export function useInView(ref: RefObject<Element | null>, margin = '-25% 0px -25% 0px'): boolean {
  const [onScreen, setOnScreen] = useState(false);
  const [tabVisible, setTabVisible] = useState(true);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const observer = new IntersectionObserver(
      ([entry]) => setOnScreen(entry.isIntersecting),
      { rootMargin: margin }
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, [ref, margin]);

  useEffect(() => {
    const onChange = () => setTabVisible(!document.hidden);
    onChange();
    document.addEventListener('visibilitychange', onChange);
    return () => document.removeEventListener('visibilitychange', onChange);
  }, []);

  return onScreen && tabVisible;
}

/** Matches a media query on the client; `fallback` during server render. */
export function useMediaQuery(query: string, fallback = false): boolean {
  const [matches, setMatches] = useState(fallback);
  useEffect(() => {
    const list = window.matchMedia(query);
    setMatches(list.matches);
    const onChange = () => setMatches(list.matches);
    list.addEventListener('change', onChange);
    return () => list.removeEventListener('change', onChange);
  }, [query]);
  return matches;
}
