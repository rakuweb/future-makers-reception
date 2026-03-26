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
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        @import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200');

        .luminous-page {
          font-family: 'Plus Jakarta Sans', sans-serif;
          min-height: 100vh;
          background: linear-gradient(135deg, #bdfeec 0%, #b4e4f5 50%, #9695ff 100%);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 1.5rem;
          position: relative;
          overflow: hidden;
        }

        .orb-1 {
          width: 600px;
          height: 600px;
          background: radial-gradient(circle, rgba(107, 255, 220, 0.45) 0%, rgba(107, 255, 220, 0) 70%);
          position: absolute;
          top: -150px;
          left: -150px;
          border-radius: 50%;
          pointer-events: none;
        }

        .orb-2 {
          width: 800px;
          height: 800px;
          background: radial-gradient(circle, rgba(150, 149, 255, 0.5) 0%, rgba(150, 149, 255, 0) 70%);
          position: absolute;
          bottom: -200px;
          right: -200px;
          border-radius: 50%;
          pointer-events: none;
        }

        .glass-card {
          background: rgba(255, 255, 255, 0.4);
          backdrop-filter: blur(24px);
          -webkit-backdrop-filter: blur(24px);
          border: 1px solid rgba(255, 255, 255, 0.65);
          border-radius: 2rem;
          width: 100%;
          max-width: 32rem;
          padding: 2.5rem;
          position: relative;
          z-index: 10;
        }

        .spinner {
          width: 56px;
          height: 56px;
          border: 4px solid rgba(70, 64, 229, 0.2);
          border-top-color: #4640e5;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .btn-primary {
          background: linear-gradient(135deg, #4640e5, #9695ff);
          color: #fff;
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-weight: 700;
          font-size: 1.25rem;
          padding: 1rem 2.5rem;
          border-radius: 1.5rem;
          border: none;
          cursor: pointer;
          transition: opacity 0.15s;
        }
        .btn-primary:hover { opacity: 0.9; }
        .btn-primary:active { opacity: 0.75; }

        .btn-warning {
          background: linear-gradient(135deg, #f59e0b, #d97706);
          color: #fff;
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-weight: 700;
          font-size: 1.25rem;
          padding: 1rem 2.5rem;
          border-radius: 1.5rem;
          border: none;
          cursor: pointer;
          transition: opacity 0.15s;
        }
        .btn-warning:hover { opacity: 0.9; }
        .btn-warning:active { opacity: 0.75; }

        .btn-error {
          background: linear-gradient(135deg, #b41340, #e53e6a);
          color: #fff;
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-weight: 700;
          font-size: 1.25rem;
          padding: 1rem 2.5rem;
          border-radius: 1.5rem;
          border: none;
          cursor: pointer;
          transition: opacity 0.15s;
        }
        .btn-error:hover { opacity: 0.9; }
        .btn-error:active { opacity: 0.75; }

        .icon-circle {
          width: 5rem;
          height: 5rem;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 2.25rem;
        }

        .success-overlay {
          font-family: 'Plus Jakarta Sans', sans-serif;
          position: fixed;
          inset: 0;
          background: linear-gradient(135deg, #e0e7ff 0%, #f5f3ff 40%, #ecfdf5 70%, #fdf2f8 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 100;
          overflow: hidden;
        }

        .success-orb-1 {
          width: 600px;
          height: 600px;
          background: radial-gradient(circle, rgba(70, 64, 229, 0.18) 0%, rgba(70, 64, 229, 0) 70%);
          position: absolute;
          top: -150px;
          left: -150px;
          border-radius: 50%;
          pointer-events: none;
        }

        .success-orb-2 {
          width: 700px;
          height: 700px;
          background: radial-gradient(circle, rgba(38, 102, 89, 0.15) 0%, rgba(38, 102, 89, 0) 70%);
          position: absolute;
          bottom: -180px;
          right: -180px;
          border-radius: 50%;
          pointer-events: none;
        }

        .success-card {
          background: rgba(255, 255, 255, 0.7);
          backdrop-filter: blur(32px);
          -webkit-backdrop-filter: blur(32px);
          border: 1px solid rgba(255, 255, 255, 0.85);
          border-radius: 2.5rem;
          padding: 3.5rem 4rem;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1.25rem;
          position: relative;
          z-index: 10;
          text-align: center;
          max-width: 600px;
          width: 90vw;
        }

        .success-check-icon {
          font-family: 'Material Symbols Outlined';
          font-size: 6rem;
          background: linear-gradient(135deg, #4640e5, #6dd7db);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          line-height: 1;
          font-variation-settings: 'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 48;
        }

        .success-event-label {
          font-size: 0.875rem;
          font-weight: 600;
          color: #4640e5;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          margin: 0;
        }

        .success-title {
          font-size: clamp(2rem, 5vw, 3rem);
          font-weight: 800;
          color: #312950;
          margin: 0;
          letter-spacing: -0.02em;
          line-height: 1.1;
        }

        .success-name {
          font-size: clamp(1.5rem, 4vw, 2.25rem);
          font-weight: 700;
          color: #4640e5;
          margin: 0;
        }

        .success-message {
          font-size: clamp(1rem, 2.5vw, 1.25rem);
          font-weight: 500;
          color: #312950;
          margin: 0;
        }

        .success-countdown {
          font-size: clamp(0.875rem, 2vw, 1rem);
          color: #7c6fa0;
          font-weight: 500;
          margin: 0;
        }

        .success-divider {
          width: 60px;
          height: 3px;
          background: linear-gradient(135deg, #4640e5, #6dd7db);
          border-radius: 9999px;
        }
      `}</style>

      {/* 受付完了：全画面オーバーレイ */}
      {status === "success" && (
        <div className="success-overlay">
          <div className="success-orb-1" />
          <div className="success-orb-2" />
          <div className="success-card">
            <span className="success-check-icon">check_circle</span>
            <p className="success-event-label">FutureMakers Event</p>
            <div className="success-divider" />
            <p className="success-title">Check-in Complete</p>
            <p className="success-name">{successName} 様</p>
            <p className="success-message">ご来場ありがとうございます！</p>
            <p className="success-countdown">{countdown}秒後に待機画面に戻ります</p>
          </div>
        </div>
      )}

      <div className="luminous-page" style={{ position: "relative" }}>
        {/* 装飾オーブ */}
        <div className="orb-1" />
        <div className="orb-2" />

        {/* ロゴ：上部中央 */}
        <img
          src="/logo-future.svg"
          alt="FutureMakers"
          style={{
            position: "absolute",
            top: "0.5vw",
            left: "50%",
            transform: "translateX(-50%)",
            width: "14vw",
            height: "auto",
            zIndex: 20,
          }}
        />

        {/* ヘッダー */}
        <div style={{ position: "relative", zIndex: 10, textAlign: "center", marginBottom: "2rem" }}>
          <h1 style={{ fontSize: "2.25rem", fontWeight: 800, color: "#2a2880", letterSpacing: "-0.02em", margin: 0 }}>
            受付チェックイン
          </h1>
          <p style={{ color: "#4640e5", fontWeight: 500, marginTop: "0.25rem" }}>
            Contest Reception System
          </p>
        </div>

        {/* メインカード */}
        <div className="glass-card">

          {/* idle: スキャン待機 */}
          {status === "idle" && (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "1rem" }}>
              <p style={{ color: "#2a2880", fontWeight: 600, fontSize: "1.125rem", margin: 0 }}>
                QRコードを読み取ってください
              </p>
              <div id="qr-reader" style={{ width: "100%" }} />
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
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "1.5rem", padding: "3rem 0" }}>
              <div className="spinner" />
              <p style={{ fontSize: "1.5rem", fontWeight: 700, color: "#2a2880", margin: 0 }}>受付中...</p>
            </div>
          )}

          {/* success はカード外で全画面表示 */}

          {/* duplicate */}
          {status === "duplicate" && (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "1.25rem", padding: "2rem 0" }}>
              <div className="icon-circle" style={{ background: "rgba(245, 158, 11, 0.15)" }}>
                ⚠️
              </div>
              <p style={{ fontSize: "2.5rem", fontWeight: 800, color: "#92400e", margin: 0 }}>受付済みです</p>
              {duplicateCheckedInAt && (
                <p style={{ fontSize: "1.125rem", color: "#b45309", fontWeight: 500, margin: 0 }}>
                  受付日時: {formatDateTime(duplicateCheckedInAt)}
                </p>
              )}
              <button className="btn-warning" onClick={handleReset} style={{ marginTop: "0.5rem" }}>
                OK
              </button>
            </div>
          )}

          {/* error */}
          {status === "error" && (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "1.25rem", padding: "2rem 0" }}>
              <div className="icon-circle" style={{ background: "rgba(180, 19, 64, 0.1)" }}>
                ✕
              </div>
              <p style={{ fontSize: "2rem", fontWeight: 800, color: "#b41340", margin: 0 }}>エラーが発生しました</p>
              <p style={{ fontSize: "1.125rem", color: "#b41340", fontWeight: 500, margin: 0 }}>{errorMessage}</p>
              <button className="btn-error" onClick={handleReset} style={{ marginTop: "0.5rem" }}>
                OK
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
