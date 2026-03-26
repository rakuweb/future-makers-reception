import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-8">
      <div className="w-full max-w-md">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-2">
          コンテスト受付システム
        </h1>
        <p className="text-center text-gray-400 text-sm mb-10">
          各ページへのリンク
        </p>

        <div className="flex flex-col gap-4">
          <Link
            href="/register"
            className="block bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-md hover:border-blue-300 transition-all"
          >
            <div className="flex items-center gap-4">
              <span className="text-4xl">📋</span>
              <div>
                <p className="text-xl font-bold text-gray-800">登録フォーム</p>
                <p className="text-sm text-gray-500 mt-1">
                  参加者情報を入力してQRコードを生成・印刷します
                </p>
              </div>
            </div>
          </Link>

          <Link
            href="/checkin"
            className="block bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-md hover:border-green-300 transition-all"
          >
            <div className="flex items-center gap-4">
              <span className="text-4xl">📷</span>
              <div>
                <p className="text-xl font-bold text-gray-800">
                  受付チェックイン
                  <span className="ml-2 text-xs font-normal bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                    ローカル専用
                  </span>
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  QRコードをスキャンして参加者を受付登録します
                </p>
              </div>
            </div>
          </Link>

          <Link
            href="/admin"
            className="block bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-md hover:border-purple-300 transition-all"
          >
            <div className="flex items-center gap-4">
              <span className="text-4xl">📊</span>
              <div>
                <p className="text-xl font-bold text-gray-800">
                  管理画面
                  <span className="ml-2 text-xs font-normal bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">
                    ローカル専用
                  </span>
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  受付済み参加者の一覧確認とCSVエクスポート
                </p>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
