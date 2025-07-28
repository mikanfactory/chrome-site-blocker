import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';

const STORAGE_KEY = 'blockedHosts';
const TIME_LIMIT_KEY = 'timeLimitEndTime';
const ENABLED_KEY = 'extensionEnabled';
const TIME_MINUTES_KEY = 'timeMinutes';

// スライダースイッチコンポーネント
const Toggle = ({ checked, onChange, disabled = false }: {
    checked: boolean;
    onChange: () => void;
    disabled?: boolean;
}) => (
    <div
        onClick={disabled ? undefined : onChange}
        style={{
            width: 44,
            height: 24,
            borderRadius: 12,
            background: checked ? '#007AFF' : '#E5E5EA',
            position: 'relative',
            cursor: disabled ? 'not-allowed' : 'pointer',
            transition: 'all 0.3s ease',
            opacity: disabled ? 0.5 : 1,
        }}
    >
        <div
            style={{
                width: 20,
                height: 20,
                borderRadius: 10,
                background: 'white',
                position: 'absolute',
                top: 2,
                left: checked ? 22 : 2,
                transition: 'all 0.3s ease',
                boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
            }}
        />
    </div>
);

function App() {
    const [domain, setDomain] = useState<string|null>(null);
    const [list, setList] = useState<string[]>([]);
    const [timeLimitEndTime, setTimeLimitEndTime] = useState<number|null>(null);
    const [extensionEnabled, setExtensionEnabled] = useState(true);
    const [timeMinutes, setTimeMinutes] = useState(5);

    const isBlocked = domain ? list.includes(domain) : false;
    const isTimeLimitActive = timeLimitEndTime && Date.now() < timeLimitEndTime;

    useEffect(() => {
        // アクティブタブのドメイン取得
        chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
            const host = new URL(tab.url!).hostname;
            setDomain(host);
        });

        // ストレージ読み込み
        chrome.storage.local.get({
            [STORAGE_KEY]: [],
            [TIME_LIMIT_KEY]: null,
            [ENABLED_KEY]: true,
            [TIME_MINUTES_KEY]: 5
        }, res => {
            setList(res[STORAGE_KEY]);
            setExtensionEnabled(res[ENABLED_KEY]);
            setTimeMinutes(res[TIME_MINUTES_KEY]);

            const endTime = res[TIME_LIMIT_KEY];

            // 時間制限が終了している場合、ストレージから削除
            if (endTime && Date.now() >= endTime) {
                chrome.storage.local.remove(TIME_LIMIT_KEY);
                setTimeLimitEndTime(null);
            } else {
                setTimeLimitEndTime(endTime);
            }
        });
    }, []);

    // 時間制限の自動更新
    useEffect(() => {
        if (!timeLimitEndTime) return;

        const interval = setInterval(() => {
            if (Date.now() >= timeLimitEndTime) {
                chrome.storage.local.remove(TIME_LIMIT_KEY);
                setTimeLimitEndTime(null);
                clearInterval(interval);
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [timeLimitEndTime]);

    const toggleExtension = () => {
        const newEnabled = !extensionEnabled;
        chrome.storage.local.set({ [ENABLED_KEY]: newEnabled }, () => {
            setExtensionEnabled(newEnabled);
        });
    };

    const toggleBlocked = () => {
        if (!domain || !extensionEnabled) return;
        const next = isBlocked
            ? list.filter(d => d !== domain)
            : [...list, domain];
        chrome.storage.local.set({ [STORAGE_KEY]: next }, () => {
            setList(next);
            chrome.tabs.reload();
        });
    };

    const toggleTimeLimit = () => {
        if (!extensionEnabled) return;
        const nextEndTime = isTimeLimitActive ? null : Date.now() + timeMinutes * 60 * 1000;
        chrome.storage.local.set({ [TIME_LIMIT_KEY]: nextEndTime }, () => {
            setTimeLimitEndTime(nextEndTime);
            chrome.tabs.reload();
        });
    };

    const handleTimeMinutesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const minutes = Math.max(1, Math.min(1440, parseInt(e.target.value) || 1));
        setTimeMinutes(minutes);
        chrome.storage.local.set({ [TIME_MINUTES_KEY]: minutes });
    };

    if (!domain) return (
        <div style={containerStyle}>
            <div style={{ color: '#666', textAlign: 'center' }}>無効なURLです</div>
        </div>
    );

    return (
        <div style={containerStyle}>
            {/* ヘッダー */}
            <div style={headerStyle}>
                <h1 style={titleStyle}>Simple Site Blocker</h1>
                <div style={rowStyle}>
                    <span style={labelStyle}>Enabled</span>
                    <Toggle checked={extensionEnabled} onChange={toggleExtension} />
                </div>
            </div>

            {/* 時間設定セクション */}
            <div style={sectionStyle}>
                <div style={rowStyle}>
                    <input
                        type="number"
                        min="1"
                        max="1440"
                        value={timeMinutes}
                        onChange={handleTimeMinutesChange}
                        style={inputStyle}
                        disabled={!extensionEnabled}
                    />
                    <div style={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <span style={{ fontSize: 18 }}></span>
                        <span style={labelStyle}>Min</span>
                    </div>
                    <Toggle
                        checked={isTimeLimitActive}
                        onChange={toggleTimeLimit}
                        disabled={!extensionEnabled}
                    />
                </div>
            </div>

            {/* 区切り線 */}
            <div style={dividerStyle} />

            {/* 現在のサイト情報 */}
            <div style={sectionStyle}>
                <div style={{ marginBottom: 12 }}>
                    <div style={sectionTitleStyle}>Current Site</div>
                    <div style={domainStyle}>
                        <span style={{ fontSize: 16, marginRight: 8 }}>🌐</span>
                        {domain}
                    </div>
                </div>
                <div style={rowStyle}>
                    <span style={labelStyle}>Blocked</span>
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

// スタイル定義
const containerStyle: React.CSSProperties = {
    width: 400,
    padding: 20,
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    background: 'white',
    color: '#333',
    fontSize: 14,
};

const headerStyle: React.CSSProperties = {
    marginBottom: 20,
};

const titleStyle: React.CSSProperties = {
    fontSize: 20,
    fontWeight: 600,
    margin: '0 0 16px 0',
    color: '#1D1D1F',
};

const sectionStyle: React.CSSProperties = {
    marginBottom: 16,
};

const rowStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
};

const labelStyle: React.CSSProperties = {
    fontSize: 16,
    color: '#1D1D1F',
    fontWeight: 400,
};

const sectionTitleStyle: React.CSSProperties = {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 4,
    fontWeight: 500,
};

const domainStyle: React.CSSProperties = {
    fontSize: 16,
    color: '#1D1D1F',
    fontWeight: 500,
    display: 'flex',
    alignItems: 'center',
    marginBottom: 12,
};

const inputStyle: React.CSSProperties = {
    width: 60,
    height: 32,
    border: '1px solid #D1D1D6',
    borderRadius: 6,
    textAlign: 'center',
    fontSize: 16,
    fontWeight: 500,
    outline: 'none',
};

const dividerStyle: React.CSSProperties = {
    height: 1,
    background: '#E5E5EA',
    margin: '20px 0',
};

const container = document.getElementById('root')!;
createRoot(container).render(<App />);
