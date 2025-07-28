chrome.storage.local.get({ blockedHosts: [] }, res => {
    const list = res.blockedHosts;
    const host = location.hostname;

    // ドメイン一致判定（サブドメインも含める）
    const blocked = list.some(domain =>
        host === domain || host.endsWith('.' + domain)
    );

    console.log('Blocked hosts:', list);
    console.log('Current host:', host);
    console.log('Is blocked:', blocked);

    if (blocked) {
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
