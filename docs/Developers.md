# About godabo & the people behind it

**Languages:** [日本語](./開発元.md) · **English** · [한국어](./개발주체.md)

This page is a **static summary** for a public repository. It explains *who* maintains godabo and *why* the source is open. It is updated only when ownership or overall purpose changes—not on every episode. Episode-by-episode documentation is in Japanese under `docs/`; the [note serial (JA)](https://note.com/nana_nezumi/n/nf4c8147368ae) carries longer background essays.

---

## Who we are

| Name | Role |
| --- | --- |
| **[creathree](https://creathree.com/)** | Independent software studio. Develops godabo and publishes the source on [GitHub](https://github.com/creathree). |
| **[Imaju](https://imaju.creathree.com/)** | creathree’s flagship product—a browser-based notation and MIDI score editor. godabo is a separate project, but it shares the same studio culture and engineering habits. |
| **[bracket-i18n](https://www.npmjs.com/package/bracket-i18n)** | Open workflow for in-source `[[text]]` markers, catalogs, and `Languages(id, locale)`. UI copy in this repo is designed around it (`ja` / `ko`). |

---

## What godabo is for

**godabo** is the web front for a participatory **5W1H** experience: who, when, where, what, why, and how—filled in together, then enjoyed as one story.

We are building it in the open so others can follow the history (Git tags such as `note-第二回`), reuse ideas, and compare approaches—not as a one-off demo, but with seriousness closer to a real product.

---

## Why we publish source and docs together

1. **Open build aligned with the note serial** — code and reproducible steps stay in Git; longer narrative stays on note.
2. **Reproducibility** — tagged snapshots let you inspect “what existed at episode N.”
3. **Lean operations** — Cloudflare (including Tunnel), Firebase where needed, and small-team constraints are deliberate choices.

---

## Zero trust, personal data, and security (what we want to share)

A participatory service forces hard questions about **identity, rooms, and personal data**. We use this repository to leave **work-in-progress examples**—how we think about zero trust, leak prevention, authentication, and policies—and to **exchange notes** with others.

We document what creathree is trying and welcome feedback and alternatives via Issues and PRs.

In brief:

- **Trust boundaries** — Do not assume safety only inside the app. Plan separation across browser, edge (Cloudflare), and server; room-scoped state where possible.
- **Policy with auth** — Privacy and terms should ship together with sign-in, not after the fact. Collection stays minimal and purposeful.
- **Examples already visible here** — Secrets stay out of Git (see templates and `.env.example` only); tunnel credentials live outside the repo; optional dev exposure via Tunnel rather than always-on staging; basic security headers and locale checks at the edge of the app.
- **Authentication (direction)** — Prefer redirect-based sign-in over popup flows; align policy text with locale URLs and version them with releases as we implement.

Readers may treat these notes as material to **compare with their own policies** or as a starting sketch—not as legal or compliance advice.

---

## Contact

| Channel | Use |
| --- | --- |
| **GitHub (creathree org)** | Bugs, suggestions, documentation fixes — Issues and Pull Requests |
| **note (Japanese)** | Background and essays; **this repository remains the canonical source for code** |

For matters related to this repository or software development in general, please contact us via [GitHub (creathree)](https://github.com/creathree) or [creathree.com](https://creathree.com/).

---

## Official links

| Item | Status |
| --- | --- |
| **X** | *Coming soon* — URL will be added here when ready. |
| **creathree** | [creathree.com](https://creathree.com/) |
| **Imaju** | [imaju.creathree.com](https://imaju.creathree.com/) |