import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';

const STORAGE_KEY = 'blockedHosts';

function App() {
    const [domain, setDomain] = useState<string|null>(null);
    const [list, setList] = useState<string[]>([]);
    const isBlocked = domain ? list.includes(domain) : false;

    useEffect(() => {
        // アクティブタブのドメイン取得
        chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
            const host = new URL(tab.url!).hostname;
            setDomain(host);
        });
        // ストレージ読み込み
        chrome.storage.local.get({ [STORAGE_KEY]: [] }, res => {
            setList(res[STORAGE_KEY]);
        });
    }, []);

    const toggle = () => {
        if (!domain) return;
        const next = isBlocked
            ? list.filter(d => d !== domain)
            : [...list, domain];
        chrome.storage.local.set({ [STORAGE_KEY]: next }, () => {
            setList(next);
            chrome.tabs.reload();
        });
    };

    if (!domain) return <div>無効なURLです</div>;
    return (
        <div style={{ padding: 12, fontFamily: 'sans-serif' }}>
            <label style={{ display: 'flex', alignItems: 'center' }}>
                <input
                    type="checkbox"
                    checked={isBlocked}
                    onChange={toggle}
                    style={{ marginRight: 8 }}
                />
                {isBlocked ? '🔒 ブロック中' : '✅ ブロック解除中'}
            </label>
        </div>
    );
}

const container = document.getElementById('root')!;
createRoot(container).render(<App />);
