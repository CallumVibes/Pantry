# Shopping List

A shared family shopping list. No accounts, no passphrase — open it, you have a
list, share the link with your family and everyone can add to it. The list is
encrypted on the network and the app works offline as an installable PWA.

## What's in here (upload all of it)

```
index.html            the whole app
manifest.webmanifest  makes it installable
sw.js                 offline support (service worker)
_headers              hosting hints (used by Netlify/Cloudflare; ignored by GitHub Pages)
.nojekyll             tells GitHub Pages to serve every file as-is
icons/                app icons (keep this folder intact)
```

## Host on GitHub Pages

1. Go to github.com, sign in, and create a **new repository** (any name, e.g.
   `shopping-list`). Make it **Public**.
2. On the repo page: **Add file → Upload files**. Drag in *all* the files above,
   **including the `icons` folder**, then **Commit changes**.
3. **Settings → Pages**. Under "Build and deployment", set **Source: Deploy from
   a branch**, branch **main**, folder **/ (root)**, and **Save**.
4. Wait ~1 minute. The page shows your URL:
   `https://YOURNAME.github.io/shopping-list/`
5. Open that URL on your phone → **Start the list** → **Share** the link with
   your family.

To install as an app: open the URL, wait a few seconds, reload once, then use
the browser menu → **Install app** (Android) or Share → **Add to Home Screen**
(iPhone).

## Updating later

Replace `index.html` (or whichever file changed) via **Add file → Upload files**
on the repo, commit, and Pages redeploys in about a minute. If an update doesn't
show, it's the cached service worker — bump `CACHE_VERSION` in `sw.js` (e.g.
`v2` → `v3`) when you change things, and reload twice.

## Good to know

- Keep the **same URL**: your share links contain it, so moving hosts later
  means re-sharing the link.
- The **link is the list**. Anyone with it can read and edit — fine for
  groceries. If someone clears their browser and didn't save the link, they'd
  start a fresh empty list, so tell everyone to keep the link.
- Keys are generated on each device and never sent to the host — GitHub only
  serves the page.
