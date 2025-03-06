const urlParams = new URLSearchParams(window.location.search);
const itemId = urlParams.get('item_id');

// 让整个页面不渲染任何内容
if (!itemId || itemId === "xxx") {
    document.documentElement.innerHTML = "";
}
