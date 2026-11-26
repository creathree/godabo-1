import {
  getCreathreeUrl,
  getCreathreeXProfileUrl,
  getImajuUrl,
} from "@/lib/siteUrls";

function XLogo({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
    >
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

const linkClass =
  "text-sm text-slate-600 underline-offset-4 transition-colors hover:text-slate-900 hover:underline";

/** Imaju HomeFooter の brand 列を参考。背景は creathree コーポレート同様の白系 */
export function SiteFooter() {
  const creathreeUrl = getCreathreeUrl();
  const imajuUrl = getImajuUrl();
  const xUrl = getCreathreeXProfileUrl();

  return (
    <footer className="relative z-10 mt-auto w-full shrink-0 border-t border-slate-200 bg-slate-50 text-slate-700">
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <a
              href={creathreeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-base font-bold tracking-tight text-slate-900 hover:text-slate-700"
            >
              creathree
            </a>
            <p className="mt-2 max-w-sm text-sm leading-relaxed text-slate-600">
              Chiba, Japan / Online
            </p>
          </div>

          <nav
            className="flex flex-wrap items-center gap-x-6 gap-y-3"
            aria-label="外部リンク"
          >
            <a
              href={creathreeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={linkClass}
            >
              creathree.com
            </a>
            <a
              href={imajuUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={linkClass}
            >
              Imaju
            </a>
            <a
              href={xUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm text-slate-600 transition-colors hover:text-slate-900"
              aria-label="X (creathree)"
            >
              <XLogo className="h-4 w-4" />
              <span className="sr-only">X</span>
            </a>
          </nav>
        </div>

        <div className="mt-8 border-t border-slate-200 pt-4 text-center text-xs text-slate-500 sm:text-left">
          © 2026 creathree. All rights reserved.
        </div>
      </div>
    </footer>
  );
}