import { type ReactNode, useEffect, useRef } from 'react';
import images from '~/content/images.json';
import type { ScreenMedia } from '~/content/types';

type ImageEntry = {
  width: number;
  height: number;
  /** Tiny blurred preview as a data URL. */
  placeholder: string;
  /** Either WebP sizes, or one untouched GIF. */
  sources: { src: string; width: number }[];
  type: 'image/webp' | 'image/gif';
};

const manifest = images as Record<string, ImageEntry>;

/**
 * Every product screen on the site sits in one of these. With no `media` it
 * shows the drawn screen passed as children. Give it an image (added with
 * `pnpm add-images`) or a video and it shows that instead, at the media's
 * own aspect ratio so nothing shifts while it loads.
 */
export function ScreenSlot({
  media,
  children,
  className,
  priority = false
}: {
  media?: ScreenMedia | null;
  children: ReactNode;
  className?: string;
  /** Load the image right away, for the first screen on a page. */
  priority?: boolean;
}) {
  if (!media) return <>{children}</>;
  if (media.type === 'image') {
    return <ResponsiveImage media={media} className={className} priority={priority} />;
  }
  return <SlotVideo media={media} className={className} />;
}

export function ResponsiveImage({
  media,
  className,
  priority,
  sizes = '(min-width: 1240px) 1200px, 100vw'
}: {
  media: Extract<ScreenMedia, { type: 'image' }>;
  className?: string;
  priority?: boolean;
  sizes?: string;
}) {
  const entry = manifest[media.name];
  if (!entry) {
    return (
      <p className='panel p-6 text-sm text-high'>
        Image “{media.name}” isn’t in src/content/images.json. Run pnpm add-images first.
      </p>
    );
  }
  const largest = entry.sources[entry.sources.length - 1];
  return (
    <img
      src={largest.src}
      srcSet={
        entry.type === 'image/webp'
          ? entry.sources.map((s) => `${s.src} ${s.width}w`).join(', ')
          : undefined
      }
      sizes={entry.type === 'image/webp' ? sizes : undefined}
      width={entry.width}
      height={entry.height}
      alt={media.alt}
      loading={priority ? 'eager' : 'lazy'}
      fetchPriority={priority ? 'high' : undefined}
      decoding='async'
      className={`panel block h-auto w-full ${className ?? ''}`}
      style={{
        backgroundImage: `url(${entry.placeholder})`,
        backgroundSize: 'cover'
      }}
    />
  );
}

function SlotVideo({
  media,
  className
}: {
  media: Extract<ScreenMedia, { type: 'video' }>;
  className?: string;
}) {
  const ref = useRef<HTMLVideoElement>(null);
  const poster = media.poster ? manifest[media.poster]?.sources.at(-1)?.src : undefined;

  // Play only while visible, never with reduced motion.
  useEffect(() => {
    const video = ref.current;
    if (!video) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !document.hidden) void video.play().catch(() => {});
      else video.pause();
    });
    observer.observe(video);
    return () => observer.disconnect();
  }, []);

  return (
    <video
      ref={ref}
      src={media.src}
      poster={poster}
      width={media.width}
      height={media.height}
      muted
      loop
      playsInline
      controls
      preload='metadata'
      aria-label={media.alt}
      className={`panel block h-auto w-full ${className ?? ''}`}
    />
  );
}
