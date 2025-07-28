chrome.storage.local.get({ blockedHosts: [], timeLimitEndTime: null }, res => {
    const list = res.blockedHosts;
    const timeLimitEndTime = res.timeLimitEndTime;
    const host = location.hostname;

    // ドメイン一致判定（サブドメインも含める）
    const blocked = list.some(domain =>
        host === domain || host.endsWith('.' + domain)
    );

    // 時間制限チェック
    const isTimeLimitActive = timeLimitEndTime && Date.now() < timeLimitEndTime;

    console.log('Blocked hosts:', list);
    console.log('Current host:', host);
    console.log('Is blocked:', blocked);
    console.log('Time limit active:', isTimeLimitActive);
    console.log('Time limit end:', timeLimitEndTime ? new Date(timeLimitEndTime) : null);

    // ブロック対象かつ時間制限が有効でない場合のみブロック
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
});
