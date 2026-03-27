"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Html5QrcodeScanner, Html5QrcodeSupportedFormats } from "html5-qrcode";

type Status = "idle" | "submitting" | "success" | "duplicate" | "error";

type ParticipantData = {
  name: string;
  affiliation: string;
  grade: string;
  studentId: string;
};

const MATERIAL_ICON: React.CSSProperties = {
  fontFamily: "'Material Symbols Outlined'",
};

export default function CheckinPage() {
  const [status, setStatus] = useState<Status>("idle");
  const [successName, setSuccessName] = useState("");
  const [countdown, setCountdown] = useState(5);
  const [duplicateCheckedInAt, setDuplicateCheckedInAt] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState("");

  const scannerRef = useRef<Html5QrcodeScanner | null>(null);
  const usbInputRef = useRef<HTMLInputElement>(null);
  const processingRef = useRef(false);

  const handleScanResult = useCallback(async (text: string) => {
    if (processingRef.current) return;
    processingRef.current = true;
    let data: ParticipantData;
    try {
      data = JSON.parse(decodeURIComponent(text)) as ParticipantData;
      if (!data.name || !data.affiliation || !data.grade) {
        throw new Error("missing fields");
      }
    } catch {
      console.error("QR decode failed. Raw text:", text);
      setErrorMessage("QRコードの形式が正しくありません");
      setStatus("error");
      processingRef.current = false;
      return;
    }

    setStatus("submitting");

    try {
      const res = await fetch("/api/checkin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (res.status === 201) {
        setSuccessName(data.name);
        setCountdown(5);
        setStatus("success");
      } else if (res.status === 409) {
        const json = await res.json();
        setDuplicateCheckedInAt(json.participant.checkedInAt);
        setStatus("duplicate");
      } else {
        setErrorMessage("受付処理に失敗しました");
        setStatus("error");
      }
    } catch {
      setErrorMessage("ネットワークエラーが発生しました");
      setStatus("error");
    } finally {
      processingRef.current = false;
    }
  }, []);

  // 受付完了カウントダウン
  useEffect(() => {
    if (status !== "success") return;
    if (countdown <= 0) {
      setStatus("idle");
      return;
    }
    const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [status, countdown]);

  // カメラスキャナー（idle時のみ起動）
  useEffect(() => {
    if (status !== "idle") return;

    const scanner = new Html5QrcodeScanner(
      "qr-reader",
      {
        fps: 10,
        qrbox: { width: 250, height: 250 },
        formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE],
      },
      false
    );
    scannerRef.current = scanner;

    scanner.render(
      (decodedText) => { handleScanResult(decodedText); },
      () => {}
    );

    return () => {
      scanner.clear().catch(() => {});
      scannerRef.current = null;
    };
  }, [status, handleScanResult]);

  // USBリーダー用フォーカス維持（idle時のみ）
  useEffect(() => {
    if (status !== "idle") return;
    const timer = setTimeout(() => usbInputRef.current?.focus(), 100);
    return () => clearTimeout(timer);
  }, [status]);

  const handleUsbKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      const value = e.currentTarget.value.trim();
      e.currentTarget.value = "";
      if (value) handleScanResult(value);
    }
  };

  const handleUsbBlur = () => {
    if (status === "idle") setTimeout(() => usbInputRef.current?.focus(), 0);
  };

  const handleReset = () => {
    setDuplicateCheckedInAt(null);
    setErrorMessage("");
    setStatus("idle");
  };

  const formatDateTime = (iso: string) =>
    new Date(iso).toLocaleString("ja-JP", {
      year: "numeric", month: "2-digit", day: "2-digit",
      hour: "2-digit", minute: "2-digit", second: "2-digit",
    });

  return (
    <>
      {/* 受付完了：全画面オーバーレイ */}
      {status === "success" && (
        <div className="fixed inset-0 z-[100] overflow-hidden flex items-center justify-center bg-[linear-gradient(135deg,#e0e7ff_0%,#f5f3ff_40%,#ecfdf5_70%,#fdf2f8_100%)]">
          <div className="absolute -top-[150px] -left-[150px] w-[600px] h-[600px] rounded-full pointer-events-none bg-[radial-gradient(circle,rgba(70,64,229,0.18)_0%,rgba(70,64,229,0)_70%)]" />
          <div className="absolute -bottom-[180px] -right-[180px] w-[700px] h-[700px] rounded-full pointer-events-none bg-[radial-gradient(circle,rgba(38,102,89,0.15)_0%,rgba(38,102,89,0)_70%)]" />
          <div className="relative z-10 flex flex-col items-center gap-5 text-center bg-white/70 backdrop-blur-[32px] border border-white/[0.85] rounded-[2.5rem] px-16 py-14 max-w-[600px] w-[90vw]">
            <span
              className="text-[6rem] leading-none bg-clip-text text-transparent bg-[linear-gradient(135deg,#4640e5,#6dd7db)]"
              style={{ ...MATERIAL_ICON, fontVariationSettings: "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 48" }}
            >check_circle</span>
            <p className="text-sm font-semibold text-[#4640e5] tracking-[0.08em] uppercase m-0">FutureMakers Event</p>
            <div className="w-[60px] h-[3px] rounded-full bg-[linear-gradient(135deg,#4640e5,#6dd7db)]" />
            <p className="text-[clamp(2rem,5vw,3rem)] font-extrabold text-[#312950] m-0 leading-[1.1] tracking-tight">Check-in Complete</p>
            <p className="text-[clamp(1.5rem,4vw,2.25rem)] font-bold text-[#4640e5] m-0">{successName} 様</p>
            <p className="text-[clamp(1rem,2.5vw,1.25rem)] font-medium text-[#312950] m-0">ご来場ありがとうございます！</p>
            <p className="text-[clamp(0.875rem,2vw,1rem)] text-[#7c6fa0] font-medium m-0">{countdown}秒後に待機画面に戻ります</p>
          </div>
        </div>
      )}

      {/* メインページ */}
      <div className="min-h-screen bg-[linear-gradient(135deg,#bdfeec_0%,#b4e4f5_50%,#9695ff_100%)] flex flex-col items-center justify-center p-6 relative overflow-hidden">
        {/* 装飾オーブ */}
        <div className="absolute -top-[150px] -left-[150px] w-[600px] h-[600px] rounded-full pointer-events-none bg-[radial-gradient(circle,rgba(107,255,220,0.45)_0%,rgba(107,255,220,0)_70%)]" />
        <div className="absolute -bottom-[200px] -right-[200px] w-[800px] h-[800px] rounded-full pointer-events-none bg-[radial-gradient(circle,rgba(150,149,255,0.5)_0%,rgba(150,149,255,0)_70%)]" />

        {/* ヘッダー */}
        <div className="relative z-10 text-center mb-8 flex flex-col items-center gap-4">
          <img
            src="/logo-future.svg"
            alt="FutureMakers"
            className="w-[14vw] h-auto"
          />
          <div>
            <h1 className="text-4xl font-extrabold text-[#2a2880] tracking-tight m-0">受付チェックイン</h1>
            <p className="text-[#4640e5] font-medium mt-1 m-0">Contest Reception System</p>
          </div>
        </div>

        {/* メインカード */}
        <div className="bg-white/40 backdrop-blur-xl border border-white/[0.65] rounded-[2rem] w-full max-w-2xl p-10 relative z-10">

          {/* idle: スキャン待機 */}
          {status === "idle" && (
            <div className="flex flex-col items-center gap-4">
              <p className="text-[#2a2880] font-semibold text-lg m-0">QRコードを読み取ってください</p>
              <div id="qr-reader" className="w-full" />
              <input
                ref={usbInputRef}
                type="text"
                className="sr-only"
                onKeyDown={handleUsbKeyDown}
                onBlur={handleUsbBlur}
                aria-label="USB QRリーダー入力"
                autoComplete="off"
              />
            </div>
          )}

          {/* submitting */}
          {status === "submitting" && (
            <div className="flex flex-col items-center gap-6 py-12">
              <div className="w-14 h-14 rounded-full border-4 border-[rgba(70,64,229,0.2)] border-t-[#4640e5] animate-spin" />
              <p className="text-2xl font-bold text-[#2a2880] m-0">受付中...</p>
            </div>
          )}

          {/* duplicate */}
          {status === "duplicate" && (
            <div className="flex flex-col items-center gap-5 py-8">
              <div className="w-20 h-20 rounded-full flex items-center justify-center text-4xl bg-[rgba(245,158,11,0.15)]">⚠️</div>
              <p className="text-4xl font-extrabold text-[#92400e] m-0">受付済みです</p>
              {duplicateCheckedInAt && (
                <p className="text-lg text-[#b45309] font-medium m-0">受付日時: {formatDateTime(duplicateCheckedInAt)}</p>
              )}
              <button
                onClick={handleReset}
                className="mt-2 px-10 py-4 text-xl font-bold rounded-[1.5rem] text-white bg-[linear-gradient(135deg,#f59e0b,#d97706)] hover:opacity-90 active:opacity-75 transition-opacity border-0 cursor-pointer"
              >OK</button>
            </div>
          )}

          {/* error */}
          {status === "error" && (
            <div className="flex flex-col items-center gap-5 py-8">
              <div className="w-20 h-20 rounded-full flex items-center justify-center text-4xl bg-[rgba(180,19,64,0.1)]">✕</div>
              <p className="text-3xl font-extrabold text-[#b41340] m-0">エラーが発生しました</p>
              <p className="text-lg font-medium text-[#b41340] m-0">{errorMessage}</p>
              <button
                onClick={handleReset}
                className="mt-2 px-10 py-4 text-xl font-bold rounded-[1.5rem] text-white bg-[linear-gradient(135deg,#b41340,#e53e6a)] hover:opacity-90 active:opacity-75 transition-opacity border-0 cursor-pointer"
              >OK</button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
