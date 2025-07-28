const BLOCKED_KEY = 'blocked';
// ブロック対象の URL パターン
const URL_PATTERNS = [
    '*://*.x.com/*',
    '*://*.twitter.com/*',
    '*://*.youtube.com/*',
    '*://youtu.be/*'
];

function updateStatusText(checked) {
    document.getElementById('status').textContent = checked ? '🔒 ブロック中' : '✅ 開放中';
}

document.addEventListener('DOMContentLoaded', () => {
    const toggle = document.getElementById('toggle');

    // 現在の状態を取得してトグルに反映
    chrome.storage.local.get(BLOCKED_KEY, res => {
        const isBlocked = res[BLOCKED_KEY] || false;
        toggle.checked = isBlocked;
        updateStatusText(isBlocked);
    });

    // トグル操作時
    toggle.addEventListener('change', () => {
        const isBlocked = toggle.checked;
        chrome.storage.local.set({ [BLOCKED_KEY]: isBlocked }, () => {
            updateStatusText(isBlocked);

            // 対象サイトをリロードして即時反映
            chrome.tabs.query({ url: URL_PATTERNS }, tabs => {
                for (let tab of tabs) {
                    chrome.tabs.reload(tab.id);
                }
            });
        });
    });
});
