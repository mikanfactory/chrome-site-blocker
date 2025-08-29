// Service Worker for Chrome Extension v3
console.log("[Site Blocker Background] Service Worker started");

// アラーム管理用のマップ
const timeoutAlarms = new Map();

// 拡張機能インストール時の初期化
chrome.runtime.onInstalled.addListener(() => {
	console.log("[Site Blocker Background] Extension installed");
});

// ストレージ変更の監視
chrome.storage.local.onChanged.addListener((changes) => {
	console.log("[Site Blocker Background] Storage changed:", changes);

	if (changes.timeLimitEndTime) {
		const { newValue: timeLimitEndTime } = changes.timeLimitEndTime;

		// 既存のアラームをクリア
		if (timeoutAlarms.has("timeLimit")) {
			chrome.alarms.clear("timeLimit");
			timeoutAlarms.delete("timeLimit");
		}

		if (timeLimitEndTime) {
			const delayInMinutes = Math.max(
				0.1,
				(timeLimitEndTime - Date.now()) / 60000,
			);
			console.log(
				`[Site Blocker Background] Setting alarm for ${delayInMinutes} minutes`,
			);

			chrome.alarms.create("timeLimit", {
				delayInMinutes: delayInMinutes,
			});
			timeoutAlarms.set("timeLimit", timeLimitEndTime);
		}
	}
});

// アラーム処理
chrome.alarms.onAlarm.addListener((alarm) => {
	console.log("[Site Blocker Background] Alarm fired:", alarm.name);

	if (alarm.name === "timeLimit") {
		console.log(
			"[Site Blocker Background] Time limit alarm fired, removing from storage",
		);
		chrome.storage.local.remove("timeLimitEndTime");
		timeoutAlarms.delete("timeLimit");

		// 全てのタブをリロードしてブロック解除
		chrome.tabs.query({}, (tabs) => {
			tabs.forEach((tab) => {
				if (
					tab.url &&
					!tab.url.startsWith("chrome://") &&
					!tab.url.startsWith("chrome-extension://")
				) {
					chrome.tabs.reload(tab.id);
				}
			});
		});
	}
});

// 起動時に既存の時間制限をチェック
chrome.storage.local.get({ timeLimitEndTime: null }, (res) => {
	const timeLimitEndTime = res.timeLimitEndTime;

	if (timeLimitEndTime) {
		if (Date.now() >= timeLimitEndTime) {
			// 期限切れの場合、すぐに削除
			console.log(
				"[Site Blocker Background] Found expired time limit on startup, removing",
			);
			chrome.storage.local.remove("timeLimitEndTime");
		} else {
			// まだ有効な場合、アラームを設定
			const delayInMinutes = Math.max(
				0.1,
				(timeLimitEndTime - Date.now()) / 60000,
			);
			console.log(
				`[Site Blocker Background] Found active time limit on startup, setting alarm for ${delayInMinutes} minutes`,
			);
			chrome.alarms.create("timeLimit", {
				delayInMinutes: delayInMinutes,
			});
			timeoutAlarms.set("timeLimit", timeLimitEndTime);
		}
	}
});
