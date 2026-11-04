import type { DiffFile, ReviewComment, ScreenMedia } from './types';

/**
 * The pull request reviewed in the home page hero and walked through in the
 * timeline. Swap in your own product's flow: change the files, the comments,
 * and the labels. Keep each suggestion the same length as the lines it
 * replaces, and keep code lines under about 56 characters so they fit.
 */

export const demoPr = {
  repo: 'quayside/storefront',
  number: 2184,
  title: 'Add saved carts for signed-in shoppers',
  author: { name: 'Priya Raman', handle: 'priya-raman', initials: 'PR' },
  branch: 'priya/saved-carts',
  base: 'main',
  commits: 1,
  reviewer: { name: 'Nitpick', handle: 'nitpick' },

  files: [
    {
      path: 'src/server/routes/saved-carts.ts',
      status: 'added',
      language: 'ts',
      lines: [
        { text: 'import { route, json } from "@/server/http";' },
        { text: 'import { db } from "@/server/db";' },
        { text: 'import type { SavedCart } from "@/types/cart";' },
        { text: '' },
        { text: '// GET /api/saved-carts: carts saved for later' },
        { text: 'export const savedCarts = route.get(async (req) => {' },
        { text: '  const userId = req.query.get("userId");' },
        { text: '  const carts = await db.carts.findSaved(userId);' },
        { text: '' },
        { text: '  const result: SavedCart[] = [];' },
        { text: '  for (const cart of carts) {' },
        { text: '    const items = [];' },
        { text: '    for (const id of cart.productIds) {' },
        { text: '      items.push(await db.products.get(id));' },
        { text: '    }' },
        { text: '    result.push({ ...cart, items });' },
        { text: '  }' },
        { text: '' },
        { text: '  return json(result);' },
        { text: '});' }
      ]
    },
    {
      path: 'src/components/SavedCartsPanel.tsx',
      status: 'added',
      language: 'tsx',
      lines: [
        { text: 'import { useSavedCarts } from "@/hooks/use-saved-carts";' },
        { text: 'import { CartCard } from "./CartCard";' },
        { text: 'import { PanelSkeleton } from "./PanelSkeleton";' },
        { text: '' },
        { text: 'export function SavedCartsPanel() {' },
        { text: '  const { data: carts, isLoading } = useSavedCarts();' },
        { text: '' },
        { text: '  if (isLoading) return <PanelSkeleton rows={3} />;' },
        { text: '' },
        { text: '  return (' },
        { text: '    <section aria-labelledby="saved-title">' },
        { text: '      <h2 id="saved-title">Saved for later</h2>' },
        { text: '      <ul className="cart-grid">' },
        { text: '        {carts.map((cart) => (' },
        { text: '          <CartCard key={cart.id} cart={cart} />' },
        { text: '        ))}' },
        { text: '      </ul>' },
        { text: '    </section>' },
        { text: '  );' },
        { text: '}' }
      ]
    }
  ] satisfies DiffFile[],

  /**
   * Nitpick's review, in the order the comments stream in. The two
   * suggestions are applied one after the other.
   */
  comments: [
    {
      id: 'n-plus-one',
      file: 0,
      lines: [10, 17],
      severity: 'high',
      rule: 'N+1 queries',
      title: 'N+1 query in a loop',
      body: 'Each product is fetched on its own. Three carts of 12 items make 37 queries per request. Load them in one batch.',
      suggestion: [
        '  const ids = carts.flatMap((cart) => cart.productIds);',
        '  const products = await db.products.getMany(ids);',
        '  const byId = new Map(products.map((p) => [p.id, p]));',
        '',
        '  const result: SavedCart[] = carts.map((cart) => ({',
        '    ...cart,',
        '    items: cart.productIds.map((id) => byId.get(id)!),',
        '  }));'
      ]
    },
    {
      id: 'missing-auth',
      file: 0,
      lines: [6, 7],
      severity: 'high',
      rule: 'Missing auth checks',
      title: 'Missing auth check on a new route',
      body: 'userId comes from the query string, so anyone can read any shopper’s saved carts. Require a session and use its user.',
      suggestion: [
        'export const savedCarts = authed.get(async (req) => {',
        '  const userId = req.session.userId;'
      ]
    },
    {
      id: 'empty-state',
      file: 1,
      lines: [13, 17],
      severity: 'low',
      rule: 'Unhandled states',
      title: 'Empty state isn’t handled',
      body: 'A shopper with no saved carts sees a heading over an empty list. Show a short message and a link back to the catalog.'
    }
  ] satisfies ReviewComment[],

  labels: {
    check: 'Nitpick review',
    reviewing: 'Reviewing',
    /** `{n}` is replaced with the number of issues. */
    found: '{n} issues',
    remaining: '{n} issues left',
    remainingOne: '1 issue left',
    apply: 'Apply suggestion',
    applied: 'Applied',
    replay: 'Replay review',
    suggestedChange: 'Suggested change'
  },

  /** Replace the drawn hero screen with an image or a video of your product. */
  media: null as ScreenMedia | null
};

export type DemoPr = typeof demoPr;
