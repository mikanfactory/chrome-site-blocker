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

		// デバッグログ追加
		console.log("[Site Blocker Debug] Domain:", host);
		console.log("[Site Blocker Debug] Blocked:", blocked);
		console.log("[Site Blocker Debug] timeLimitEndTime:", timeLimitEndTime);
		console.log("[Site Blocker Debug] Date.now():", Date.now());
		console.log("[Site Blocker Debug] isTimeLimitActive:", isTimeLimitActive);

		// 時間制限が終了している場合、ストレージから削除
		if (timeLimitEndTime && Date.now() >= timeLimitEndTime) {
			console.log(
				"[Site Blocker Debug] Time limit expired, removing from storage",
			);
			chrome.storage.local.remove("timeLimitEndTime");
		}

		// ブロック対象で時間制限が有効でない場合のみブロック
		console.log(
			"[Site Blocker Debug] Will block?",
			blocked && !isTimeLimitActive,
		);
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
