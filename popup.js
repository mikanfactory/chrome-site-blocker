const STORAGE_KEY = 'blockedHosts';
const TIME_LIMIT_KEY = 'timeLimitEndTime';

function updateUI(isBlocked) {
    document.getElementById('status').textContent = isBlocked
        ? '🔒 ブロック中'
        : '✅ ブロック解除中';
}

function updateTimeLimitUI(isActive, endTime) {
    const timeStatus = document.getElementById('timeStatus');
    const timeLimitToggle = document.getElementById('timeLimit');
    
    if (isActive && endTime) {
        const remaining = Math.max(0, Math.ceil((endTime - Date.now()) / 1000));
        const minutes = Math.floor(remaining / 60);
        const seconds = remaining % 60;
        timeStatus.textContent = `残り時間: ${minutes}:${seconds.toString().padStart(2, '0')}`;
        timeLimitToggle.checked = true;
    } else {
        timeStatus.textContent = '';
        timeLimitToggle.checked = false;
    }
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
    const timeLimitToggle = document.getElementById('timeLimit');
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
        chrome.storage.local.get({ [STORAGE_KEY]: [], [TIME_LIMIT_KEY]: null }, res => {
            const list = res[STORAGE_KEY];
            const isBlocked = list.includes(domain);
            const timeLimitEndTime = res[TIME_LIMIT_KEY];
            const isTimeLimitActive = timeLimitEndTime && Date.now() < timeLimitEndTime;
            
            toggle.checked = isBlocked;
            updateUI(isBlocked);
            updateTimeLimitUI(isTimeLimitActive, timeLimitEndTime);
            
            // 時間制限が有効な場合、定期的にUI更新
            if (isTimeLimitActive) {
                const interval = setInterval(() => {
                    const remaining = timeLimitEndTime - Date.now();
                    if (remaining <= 0) {
                        clearInterval(interval);
                        chrome.storage.local.remove(TIME_LIMIT_KEY);
                        updateTimeLimitUI(false);
                    } else {
                        updateTimeLimitUI(true, timeLimitEndTime);
                    }
                }, 1000);
            }
        });

        // ブロックトグル操作でリスト更新 → タブ再読み込み
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
        
        // 時間制限トグル操作
        timeLimitToggle.addEventListener('change', () => {
            if (timeLimitToggle.checked) {
                // 5分後の時刻を設定
                const endTime = Date.now() + (5 * 60 * 1000);
                chrome.storage.local.set({ [TIME_LIMIT_KEY]: endTime }, () => {
                    updateTimeLimitUI(true, endTime);
                    chrome.tabs.reload(tab.id);
                    
                    // 定期的にUI更新
                    const interval = setInterval(() => {
                        const remaining = endTime - Date.now();
                        if (remaining <= 0) {
                            clearInterval(interval);
                            chrome.storage.local.remove(TIME_LIMIT_KEY);
                            updateTimeLimitUI(false);
                            chrome.tabs.reload(tab.id);
                        } else {
                            updateTimeLimitUI(true, endTime);
                        }
                    }, 1000);
                });
            } else {
                // 時間制限を無効化
                chrome.storage.local.remove(TIME_LIMIT_KEY, () => {
                    updateTimeLimitUI(false);
                    chrome.tabs.reload(tab.id);
                });
            }
        });
    });
});
