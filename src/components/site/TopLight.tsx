import { useEffect, useRef } from 'react';

/**
 * The soft light that falls from the top of every page. On desktop it leans
 * a little toward the pointer, and the panel under the pointer catches a
 * brighter edge. Nothing here moves on its own.
 */
export function TopLight() {
  const lightRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (!finePointer.matches) return;

    let frame = 0;
    let lit: HTMLElement | null = null;
    let lastEvent: PointerEvent | null = null;

    const update = () => {
      frame = 0;
      const event = lastEvent;
      if (!event) return;
      if (!reduced.matches && lightRef.current && window.scrollY < 1400) {
        const lx = (event.clientX / window.innerWidth) * 2 - 1;
        lightRef.current.style.setProperty('--lx', lx.toFixed(3));
      }
      const target = event.target instanceof Element ? event.target : null;
      const panel = target?.closest<HTMLElement>('.panel') ?? null;
      if (panel !== lit) {
        lit?.removeAttribute('data-lit');
        lit = panel;
        lit?.setAttribute('data-lit', '');
      }
      if (lit) {
        const rect = lit.getBoundingClientRect();
        lit.style.setProperty('--mx', `${event.clientX - rect.left}px`);
        lit.style.setProperty('--my', `${event.clientY - rect.top}px`);
      }
    };

    const onMove = (event: PointerEvent) => {
      if (event.pointerType !== 'mouse') return;
      lastEvent = event;
      if (!frame) frame = requestAnimationFrame(update);
    };
    const onLeave = () => {
      lit?.removeAttribute('data-lit');
      lit = null;
    };

    window.addEventListener('pointermove', onMove, { passive: true });
    document.documentElement.addEventListener('pointerleave', onLeave);
    return () => {
      window.removeEventListener('pointermove', onMove);
      document.documentElement.removeEventListener('pointerleave', onLeave);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <div className='top-light' aria-hidden='true'>
      <div ref={lightRef} />
    </div>
  );
}
