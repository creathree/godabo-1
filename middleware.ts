import { NextRequest, NextResponse } from "next/server";
import { Redis } from "@upstash/redis";
import { Ratelimit } from "@upstash/ratelimit";

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|favicon.svg|site.webmanifest|images/|.*\\.(?:svg|png|jpg|jpeg|gif|webp|avif|ico|css|js|map|txt|woff|woff2|mp3|wav|ogg|mp4|webm)$).*)",
  ],
};

let redis: Redis | null = null;
try {
  redis = Redis.fromEnv();
} catch (err) {
  console.error(
    "[Middleware] Upstash env missing — rate limit / ban disabled",
    err,
  );
}

const rlPublic = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(120, "1 m"),
      prefix: "rl:godabo:pub:m",
    })
  : null;
const rlApi = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(60, "1 m"),
      prefix: "rl:godabo:api:m",
    })
  : null;
const rlAuthCb = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(30, "1 m"),
      prefix: "rl:godabo:cb:m",
    })
  : null;
const rlGeneratorRelease = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(2, "1 m"),
      prefix: "rl:godabo:genrel:m",
    })
  : null;
const rlNextDataDoc = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(80, "1 m"),
      prefix: "rl:godabo:ndata:doc:m",
    })
  : null;
const rlNextData = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(120, "1 m"),
      prefix: "rl:godabo:ndata:m",
    })
  : null;

const STRIKE_THRESHOLD = 25;
const STRIKE_TTL_SEC = 1800;
const DENY_TTL_BASE_SEC = 1800;

function getIP(req: NextRequest) {
  const cfIP = req.headers.get("cf-connecting-ip");
  if (cfIP) return cfIP;
  const xff = req.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0].trim();
  return "unknown";
}

function isSerankingBacklinksCrawler(req: NextRequest): boolean {
  const ua = req.headers.get("user-agent") ?? "";
  return /seranking\.com\/backlinks-crawler/i.test(ua);
}

function isNextBuildAsset(path: string) {
  return path.startsWith("/_next/static/") || path.startsWith("/_next/image");
}

function isNextDataPath(path: string) {
  return path.startsWith("/_next/data/");
}

function isNextDataDocPath(path: string) {
  return isNextDataPath(path) && /\/doc\/[^/]+\.json$/i.test(path);
}

function isStaticAsset(path: string) {
  return (
    isNextBuildAsset(path) ||
    path.startsWith("/favicon") ||
    path.startsWith("/robots.txt") ||
    path.startsWith("/sitemap") ||
    path.startsWith("/site.webmanifest") ||
    path.startsWith("/images/") ||
    path.match(
      /\.(png|jpg|jpeg|gif|webp|avif|svg|ico|css|js|map|txt|woff|woff2|mp4|webm|mp3|wav|ogg)$/i,
    )
  );
}

function isSecretProbePath(path: string) {
  if (path.includes("/.git/") || path.includes("/.config/gcloud/")) return true;
  return /(?:^|\/)(?:\.env(?:\.[^/]+)?|service-account\.json|sa\.json|gcp-key\.json|gcp-credentials\.json|gcp-sa\.json|credentials\.json|google-credentials\.json|google-key\.json|application_default_credentials\.json|key\.json|keyfile\.json|firebase-adminsdk\.json|firebase-key\.json)$/i.test(
    path,
  );
}

function isLegacyScannerPath(path: string): boolean {
  const lower = path.toLowerCase();
  if (/\.(?:php\d*|phtml|phar)(?:\/|$)/i.test(path)) return true;
  if (lower.includes(".wp-") || lower.includes("xmlrpc")) return true;
  if (lower.includes("phpmyadmin") || lower.includes("phpinfo")) return true;
  if (lower.includes("wp-admin") || lower.includes("wp-login")) return true;
  if (lower === "/_environment" || lower.includes("/_profiler/")) return true;
  if (lower.includes(".env")) return true;
  return false;
}

function isLocalSpeechMasterHost(req: NextRequest): boolean {
  const h = req.nextUrl.hostname;
  return h === "localhost" || h === "127.0.0.1";
}

const HOSTING_API = new Set(["/api/fromhosting", "/api/auth-sendingapi"]);

