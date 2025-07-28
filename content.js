// ページ読み込み開始時に storage から状態を取得
chrome.storage.local.get('blocked', res => {
    if (res.blocked) {
        // ブロック中 → 中身を置き換え
        document.documentElement.innerHTML = `
      <div style="
        display:flex;
        justify-content:center;
        align-items:center;
        height:100vh;
        background:#f2f2f2;
        color:#333;
        font-size:24px;
        font-family:sans-serif;
        text-align:center;
      ">
        このサイトはブロックされています
      </div>`;
        // スクリプトの続行を止めたい場合
        // throw new Error('Blocked by extension');
    }
});
