#!/usr/bin/env node
/**
 * Static site generator for combine.fm archive.
 * Reads all albums/tracks from the DB and writes HTML files to ./static/.
 *
 * Output structure:
 *   static/index.html
 *   static/assets/images/   (copied from public/assets/images/)
 *   static/{service}/{type}/{id}/index.html
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import models from "../models/index.cjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const OUT = path.join(ROOT, "static");

// ─── helpers ──────────────────────────────────────────────────────────────────

function mkdir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function write(filePath, html) {
  mkdir(path.dirname(filePath));
  fs.writeFileSync(filePath, html, "utf8");
}

function copyDir(src, dest) {
  mkdir(dest);
  for (const entry of fs.readdirSync(src)) {
    const s = path.join(src, entry);
    const d = path.join(dest, entry);
    if (fs.statSync(s).isDirectory()) {
      copyDir(s, d);
    } else {
      fs.copyFileSync(s, d);
    }
  }
}

const SERVICE_NAMES = {
  spotify: "Spotify",
  itunes: "Apple Music",
  deezer: "Deezer",
  youtube: "YouTube",
  ytmusic: "YouTube Music",
  google: "Google Play Music",
  xbox: "Xbox Music"
};

// ─── CSS (shared across all pages) ────────────────────────────────────────────

const SHARED_CSS = `
  *, *::before, *::after { box-sizing: border-box; }
  body {
    margin: 0;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    background: #f8f8f8;
    color: #445470;
  }
  a { color: #FE4365; text-decoration: none; }
  a:hover { text-decoration: underline; }

  .site-header {
    background: #FE4365;
    border-bottom: 3px solid #e5365a;
    padding: 14px 24px;
    display: flex;
    align-items: center;
    gap: 12px;
  }
  .site-header a { display: flex; align-items: center; gap: 12px; }
  .site-header img { height: 36px; }
  .site-header .site-name {
    font-size: 1.4rem;
    font-weight: 700;
    color: #fff;
  }

  .notice {
    background: #fff3cd;
    border-left: 4px solid #FE4365;
    padding: 12px 24px;
    font-size: 0.92rem;
    color: #555;
  }

  .container {
    max-width: 900px;
    margin: 0 auto;
    padding: 32px 20px;
  }

  .artwork {
    width: 100%;
    padding-top: 100%;
    background-size: cover;
    background-position: center;
    border-radius: 4px;
  }
  .artwork-link { display: block; }
  .artwork-link:hover { opacity: 0.88; }

  .service-logo {
    display: block;
    text-align: center;
    margin-top: 10px;
  }
  .service-logo img {
    height: 32px;
    vertical-align: middle;
  }

  .no-match-label {
    text-align: center;
    margin-top: 6px;
    font-size: 0.8rem;
    color: #aaa;
    font-style: italic;
  }

  .matches-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));
    gap: 20px;
    margin-top: 32px;
  }

  .match-item { }
  .match-item.no-match .artwork { opacity: 0.25; }

  .page-title { font-size: 1.05rem; color: #888; margin: 0 0 4px; font-weight: 400; }
  .item-title  { font-size: 1.9rem; font-weight: 700; margin: 0 0 4px; color: #445470; }
  .item-artist { font-size: 1.1rem; color: #888; margin: 0 0 32px; }

  /* homepage */
  .shutdown-box {
    background: #fff;
    border-radius: 8px;
    border: 1px solid #e0e0e0;
    padding: 40px 36px;
    max-width: 640px;
    margin: 48px auto;
  }
  .shutdown-box h1 { color: #FE4365; font-size: 2rem; margin: 0 0 16px; }
  .shutdown-box p { line-height: 1.7; margin: 0 0 14px; }
  .shutdown-box p:last-child { margin: 0; }
`;

// ─── page scaffolding ─────────────────────────────────────────────────────────

function pageShell({ title, description, image, assetsRoot, body }) {
  const ogImage = image
    ? `<meta property="og:image" content="${esc(image)}" />`
    : "";
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${esc(title)}</title>
  <meta name="description" content="${esc(description)}" />
  <meta property="og:title" content="${esc(title)}" />
  <meta property="og:description" content="${esc(description)}" />
  ${ogImage}
  <link rel="icon" href="${assetsRoot}assets/images/favicon.png" />
  <style>${SHARED_CSS}</style>
</head>
<body>
  <header class="site-header">
    <a href="${assetsRoot}index.html">
      <img src="${assetsRoot}assets/images/logo-full-300.png" alt="Combine.fm" />
    </a>
  </header>
  <div class="notice">
    Combine.fm has shut down. These pages are a read-only archive of previously matched links.
  </div>
  ${body}
</body>
</html>`;
}