function hostingApiCors(req: NextRequest): Record<string, string> | null {
  const origin = req.headers.get("origin");
  if (!origin) return null;
  try {
    const url = new URL(origin);
    const isLocalhost = url.protocol === "http:" && url.hostname === "localhost";
    const isCreathree =
      url.protocol === "https:" &&
      (url.hostname === "creathree.com" ||
        url.hostname.endsWith(".creathree.com"));
    if (!isLocalhost && !isCreathree) return null;
  } catch {
    return null;
  }
  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers":
      "Content-Type, company, service, Authorization, crypter",
    "Access-Control-Allow-Credentials": "true",
    Vary: "Origin",
  };
}

function withHostingApiCors(req: NextRequest, res: NextResponse) {
  if (!HOSTING_API.has(req.nextUrl.pathname)) return res;
  const cors = hostingApiCors(req);
  if (cors) {
    for (const [k, v] of Object.entries(cors)) res.headers.set(k, v);
  }
  return res;
}

function blockResponse(req: NextRequest) {
  return withHostingApiCors(
    req,
    new NextResponse("Forbidden", {
      status: 403,
      headers: { "Cache-Control": "no-store" },
    }),
  );
}

async function addStrike(ip: string, points: number) {
  if (!redis) return 0;
  const key = `strike:ip:${ip}`;
  const p = redis.pipeline();
  p.incrby(key, points);
  p.expire(key, STRIKE_TTL_SEC);
  const [count] = (await p.exec()) as [number, unknown];
  return count;
}

async function ban(ip: string, seconds: number) {
  if (!redis) return;
  await redis.set(`deny:ip:${ip}`, "1", { ex: seconds });
}

async function isBanned(ip: string) {
  if (!redis) return false;
  return (await redis.get(`deny:ip:${ip}`)) !== null;
}

async function getBanSeconds(ip: string) {
  if (!redis) return DENY_TTL_BASE_SEC;
  const key = `banCount:ip:${ip}`;
  const p = redis.pipeline();
  p.incr(key);
  p.expire(key, 604800);
  const [n] = (await p.exec()) as [number, unknown];
  if (n <= 1) return DENY_TTL_BASE_SEC;
  if (n === 2) return 21600;
  if (n === 3) return 86400;
  return 172800;
}

