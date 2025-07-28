chrome.storage.local.get(
	{
		blockedHosts: [],
		timeLimitEndTime: null,
		extensionEnabled: true,
	},
	(res) => {
		const list = res.blockedHosts;
		const timeLimitEndTime = res.timeLimitEndTime;
		const extensionEnabled = res.extensionEnabled;
		const host = location.hostname;

		// 拡張機能が無効な場合は何もしない
		if (!extensionEnabled) {
			return;
		}

		// ドメイン一致判定（サブドメインも含める）
		const blocked = list.some(
			(domain) => host === domain || host.endsWith(`.${domain}`),
		);

		// 時間制限チェック
		const isTimeLimitActive = timeLimitEndTime && Date.now() < timeLimitEndTime;

		// 時間制限が終了している場合、ストレージから削除
		if (timeLimitEndTime && Date.now() >= timeLimitEndTime) {
			chrome.storage.local.remove("timeLimitEndTime");
		}

		// ブロック対象で時間制限が有効でない場合のみブロック
		if (blocked && !isTimeLimitActive) {
			document.documentElement.innerHTML = `
      <div style="
        display:flex;
        justify-content:center;
        align-items:center;
        height:100vh;
        background:#fafafa;
        color:#333;
        font-size:24px;
        font-family:sans-serif;
        text-align:center;
      ">
        このサイトはブロックされています
      </div>`;
		}
	},
);
