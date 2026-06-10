export function renderErrorPage(errorId?: string): string {
  const id = errorId ?? Math.random().toString(36).slice(2, 10).toUpperCase();
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>Something paused — Vocare</title>
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="robots" content="noindex" />
    <style>
      :root { color-scheme: light; }
      * { box-sizing: border-box; }
      html, body { margin: 0; padding: 0; height: 100%; }
      body {
        font: 15px/1.55 ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif;
        background: #fafaf7;
        color: #1a1d26;
        display: grid;
        place-items: center;
        padding: 2rem 1.25rem;
      }
      .card { max-width: 30rem; width: 100%; }
      .brand {
        display: inline-flex; align-items: center; gap: 0.5rem;
        font-weight: 600; letter-spacing: 0.18em; text-transform: uppercase;
        font-size: 0.7rem; color: #493ca8;
        margin-bottom: 2.25rem;
      }
      .brand .dot { width: 0.5rem; height: 0.5rem; border-radius: 999px; background: #493ca8; }
      h1 {
        font: italic 400 1.75rem/1.2 ui-serif, "Iowan Old Style", "Apple Garamond", Georgia, serif;
        margin: 0 0 0.75rem;
        letter-spacing: -0.01em;
      }
      p { color: #5a6072; margin: 0 0 0.5rem; max-width: 28rem; }
      .meta {
        margin-top: 1.5rem;
        font-size: 0.72rem;
        letter-spacing: 0.04em;
        color: #8a90a0;
        display: flex; align-items: center; gap: 0.5rem;
      }
      .meta code {
        font-family: ui-monospace, "SF Mono", Menlo, monospace;
        background: #efeef6;
        padding: 0.15rem 0.4rem;
        border-radius: 0.25rem;
        color: #493ca8;
      }
      .actions { display: flex; gap: 0.5rem; flex-wrap: wrap; margin-top: 2rem; }
      a, button {
        font: inherit; cursor: pointer;
        padding: 0.65rem 1.15rem;
        border-radius: 999px;
        text-decoration: none;
        border: 1px solid transparent;
        transition: opacity 0.15s ease, background 0.15s ease;
      }
      .primary { background: #493ca8; color: #fff; }
      .primary:hover { opacity: 0.9; }
      .secondary {
        background: #fff; color: #1a1d26;
        border-color: #e3e3ec;
      }
      .secondary:hover { background: #f3f3f8; }
      .ghost {
        background: transparent; color: #5a6072;
      }
      .ghost:hover { color: #1a1d26; }
      @media (prefers-color-scheme: dark) {
        body { background: #0f1014; color: #ececf2; }
        h1 { color: #ececf2; }
        p { color: #9ca3b5; }
        .secondary { background: #1a1c22; border-color: #2a2c36; color: #ececf2; }
        .secondary:hover { background: #22242c; }
        .meta code { background: #1a1c22; color: #a89bff; }
        .brand { color: #a89bff; }
        .brand .dot { background: #a89bff; }
      }
    </style>
  </head>
  <body>
    <main class="card" role="main">
      <div class="brand"><span class="dot"></span> Vocare</div>
      <h1>Something paused on our side.</h1>
      <p>This page hit an unexpected error. We've logged it — your progress is saved in this browser, so retrying usually picks up right where you were.</p>
      <div class="actions">
        <button class="primary" onclick="location.reload()">Try again</button>
        <a class="secondary" href="/">Go home</a>
        <button class="ghost" id="copyId">Copy error ID</button>
      </div>
      <div class="meta">Error reference <code id="errorId">${id}</code></div>
    </main>
    <script>
      (function () {
        var btn = document.getElementById('copyId');
        var src = document.getElementById('errorId');
        if (!btn || !src) return;
        btn.addEventListener('click', function () {
          var t = src.textContent || '';
          if (navigator.clipboard) navigator.clipboard.writeText(t).catch(function(){});
          var orig = btn.textContent;
          btn.textContent = 'Copied';
          setTimeout(function () { btn.textContent = orig; }, 1400);
        });
      })();
    </script>
  </body>
</html>`;
}