export default async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;

  if (isStaticAsset(path)) return NextResponse.next();

  if (isSerankingBacklinksCrawler(req)) {
    return new NextResponse("Forbidden", {
      status: 403,
      headers: { "Cache-Control": "no-store" },
    });
  }

  if (isLegacyScannerPath(path)) {
    const ip = getIP(req);
    try {
      if (await isBanned(ip)) return blockResponse(req);
      if ((await addStrike(ip, 4)) >= STRIKE_THRESHOLD)
        await ban(ip, await getBanSeconds(ip));
    } catch {
      // Redis 障害でも 404
    }
    return new NextResponse("Not Found", {
      status: 404,
      headers: { "Cache-Control": "no-store" },
    });
  }

  if (isSecretProbePath(path)) {
    const ip = getIP(req);
    try {
      if (await isBanned(ip)) return blockResponse(req);
      if ((await addStrike(ip, 8)) >= STRIKE_THRESHOLD)
        await ban(ip, await getBanSeconds(ip));
    } catch {
      // Redis 障害でも 404
    }
    return new NextResponse("Not Found", {
      status: 404,
      headers: { "Cache-Control": "no-store" },
    });
  }

  if (path === "/speech-master" || path.startsWith("/speech-master/")) {
    if (!isLocalSpeechMasterHost(req)) {
      return new NextResponse("Not Found", {
        status: 404,
        headers: { "Cache-Control": "no-store" },
      });
    }
  }

  if (HOSTING_API.has(path) && req.method === "OPTIONS") {
    const cors = hostingApiCors(req) ?? {};
    return new NextResponse(null, { status: 204, headers: cors });
  }

  // App Router: サブドメインが製品名のため `/` のみ `/home` へ（locale 正規化は i18n 本実装時）
  if (path === "/") {
    const url = req.nextUrl.clone();
    url.pathname = "/home";
    return NextResponse.redirect(url, 307);
  }

  const ip = getIP(req);

  try {
    if (await isBanned(ip)) return blockResponse(req);

    let limitResult;
    const isGeneratorRelease =
      path === "/api/generator/release" ||
      path.startsWith("/api/generator/release/");
    if (isGeneratorRelease) {
      limitResult = rlGeneratorRelease
        ? await rlGeneratorRelease.limit(`ip:${ip}`)
        : rlApi
          ? await rlApi.limit(`ip:${ip}`)
          : null;
      if (limitResult && !limitResult.success) {
        if ((await addStrike(ip, 12)) >= STRIKE_THRESHOLD)
          await ban(ip, await getBanSeconds(ip));
        return withHostingApiCors(
          req,
          new NextResponse("Too Many Requests", { status: 429 }),
        );
      }
    } else if (path.startsWith("/api/")) {
      limitResult = rlApi ? await rlApi.limit(`ip:${ip}`) : null;
      if (limitResult && !limitResult.success) {
        if ((await addStrike(ip, 5)) >= STRIKE_THRESHOLD)
          await ban(ip, await getBanSeconds(ip));
        return withHostingApiCors(
          req,
          new NextResponse("Too Many Requests", { status: 429 }),
        );
      }
    } else if (path.startsWith("/__/auth/") || path.includes("/auth/handler")) {
      limitResult = rlAuthCb ? await rlAuthCb.limit(`ip:${ip}`) : null;
      if (limitResult && !limitResult.success) {
        if ((await addStrike(ip, 8)) >= STRIKE_THRESHOLD)
          await ban(ip, await getBanSeconds(ip));
        return withHostingApiCors(
          req,
          new NextResponse("Too Many Requests", { status: 429 }),
        );
      }
    } else if (isNextDataDocPath(path)) {
      limitResult = rlNextDataDoc
        ? await rlNextDataDoc.limit(`ip:${ip}`)
        : null;
      if (limitResult && !limitResult.success) {
        if ((await addStrike(ip, 6)) >= STRIKE_THRESHOLD)
          await ban(ip, await getBanSeconds(ip));
        return withHostingApiCors(
          req,
          new NextResponse("Too Many Requests", { status: 429 }),
        );
      }
    } else if (isNextDataPath(path)) {
      limitResult = rlNextData ? await rlNextData.limit(`ip:${ip}`) : null;
      if (limitResult && !limitResult.success) {
        if ((await addStrike(ip, 4)) >= STRIKE_THRESHOLD)
          await ban(ip, await getBanSeconds(ip));
        return withHostingApiCors(
          req,
          new NextResponse("Too Many Requests", { status: 429 }),
        );
      }
    } else {
      limitResult = rlPublic ? await rlPublic.limit(`ip:${ip}`) : null;
      if (limitResult && !limitResult.success) {
        if ((await addStrike(ip, 2)) >= STRIKE_THRESHOLD)
          await ban(ip, await getBanSeconds(ip));
        return withHostingApiCors(
          req,
          new NextResponse("Too Many Requests", { status: 429 }),
        );
      }
    }

    if (!req.headers.get("user-agent")) {
      if ((await addStrike(ip, 3)) >= STRIKE_THRESHOLD)
        await ban(ip, await getBanSeconds(ip));
    }
  } catch (error) {
    console.error("[Middleware Error]:", error);
  }

  if (process.env.NODE_ENV !== "production") {
    return withHostingApiCors(req, NextResponse.next());
  }

  const isLocal =
    req.nextUrl.hostname === "localhost" ||
    req.nextUrl.hostname === "127.0.0.1" ||
    req.nextUrl.hostname === "[::1]";

  const scriptSrc =
    "script-src 'self' 'unsafe-inline' 'wasm-unsafe-eval' https://static.cloudflareinsights.com https://apis.google.com";
  const workerSrc = "worker-src 'self' blob:";

  const csp = `
    default-src 'self';
    ${scriptSrc};
    ${workerSrc};
    style-src 'self' 'unsafe-inline';
    img-src 'self' data: blob:;
    media-src 'self' blob:;
    font-src 'self' data:;
    connect-src 'self' https://*.googleapis.com https://*.google.com https://cloudflareinsights.com wss://*.creathree.com wss://*.workers.dev wss://*.creasoundjapan.workers.dev https://*.creasoundjapan.workers.dev;
    frame-src 'self' https://www.google.com https://www.gstatic.com https://*.firebaseapp.com;
    base-uri 'self';
    form-action 'self';
    frame-ancestors 'none';
    object-src 'none';
    ${isLocal ? "" : "upgrade-insecure-requests;"}
  `
    .replace(/\s+/g, " ")
    .trim();

  const response = NextResponse.next();

  response.headers.set("Content-Security-Policy", csp);
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("Cross-Origin-Opener-Policy", "same-origin-allow-popups");

  if (!isLocal) {
    response.headers.set(
      "Strict-Transport-Security",
      "max-age=31536000; includeSubDomains; preload",
    );
  }

  return withHostingApiCors(req, response);
}