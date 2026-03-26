"use client";

import { useEffect, useState } from "react";
import { QRCodeSVG } from "qrcode.react";

const MATERIAL_ICON: React.CSSProperties = {
  fontFamily: "'Material Symbols Outlined'",
};

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
      {/* 画面表示 */}
      <div className="h-[100dvh] bg-[linear-gradient(135deg,#bdfeec_0%,#b4e4f5_50%,#9695ff_100%)] flex items-center justify-start pt-[2vw] px-[clamp(0.75rem,4vw,2rem)] pb-[clamp(0.75rem,4vw,2rem)] relative overflow-hidden print:hidden">
        {/* 装飾オーブ */}
        <div className="absolute top-[-13vw] left-[-13vw] w-[clamp(200px,52vw,400px)] h-[clamp(200px,52vw,400px)] rounded-full pointer-events-none bg-[radial-gradient(circle,rgba(107,255,220,0.45)_0%,rgba(107,255,220,0)_70%)]" />
        <div className="absolute bottom-[-19vw] right-[-19vw] w-[clamp(250px,64vw,500px)] h-[clamp(250px,64vw,500px)] rounded-full pointer-events-none bg-[radial-gradient(circle,rgba(150,149,255,0.5)_0%,rgba(150,149,255,0)_70%)]" />

        {/* ロゴ＋カード ラッパー */}
        <div className="relative z-10 w-[min(90vw,26rem)]">
          {/* ロゴ：カード外・上部中央 */}
          <img
            src="/logo-future.svg"
            alt="FutureMakers"
            className="w-[42vw] max-w-[200px] h-auto block mx-auto mb-[clamp(0.5rem,1.5dvh,1rem)]"
          />

          {/* ガラスカード */}
          <div className="bg-white/50 backdrop-blur-xl border border-white/70 rounded-[clamp(1rem,5.1vw,2rem)] w-full py-[clamp(0.875rem,2dvh,2.5rem)] px-[clamp(1rem,5.1vw,2.5rem)] relative z-10">

            {/* ヘッダー */}
            <div className="text-center mb-[clamp(0.5rem,1.5dvh,1.75rem)]">
              <h1 className="text-[clamp(1rem,4.2vw,1.75rem)] font-extrabold text-[#312950] m-0 tracking-tight">参加者登録</h1>
              <p className="text-[#7c6fa0] font-medium text-[clamp(0.7rem,2.3vw,0.9375rem)] mt-[0.2em] m-0">情報を入力してQRコードを生成してください</p>
            </div>

            {/* フォーム */}
            <div className="flex flex-col gap-[clamp(0.375rem,1dvh,0.875rem)]">

              {/* お名前 */}
              <div>
                <label className="block text-[clamp(0.65rem,1.5dvh,0.8125rem)] font-semibold text-[#312950] mb-[clamp(0.15rem,0.5dvh,0.375rem)]">お名前</label>
                <div className="bg-white/60 border border-white/80 rounded-[clamp(0.625rem,2.6vw,1rem)] flex items-center gap-[clamp(0.5rem,1.9vw,0.75rem)] px-[clamp(0.625rem,2.6vw,1rem)] transition-[border-color,box-shadow] duration-200 focus-within:border-[#4640e5] focus-within:shadow-[0_0_0_3px_rgba(70,64,229,0.12)]">
                  <span className="text-[clamp(1rem,3.2vw,1.375rem)] text-[#4640e5] select-none shrink-0" style={MATERIAL_ICON}>person</span>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="山田 太郎"
                    className="flex-1 bg-transparent border-0 outline-none text-[clamp(0.875rem,2.6vw,1.0625rem)] text-[#312950] py-[clamp(0.5rem,1dvh,0.875rem)] placeholder:text-[#a89ec0]"
                  />
                </div>
              </div>

              {/* 学年 */}
              <div>
                <label className="block text-[clamp(0.65rem,1.5dvh,0.8125rem)] font-semibold text-[#312950] mb-[clamp(0.15rem,0.5dvh,0.375rem)]">学年</label>
                <div className="bg-white/60 border border-white/80 rounded-[clamp(0.625rem,2.6vw,1rem)] flex items-center gap-[clamp(0.5rem,1.9vw,0.75rem)] px-[clamp(0.625rem,2.6vw,1rem)] transition-[border-color,box-shadow] duration-200 focus-within:border-[#4640e5] focus-within:shadow-[0_0_0_3px_rgba(70,64,229,0.12)]">
                  <span className="text-[clamp(1rem,3.2vw,1.375rem)] text-[#4640e5] select-none shrink-0" style={MATERIAL_ICON}>school</span>
                  <select
                    value={grade}
                    onChange={(e) => setGrade(e.target.value)}
                    className="flex-1 bg-transparent border-0 outline-none text-[clamp(0.875rem,2.6vw,1.0625rem)] text-[#312950] py-[clamp(0.5rem,1dvh,0.875rem)] cursor-pointer appearance-none"
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
                <label className="block text-[clamp(0.65rem,1.5dvh,0.8125rem)] font-semibold text-[#312950] mb-[clamp(0.15rem,0.5dvh,0.375rem)]">所属・学部</label>
                <div className="bg-white/60 border border-white/80 rounded-[clamp(0.625rem,2.6vw,1rem)] flex items-center gap-[clamp(0.5rem,1.9vw,0.75rem)] px-[clamp(0.625rem,2.6vw,1rem)] transition-[border-color,box-shadow] duration-200 focus-within:border-[#4640e5] focus-within:shadow-[0_0_0_3px_rgba(70,64,229,0.12)]">
                  <span className="text-[clamp(1rem,3.2vw,1.375rem)] text-[#4640e5] select-none shrink-0" style={MATERIAL_ICON}>corporate_fare</span>
                  <input
                    type="text"
                    value={affiliation}
                    onChange={(e) => setAffiliation(e.target.value)}
                    placeholder="工学部"
                    className="flex-1 bg-transparent border-0 outline-none text-[clamp(0.875rem,2.6vw,1.0625rem)] text-[#312950] py-[clamp(0.5rem,1dvh,0.875rem)] placeholder:text-[#a89ec0]"
                  />
                </div>
              </div>

              {/* 学籍番号（任意） */}
              <div>
                <label className="block text-[clamp(0.65rem,1.5dvh,0.8125rem)] font-semibold text-[#312950] mb-[clamp(0.15rem,0.5dvh,0.375rem)]">
                  学籍番号
                  <span className="font-normal text-[#a89ec0] ml-[0.4em]">（任意）</span>
                </label>
                <div className={`bg-white/60 border rounded-[clamp(0.625rem,2.6vw,1rem)] flex items-center gap-[clamp(0.5rem,1.9vw,0.75rem)] px-[clamp(0.625rem,2.6vw,1rem)] transition-[border-color,box-shadow] duration-200 focus-within:shadow-[0_0_0_3px_rgba(70,64,229,0.12)] ${studentIdError ? "border-[#b41340]" : "border-white/80 focus-within:border-[#4640e5]"}`}>
                  <span className={`text-[clamp(1rem,3.2vw,1.375rem)] select-none shrink-0 ${studentIdError ? "text-[#b41340]" : "text-[#4640e5]"}`} style={MATERIAL_ICON}>badge</span>
                  <input
                    type="text"
                    value={studentId}
                    onChange={(e) => handleStudentIdChange(e.target.value)}
                    placeholder="a11a111a"
                    className="flex-1 bg-transparent border-0 outline-none text-[clamp(0.875rem,2.6vw,1.0625rem)] text-[#312950] py-[clamp(0.5rem,1dvh,0.875rem)] placeholder:text-[#a89ec0]"
                  />
                </div>
                {studentIdError && (
                  <p className="text-[#b41340] text-[clamp(0.65rem,2vw,0.75rem)] mt-1 ml-1 m-0">{studentIdError}</p>
                )}
              </div>
            </div>

            {/* QRコード表示 */}
            {isComplete && (
              <div className="mt-[clamp(0.5rem,1.5dvh,1.75rem)] flex flex-col gap-[clamp(0.375rem,1dvh,1rem)]">
                <p className="text-center text-[clamp(0.7rem,1.5dvh,0.9375rem)] text-[#7c6fa0] font-medium m-0">QRコードが生成されました</p>
                <div className="bg-white/80 border border-white/90 rounded-[clamp(0.75rem,3.8vw,1.5rem)] p-[clamp(0.5rem,1.5dvh,1.5rem)] flex justify-center">
                  <QRCodeSVG value={qrValue} size={qrSize} />
                </div>
                <button
                  onClick={() => window.print()}
                  className="w-full bg-[rgba(70,64,229,0.1)] text-[#4640e5] font-bold text-[clamp(0.875rem,2.7vw,1.125rem)] py-[clamp(0.5rem,1.2dvh,1.125rem)] rounded-[clamp(1rem,3.8vw,1.5rem)] border border-[rgba(70,64,229,0.3)] cursor-pointer flex items-center justify-center gap-[clamp(0.375rem,1.3vw,0.5rem)] transition-colors hover:bg-[rgba(70,64,229,0.15)]"
                >
                  <span className="text-[clamp(1rem,3.2vw,1.375rem)]" style={MATERIAL_ICON}>print</span>
                  印刷する
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 印刷専用エリア */}
      {isComplete && (
        <div
          id="qr-section"
          className="hidden print:flex flex-col items-center justify-center min-h-screen"
        >
          <QRCodeSVG value={qrValue} size={256} />
          <p className="mt-4 text-lg font-semibold">{name}</p>
          <p className="text-sm text-[#555]">{affiliation}　{grade}年　{studentId}</p>
        </div>
      )}
    </>
  );
}
