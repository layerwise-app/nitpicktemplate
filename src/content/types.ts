// Shapes for the files in `src/content/`. Type-only: nothing here runs.

/**
 * Replaces a drawn product screen with your own media. `name` is an image
 * written by `pnpm add-images` (see `src/content/images.json`); videos are
 * files in `public/`.
 */
export type ScreenMedia =
  | { type: 'image'; name: string; alt: string }
  | {
      type: 'video';
      src: string;
      /** A still from `pnpm add-images`, shown before the video plays. */
      poster?: string;
      width: number;
      height: number;
      alt: string;
    };

/** One line of a diff. `kind` defaults to `'add'`. */
export type DiffLine = {
  text: string;
  kind?: 'add' | 'del' | 'ctx';
};

export type DiffFile = {
  path: string;
  /** `'added'` for a new file. */
  status: 'added' | 'modified';
  language: 'ts' | 'tsx' | 'yaml';
  lines: DiffLine[];
};

export type Severity = 'high' | 'medium' | 'low';

export type ReviewComment = {
  id: string;
  /** Index into `files`. */
  file: number;
  /** First and last flagged line, 1-based, inclusive. */
  lines: [number, number];
  severity: Severity;
  rule: string;
  title: string;
  body: string;
  /**
   * Replacement for the flagged lines. Use the same number of lines as the
   * range so the page doesn't move when it is applied.
   */
  suggestion?: string[];
};

export type ChangelogEntry = {
  /** Also the file name and the URL: `/changelog/<slug>`. */
  slug: string;
  title: string;
  /** `YYYY-MM-DD`. */
  date: string;
  /** One or two sentences, shown on the list and in link previews. */
  summary: string;
  /** Paragraphs for the entry's own page. */
  body: string[];
  /** Short list of what changed. */
  changes: string[];
  /**
   * Which drawn screen to show (see `src/components/screens/changelog/`).
   * Leave it out to show a plain title card.
   */
  screen?: string;
  /** Replaces the drawn screen with an image or a video. */
  media?: ScreenMedia | null;
};
