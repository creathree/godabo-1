"use client";

import { useEffect, useState } from "react";

/** クライアントで QR 用 data URL を生成（Imaju Flash 同型） */
export function useQrDataUrl(text: string | null, width = 200): string | null {
  const [dataUrl, setDataUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!text) {
      setDataUrl(null);
      return;
    }
    let cancelled = false;
    void import("qrcode")
      .then(({ default: QRCode }) =>
        QRCode.toDataURL(text, { margin: 1, width, errorCorrectionLevel: "M" }),
      )
      .then((value) => {
        if (!cancelled) setDataUrl(value);
      })
      .catch(() => {
        if (!cancelled) setDataUrl(null);
      });
    return () => {
      cancelled = true;
    };
  }, [text, width]);

  return dataUrl;
}