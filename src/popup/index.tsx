import type React from "react";
import { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import styles from "./styles.module.css";

const STORAGE_KEY = "blockedHosts";
const TIME_LIMIT_KEY = "timeLimitEndTime";
const ENABLED_KEY = "extensionEnabled";
const TIME_SECONDS_KEY = "timeSeconds";

// スライダースイッチコンポーネント
const Toggle = ({
	checked,
	onChange,
	disabled = false,
}: {
	checked: boolean;
	onChange: () => void;
	disabled?: boolean;
}) => (
	<button
		type="button"
		className={styles.toggle}
		data-checked={checked}
		data-disabled={disabled}
		onClick={disabled ? undefined : onChange}
		disabled={disabled}
		aria-label={checked ? "オン" : "オフ"}
	>
		<div className={styles.toggleKnob} />
	</button>
);

function App() {
	const [domain, setDomain] = useState<string | null>(null);
	const [list, setList] = useState<string[]>([]);
	const [timeLimitEndTime, setTimeLimitEndTime] = useState<number | null>(null);
	const [extensionEnabled, setExtensionEnabled] = useState(true);
	const [timeSeconds, setTimeSeconds] = useState(30);

	const isBlocked = domain ? list.includes(domain) : false;
	const isTimeLimitActive = timeLimitEndTime && Date.now() < timeLimitEndTime;

	useEffect(() => {
		// アクティブタブのドメイン取得
		chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
			if (!tab.url) return;
			const host = new URL(tab.url).hostname;
			setDomain(host);
		});

		// ストレージ読み込み
		chrome.storage.local.get(
			{
				[STORAGE_KEY]: [],
				[TIME_LIMIT_KEY]: null,
				[ENABLED_KEY]: true,
				[TIME_SECONDS_KEY]: 30,
			},
			(res) => {
				setList(res[STORAGE_KEY]);
				setExtensionEnabled(res[ENABLED_KEY]);
				setTimeSeconds(res[TIME_SECONDS_KEY]);

				const endTime = res[TIME_LIMIT_KEY];

				// 時間制限が終了している場合、ストレージから削除
				if (endTime && Date.now() >= endTime) {
					chrome.storage.local.remove(TIME_LIMIT_KEY);
					setTimeLimitEndTime(null);
				} else {
					setTimeLimitEndTime(endTime);
				}
			},
		);
	}, []);

	// 時間制限の自動更新
	useEffect(() => {
		if (!timeLimitEndTime) return;

		const interval = setInterval(() => {
			if (Date.now() >= timeLimitEndTime) {
				chrome.storage.local.remove(TIME_LIMIT_KEY);
				setTimeLimitEndTime(null);
				chrome.tabs.reload();
				clearInterval(interval);
			}
		}, 1000);

		return () => clearInterval(interval);
	}, [timeLimitEndTime]);

	const toggleExtension = () => {
		const newEnabled = !extensionEnabled;
		chrome.storage.local.set({ [ENABLED_KEY]: newEnabled }, () => {
			setExtensionEnabled(newEnabled);
			chrome.tabs.reload();
		});
	};

	const toggleBlocked = () => {
		if (!domain || !extensionEnabled) return;
		const next = isBlocked
			? list.filter((d) => d !== domain)
			: [...list, domain];
		chrome.storage.local.set({ [STORAGE_KEY]: next }, () => {
			setList(next);
			chrome.tabs.reload();
		});
	};

	const toggleTimeLimit = () => {
		if (!extensionEnabled) return;
		const nextEndTime = isTimeLimitActive
			? null
			: Date.now() + timeSeconds * 1000;
		chrome.storage.local.set({ [TIME_LIMIT_KEY]: nextEndTime }, () => {
			setTimeLimitEndTime(nextEndTime);
			chrome.tabs.reload();
		});
	};

	const handleTimeSecondsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const seconds = Math.max(1, Math.min(86400, parseInt(e.target.value) || 1));
		setTimeSeconds(seconds);
		chrome.storage.local.set({ [TIME_SECONDS_KEY]: seconds });
	};

	if (!domain)
		return (
			<div className={styles.container}>
				<div className={styles.error}>無効なURLです</div>
			</div>
		);

	return (
		<div className={styles.container}>
			{/* ヘッダー */}
			<div className={styles.header}>
				<h1 className={styles.title}>Simple Site Blocker</h1>
				<div className={styles.row}>
					<span className={styles.label}>Enabled</span>
					<Toggle checked={extensionEnabled} onChange={toggleExtension} />
				</div>
			</div>

			{/* 時間設定セクション */}
			<div className={styles.section}>
				<div className={styles.row}>
					<input
						type="number"
						min="1"
						max="86400"
						value={timeSeconds}
						onChange={handleTimeSecondsChange}
						className={styles.input}
						disabled={!extensionEnabled}
					/>
					<div className={styles.timeUnit}>
						<span className={styles.label}>Sec</span>
					</div>
					<Toggle
						checked={isTimeLimitActive}
						onChange={toggleTimeLimit}
						disabled={!extensionEnabled}
					/>
				</div>
			</div>

			{/* 区切り線 */}
			<div className={styles.divider} />

			{/* 現在のサイト情報 */}
			<div className={styles.section}>
				<div className={styles.domainInfo}>
					<div className={styles.sectionTitle}>Current Site</div>
					<div className={styles.domain}>
						<span className={styles.domainIcon}>🌐</span>
						{domain}
					</div>
				</div>
				<div className={styles.row}>
					<span className={styles.label}>Blocked</span>
					<Toggle
						checked={isBlocked}
						onChange={toggleBlocked}
						disabled={!extensionEnabled}
					/>
				</div>
			</div>
		</div>
	);
}

const container = document.getElementById("root");
if (!container) throw new Error("Root element not found");
createRoot(container).render(<App />);
