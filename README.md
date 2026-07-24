# Pantry

A shared shopping list for the people you live with. One family, one list —
everyone can add to it, tick things off in the shop, and see each other's changes
in real time.

## What it's for

The everyday problem: someone's at the shop, someone else at home remembers you're
out of milk. Most shopping-list apps solve this by making everyone sign up for an
account and trust a company with the data. This one doesn't.

The goal here is a family list that is:

- **Effortless to join.** No accounts, no passwords, no sign-up. You open it and
  you have a list. To bring in the rest of the household you send them one link —
  they tap it and they're on the same list.
- **Shared and live.** Everyone sees the same list. Add "bread" on your phone and
  it shows up on everyone else's. Tick it off in the shop and it's ticked off for
  the whole family.
- **Yours, not a company's.** There's no server storing your groceries and no
  account tied to your name. The list is encrypted, so even the machines relaying
  it between phones can't read it.
- **Always available.** It works with no signal in the shop and syncs back up when
  you're online again. You can install it to your home screen like a normal app.

It's deliberately kept simple — it's a grocery list, not a productivity suite.

## How it works (the short version)

- The list lives on **[nostr](https://nostr.com)**, an open network of relays,
  instead of on a private server. No company owns it.
- Each list is protected by a single shared key. **Sharing the link shares the
  key**, which is how a housemate joins. The key travels in the part of the link
  after `#`, which browsers never send to the host — so whoever hosts the page
  never sees it.
- Because everyone holds the same key, **anyone with the link can read and edit
  the list.** That's the intended trade-off for a family grocery list: dead simple
  to share, and nothing sensitive is in it anyway.
- Edits merge automatically, so two people adding things at the same time never
  overwrite each other — even if one of them was offline at the time.

### Features

- Shared list with add / tick-off / remove, and quantities
- **Multiple lists** you can switch between (e.g. "Groceries", "Hardware store"),
  each shared separately
- **Quick re-add** — things you buy often appear as one-tap suggestions
- Tap an item to rename it; tap a list's name to switch, rename, or leave it
- Installable, works offline

## One thing to remember

**The link is the list.** It's how you share it *and* how you get back to it.
Keep the link somewhere safe (a pinned family chat message is fine). If someone
clears their browser and doesn't have the link, they'd just start a fresh empty
list — nothing is recoverable without it, because there's no account to log back
into. That privacy is the point, but it means the link matters.

---

## Hosting it yourself

It's a set of plain static files — no build step, no backend. Serve them together,
same-origin, over **HTTPS** (relays, install, and offline all require a secure
origin). Any static host works: GitHub Pages, Netlify, Cloudflare Pages.

Files (upload all of them, together):

```
index.html            the whole app
manifest.webmanifest  makes it installable
sw.js                 offline support (service worker)
icon-*.png            app icons
apple-touch-icon.png  iOS home-screen icon
_headers              hosting hints (Netlify/Cloudflare; ignored by GitHub Pages)
.nojekyll             tells GitHub Pages to serve every file as-is
```

### GitHub Pages

1. Create a **new public repository** at github.com (e.g. `pantry`).
2. **Add file -> Upload files**, drag in *all* the files above, **Commit changes**.
3. **Settings -> Pages** -> Source: **Deploy from a branch**, branch **main**,
   folder **/ (root)** -> **Save**.
4. Wait ~1 minute for your URL: `https://YOURNAME.github.io/pantry/`.
5. Open it -> **Start the list** -> **Share** the link with your family.

To install: open the URL, wait a few seconds, **reload once**, then browser menu ->
**Install app** (Android) or Share -> **Add to Home Screen** (iPhone). The first
reload lets the offline worker register before Install appears.

### Updating later

Re-upload the changed file(s) and commit; the site redeploys in about a minute.
If installed phones don't pick up a change, bump `CACHE_VERSION` in `sw.js` (e.g.
`v3` -> `v4`) and reload twice.

### Notes

- **Keep the same URL.** Your share links contain it, so moving hosts later means
  re-sharing the link.
- Keys are generated on each device and never sent to the host — the host only
  serves the page.