function esc(str) {
  return String(str ?? "")
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

// ─── share page ───────────────────────────────────────────────────────────────

function renderSharePage(item, assetsRoot) {
  const type = item.type || (item.albumId ? "track" : "album");
  const typeLabel = type === "track" ? "tracks" : "albums";

  const coverMatch =
    item.matches.find(m => m.service === item.service && m.artworkLarge) ||
    item.matches.find(m => m.artworkLarge);
  const coverArt = coverMatch?.artworkLarge ?? "";

  const matchCards = item.matches
    .filter(m => m.externalId)
    .map(m => {
      const url = m.streamUrl || m.purchaseUrl;
      const artwork = m.artworkLarge || coverArt;
      const svcName = SERVICE_NAMES[m.service] || m.service;
      return `
        <div class="match-item">
          <a class="artwork-link" href="${esc(url)}" title="${esc(
        svcName
      )}" target="_blank" rel="noopener">
            <div class="artwork" style="background-image:url('${esc(
              artwork
            )}')"></div>
          </a>
          <div class="service-logo">
            <a href="${esc(url)}" target="_blank" rel="noopener">
              <img src="${assetsRoot}assets/images/${esc(
        m.service
      )}.png" alt="${esc(svcName)}" />
            </a>
          </div>
        </div>`;
    });

  const noMatchCards = item.matches
    .filter(m => !m.externalId)
    .map(m => {
      const svcName = SERVICE_NAMES[m.service] || m.service;
      return `
        <div class="match-item no-match">
          <div class="artwork" style="background-image:url('${esc(
            coverArt
          )}')"></div>
          <div class="service-logo">
            <img src="${assetsRoot}assets/images/${esc(
        m.service
      )}.png" alt="${esc(svcName)}" />
          </div>
          <div class="no-match-label">No match</div>
        </div>`;
    });

  const title = `${item.name} by ${item.artist.name} — Combine.fm Archive`;
  const description = `Archived music links for ${item.name} by ${item.artist.name} across Spotify, Apple Music, Deezer, YouTube and more.`;

  const body = `
    <div class="container">
      <p class="page-title">Matched ${typeLabel} for</p>
      <h1 class="item-title">${esc(item.name)}</h1>
      <p class="item-artist">${esc(item.artist.name)}</p>
      <div class="matches-grid">
        ${matchCards.join("")}
        ${noMatchCards.join("")}
      </div>
    </div>`;

  return pageShell({ title, description, image: coverArt, assetsRoot, body });
}

// ─── homepage ─────────────────────────────────────────────────────────────────

function renderHomePage(totalItems) {
  const assetsRoot = "";
  const body = `
    <div class="shutdown-box">
      <h1>Combine.fm has shut down</h1>
      <p>
        Thanks to everyone who used the service over the years.
        Combine.fm matched music links across Spotify, Apple Music, Deezer, YouTube and more —
        letting you share one link that worked for everyone.
      </p>
      <p>
        This site is now a read-only archive of the ${totalItems.toLocaleString()} items that
        were previously matched. If you have a direct link to a combine.fm page it should
        still work here.
      </p>
      <p style="color:#aaa;font-size:0.85rem">
        The source code remains available at
        <a href="https://cremin.dev/jonathan/combine.fm">cremin.dev/jonathan/combine.fm</a>.
      </p>
    </div>`;

  return pageShell({
    title: "Combine.fm — Archived",
    description:
      "Combine.fm has shut down. This is a read-only archive of previously matched music links.",
    image: null,
    assetsRoot,
    body
  });
}

// ─── main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log("Querying database…");

  const [albums, tracks] = await Promise.all([
    models.album.findAll({
      include: [{ model: models.match }, { model: models.artist }]
    }),
    models.track.findAll({
      include: [{ model: models.match }, { model: models.artist }]
    })
  ]);

  console.log(`Found ${albums.length} albums, ${tracks.length} tracks.`);

  // Copy static assets
  console.log("Copying assets…");
  copyDir(
    path.join(ROOT, "public", "assets", "images"),
    path.join(OUT, "assets", "images")
  );

  let count = 0;

  // Generate share pages
  for (const item of [...albums, ...tracks]) {
    const json = item.toJSON();
    const type = albums.includes(item) ? "album" : "track";
    json.type = type;

    if (!json.artist) continue; // skip orphaned rows
    if (!json.externalId) continue;

    // pages live at static/{service}/{type}/{id}/index.html
    // so assets root is ../../../../
    const assetsRoot = "../../../../";
    const html = renderSharePage(json, assetsRoot);
    const outPath = path.join(
      OUT,
      json.service,
      type,
      json.externalId,
      "index.html"
    );
    write(outPath, html);
    count++;

    if (count % 500 === 0) console.log(`  ${count} pages written…`);
  }

  // Homepage
  write(path.join(OUT, "index.html"), renderHomePage(count));

  console.log(`Done. ${count} share pages + homepage → ${OUT}`);
  process.exit(0);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
