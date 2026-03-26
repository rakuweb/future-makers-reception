"use client";

import { useEffect, useState } from "react";
import { QRCodeSVG } from "qrcode.react";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [affiliation, setAffiliation] = useState("");
  const [grade, setGrade] = useState("");
  const [studentId, setStudentId] = useState("");
  const [studentIdError, setStudentIdError] = useState("");

  const [qrSize, setQrSize] = useState(180);

  useEffect(() => {
    const update = () => {
      const fromWidth = window.innerWidth * 0.55;
      const fromHeight = window.innerHeight * 0.22;
      setQrSize(Math.min(Math.floor(fromWidth), Math.floor(fromHeight), 220));
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  const STUDENT_ID_PATTERN = /^[a-zA-Z]\d{2}[a-zA-Z]\d{3}[a-zA-Z]$/;

  const handleStudentIdChange = (value: string) => {
    setStudentId(value);
    if (value === "") {
      setStudentIdError("");
    } else if (!STUDENT_ID_PATTERN.test(value)) {
      setStudentIdError("形式が正しくありません（例: a11a111a）");
    } else {
      setStudentIdError("");
    }
  };

  const studentIdValid = studentId === "" || STUDENT_ID_PATTERN.test(studentId);
  const isComplete = name !== "" && affiliation !== "" && grade !== "" && studentIdValid;

  const qrValue = isComplete
    ? encodeURIComponent(JSON.stringify({ name, affiliation, grade, studentId }))
    : "";

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        @import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200');

        .register-page {
          font-family: 'Plus Jakarta Sans', sans-serif;
          height: 100dvh;
          background: linear-gradient(135deg, #bdfeec 0%, #b4e4f5 50%, #9695ff 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: clamp(0.75rem, 4vw, 2rem) clamp(0.75rem, 4vw, 2rem);
          position: relative;
          overflow: hidden;
        }

        .orb-1 {
          width: clamp(200px, 52vw, 400px);
          height: clamp(200px, 52vw, 400px);
          background: radial-gradient(circle, rgba(107, 255, 220, 0.45) 0%, rgba(107, 255, 220, 0) 70%);
          position: absolute;
          top: -13vw;
          left: -13vw;
          border-radius: 50%;
          pointer-events: none;
        }

        .orb-2 {
          width: clamp(250px, 64vw, 500px);
          height: clamp(250px, 64vw, 500px);
          background: radial-gradient(circle, rgba(150, 149, 255, 0.5) 0%, rgba(150, 149, 255, 0) 70%);
          position: absolute;
          bottom: -19vw;
          right: -19vw;
          border-radius: 50%;
          pointer-events: none;
        }

        .glass-card {
          background: rgba(255, 255, 255, 0.5);
          backdrop-filter: blur(24px);
          -webkit-backdrop-filter: blur(24px);
          border: 1px solid rgba(255, 255, 255, 0.7);
          border-radius: clamp(1rem, 5.1vw, 2rem);
          width: 100%;
          padding: clamp(0.875rem, 2dvh, 2.5rem) clamp(1rem, 5.1vw, 2.5rem);
          position: relative;
          z-index: 10;
        }

        .card-title {
          font-size: clamp(1rem, 4.2vw, 1.75rem);
          font-weight: 800;
          color: #312950;
          margin: 0;
          letter-spacing: -0.02em;
        }

        .card-subtitle {
          color: #7c6fa0;
          font-weight: 500;
          font-size: clamp(0.7rem, 2.3vw, 0.9375rem);
          margin-top: 0.2em;
        }

        .card-header {
          text-align: center;
          margin-bottom: clamp(0.5rem, 1.5dvh, 1.75rem);
        }

        .page-logo {
          width: 42vw;
          max-width: 200px;
          height: auto;
          display: block;
          margin: clamp(1rem, 4dvh, 3rem) auto clamp(0.5rem, 1.5dvh, 1.25rem);
        }

        .form-stack {
          display: flex;
          flex-direction: column;
          gap: clamp(0.375rem, 1dvh, 0.875rem);
        }

        .field-label {
          display: block;
          font-size: clamp(0.65rem, 1.5dvh, 0.8125rem);
          font-weight: 600;
          color: #312950;
          margin-bottom: clamp(0.15rem, 0.5dvh, 0.375rem);
        }

        .field-wrapper {
          background: rgba(255, 255, 255, 0.6);
          border: 1px solid rgba(255, 255, 255, 0.8);
          border-radius: clamp(0.625rem, 2.6vw, 1rem);
          display: flex;
          align-items: center;
          gap: clamp(0.5rem, 1.9vw, 0.75rem);
          padding: 0 clamp(0.625rem, 2.6vw, 1rem);
          transition: border-color 0.2s, box-shadow 0.2s;
        }

        .field-wrapper:focus-within {
          border-color: #4640e5;
          box-shadow: 0 0 0 3px rgba(70, 64, 229, 0.12);
        }

        .field-icon {
          font-family: 'Material Symbols Outlined';
          font-size: clamp(1rem, 3.2vw, 1.375rem);
          color: #4640e5;
          user-select: none;
          flex-shrink: 0;
        }

        .field-input {
          flex: 1;
          background: transparent;
          border: none;
          outline: none;
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: clamp(0.875rem, 2.6vw, 1.0625rem);
          color: #312950;
          padding: clamp(0.5rem, 1dvh, 0.875rem) 0;
        }

        .field-input::placeholder {
          color: #a89ec0;
        }

        .field-select {
          flex: 1;
          background: transparent;
          border: none;
          outline: none;
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: clamp(0.875rem, 2.6vw, 1.0625rem);
          color: #312950;
          padding: clamp(0.5rem, 1dvh, 0.875rem) 0;
          cursor: pointer;
          appearance: none;
          -webkit-appearance: none;
        }

        .field-select option {
          color: #312950;
          background: #fff;
        }

        .qr-section {
          margin-top: clamp(0.5rem, 1.5dvh, 1.75rem);
          display: flex;
          flex-direction: column;
          gap: clamp(0.375rem, 1dvh, 1rem);
        }

        .qr-label {
          text-align: center;
          font-size: clamp(0.7rem, 1.5dvh, 0.9375rem);
          color: #7c6fa0;
          font-weight: 500;
          margin: 0;
        }

        .qr-wrapper {
          background: rgba(255, 255, 255, 0.8);
          border: 1px solid rgba(255, 255, 255, 0.9);
          border-radius: clamp(0.75rem, 3.8vw, 1.5rem);
          padding: clamp(0.5rem, 1.5dvh, 1.5rem);
          display: flex;
          justify-content: center;
        }

        .btn-print {
          width: 100%;
          background: rgba(70, 64, 229, 0.1);
          color: #4640e5;
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-weight: 700;
          font-size: clamp(0.875rem, 2.7vw, 1.125rem);
          padding: clamp(0.5rem, 1.2dvh, 1.125rem);
          border-radius: clamp(1rem, 3.8vw, 1.5rem);
          border: 1.5px solid rgba(70, 64, 229, 0.3);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: clamp(0.375rem, 1.3vw, 0.5rem);
          transition: background 0.15s;
        }

        .btn-print:hover {
          background: rgba(70, 64, 229, 0.15);
        }

        .btn-icon {
          font-family: 'Material Symbols Outlined';
          font-size: clamp(1rem, 3.2vw, 1.375rem);
        }

        @media print {
          .register-page { display: none; }
        }
      `}</style>

      {/* 画面表示 */}
      <div className="register-page print:hidden">
        <div className="orb-1" />
        <div className="orb-2" />

        <div style={{ position: "relative", zIndex: 10, width: "min(90vw, 26rem)" }}>
          {/* ロゴ：カード外・上部中央 */}
          <img src="/logo-future.svg" alt="FutureMakers" className="page-logo" />

        <div className="glass-card" style={{ width: "100%" }}>
          {/* ヘッダー */}
          <div className="card-header">
            <h1 className="card-title">参加者登録</h1>
            <p className="card-subtitle">情報を入力してQRコードを生成してください</p>
          </div>

          {/* フォーム */}
          <div className="form-stack">
            {/* お名前 */}
            <div>
              <label className="field-label">お名前</label>
              <div className="field-wrapper">
                <span className="field-icon">person</span>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="山田 太郎"
                  className="field-input"
                />
              </div>
            </div>

            {/* 学年 */}
            <div>
              <label className="field-label">学年</label>
              <div className="field-wrapper">
                <span className="field-icon">school</span>
                <select
                  value={grade}
                  onChange={(e) => setGrade(e.target.value)}
                  className="field-select"
                >
                  <option value="">選択してください</option>
                  <option value="1">学部1年</option>
                  <option value="2">学部2年</option>
                  <option value="3">学部3年</option>
                  <option value="4">学部4年</option>
                  <option value="M1">修士1年</option>
                  <option value="M2">修士2年</option>
                  <option value="D1">博士1年</option>
                  <option value="D2">博士2年</option>
                  <option value="D3">博士3年</option>
                  <option value="other">その他</option>
                </select>
              </div>
            </div>

            {/* 所属・学部 */}
            <div>
              <label className="field-label">所属・学部</label>
              <div className="field-wrapper">
                <span className="field-icon">corporate_fare</span>
                <input
                  type="text"
                  value={affiliation}
                  onChange={(e) => setAffiliation(e.target.value)}
                  placeholder="工学部"
                  className="field-input"
                />
              </div>
            </div>

            {/* 学籍番号（任意） */}
            <div>
              <label className="field-label">
                学籍番号
                <span style={{ fontWeight: 400, color: "#a89ec0", marginLeft: "0.4em" }}>（任意）</span>
              </label>
              <div className="field-wrapper" style={studentIdError ? { borderColor: "#b41340" } : {}}>
                <span className="field-icon" style={studentIdError ? { color: "#b41340" } : {}}>badge</span>
                <input
                  type="text"
                  value={studentId}
                  onChange={(e) => handleStudentIdChange(e.target.value)}
                  placeholder="a11a111a"
                  className="field-input"
                />
              </div>
              {studentIdError && (
                <p style={{ color: "#b41340", fontSize: "clamp(0.65rem, 2vw, 0.75rem)", marginTop: "0.25rem", marginLeft: "0.25rem" }}>
                  {studentIdError}
                </p>
              )}
            </div>
          </div>

          {/* QRコード表示 */}
          {isComplete && (
            <div className="qr-section">
              <p className="qr-label">QRコードが生成されました</p>
              <div className="qr-wrapper">
                <QRCodeSVG value={qrValue} size={qrSize} />
              </div>
              <button className="btn-print" onClick={() => window.print()}>
                <span className="btn-icon">print</span>
                印刷する
              </button>
            </div>
          )}

        </div>
        </div>{/* ラッパー閉じ */}
      </div>

      {/* 印刷専用エリア */}
      {isComplete && (
        <div
          id="qr-section"
          style={{
            display: "none",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "100vh",
          }}
          className="print:flex"
        >
          <QRCodeSVG value={qrValue} size={256} />
          <p style={{ marginTop: "1rem", fontSize: "1.125rem", fontWeight: 600 }}>{name}</p>
          <p style={{ fontSize: "0.875rem", color: "#555" }}>
            {affiliation}　{grade}年　{studentId}
          </p>
        </div>
      )}
    </>
  );
}
