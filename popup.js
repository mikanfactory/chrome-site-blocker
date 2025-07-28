const STORAGE_KEY = 'blockedHosts';

function updateUI(isBlocked) {
    document.getElementById('status').textContent = isBlocked
        ? '🔒 ブロック中'
        : '✅ ブロック解除中';
}

// URL からホストネームを取り出す
function getDomain(url) {
    try {
        return new URL(url).hostname;
    } catch {
        return null;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const toggle = document.getElementById('toggle');
    const status = document.getElementById('status');

    // アクティブタブのドメインを取得
    chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
        const tab = tabs[0];
        const domain = getDomain(tab.url);
        if (!domain) {
            toggle.disabled = true;
            status.textContent = '無効なURL';
            return;
        }

        // ストレージからリストを取得してトグルに反映
        chrome.storage.local.get({ [STORAGE_KEY]: [] }, res => {
            const list = res[STORAGE_KEY];
            const isBlocked = list.includes(domain);
            toggle.checked = isBlocked;
            updateUI(isBlocked);
        });

        // トグル操作でリスト更新 → タブ再読み込み
        toggle.addEventListener('change', () => {
            console.log('Toggle changed:', toggle.checked);
            chrome.storage.local.get({ [STORAGE_KEY]: [] }, res => {
                console.log('Current storage:', res);
                let list = res[STORAGE_KEY];
                if (toggle.checked) {
                    // ON → リストに追加
                    if (!list.includes(domain)) list.push(domain);
                } else {
                    // OFF → リストから削除
                    list = list.filter(d => d !== domain);
                }
                chrome.storage.local.set({ [STORAGE_KEY]: list }, () => {
                    console.log('Updated storage:', list);
                    updateUI(toggle.checked);
                    chrome.tabs.reload(tab.id);
                });
            });
        });
    });
});
