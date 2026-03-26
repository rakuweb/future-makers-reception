"use client";

import { useCallback, useEffect, useState } from "react";

type Participant = {
  id: string;
  name: string;
  affiliation: string;
  grade: string;
  studentId: string;
  checkedInAt: string;
};

export default function AdminPage() {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchParticipants = useCallback(async () => {
    try {
      const res = await fetch("/api/checkin");
      const data = await res.json();
      setParticipants(data);
      setLastUpdated(new Date());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchParticipants();
    const timer = setInterval(fetchParticipants, 30_000);
    return () => clearInterval(timer);
  }, [fetchParticipants]);

  const handleExportCsv = () => {
    const header = ["No", "名前", "所属", "学年", "学籍番号", "受付日時"];
    const rows = participants.map((p, i) => [
      i + 1,
      p.name,
      p.affiliation,
      `${p.grade}年`,
      p.studentId,
      new Date(p.checkedInAt).toLocaleString("ja-JP"),
    ]);

    const csv = [header, ...rows]
      .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
      .join("\n");

    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `checkin_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const formatDateTime = (iso: string) =>
    new Date(iso).toLocaleString("ja-JP", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-5xl mx-auto">
        {/* ヘッダー */}
        <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">受付管理</h1>
            {lastUpdated && (
              <p className="text-sm text-gray-400 mt-1">
                最終更新: {lastUpdated.toLocaleTimeString("ja-JP")}（30秒ごとに自動更新）
              </p>
            )}
          </div>
          <div className="flex items-center gap-4">
            <span className="text-lg font-semibold text-gray-700">
              受付済み:{" "}
              <span className="text-2xl font-extrabold text-blue-600">{participants.length}</span>
              {" "}名
            </span>
            <button
              onClick={handleExportCsv}
              disabled={participants.length === 0}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-300 text-white font-semibold rounded-lg transition-colors"
            >
              CSVエクスポート
            </button>
            <button
              onClick={fetchParticipants}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
            >
              更新
            </button>
          </div>
        </div>

        {/* テーブル */}
        <div className="bg-white rounded-2xl shadow overflow-hidden">
          {loading ? (
            <p className="text-center text-gray-400 py-12 text-lg">読み込み中...</p>
          ) : participants.length === 0 ? (
            <p className="text-center text-gray-400 py-12 text-lg">受付済みの参加者はいません</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-100 text-gray-600 uppercase text-xs tracking-wider">
                  <tr>
                    {["No", "名前", "所属", "学年", "学籍番号", "受付日時"].map((h) => (
                      <th key={h} className="px-4 py-3 text-left font-semibold">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {participants.map((p, i) => (
                    <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 text-gray-400">{i + 1}</td>
                      <td className="px-4 py-3 font-semibold text-gray-800">{p.name}</td>
                      <td className="px-4 py-3 text-gray-600">{p.affiliation}</td>
                      <td className="px-4 py-3 text-gray-600">{p.grade}年</td>
                      <td className="px-4 py-3 text-gray-600 font-mono">{p.studentId}</td>
                      <td className="px-4 py-3 text-gray-500">{formatDateTime(p.checkedInAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
