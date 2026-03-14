(async function() {
    // 1. 尋找頁面上的表單
    const form = document.querySelector('form');
    if (!form) {
        alert('❌ 找不到任何表單！請確認頁面中含有 <form> 標籤。');
        return;
    }

    // 2. 建立隱藏的 iframe 防止傳統表單送出時導致頁面重新整理
    let iframe = document.getElementById('hidden-submit-frame');
    if (!iframe) {
        iframe = document.createElement('iframe');
        iframe.name = 'hidden-submit-frame';
        iframe.id = 'hidden-submit-frame';
        iframe.style.display = 'none';
        document.body.appendChild(iframe);
    }
    const originalTarget = form.target;
    form.target = 'hidden-submit-frame';

    // 3. 抓取所有需要輸入的欄位
    const inputs = Array.from(form.querySelectorAll('input:not([type="hidden"]):not([type="submit"]):not([type="button"]), textarea, select'));
    if (inputs.length === 0) {
        alert('❌ 找不到可輸入的欄位！');
        return;
    }

    // 取得欄位名稱以提示使用者
    const fieldNames = inputs.map(i => i.name || i.id || i.type || i.tagName).join(', ');
    
    // 4. 詢問要送出的次數
    const countStr = prompt(`✅ 系統自動抓取到以下欄位：\n[ ${fieldNames} ]\n\n請問需要批量送出幾次？`, '10');
    const count = parseInt(countStr, 10);
    if (isNaN(count) || count <= 0) {
        console.log('已取消批量測試。');
        form.target = originalTarget; // 復原表單行為
        return;
    }

    // 尋找送出按鈕
    const submitBtn = form.querySelector('[type="submit"], button:not([type="button"])');

    // 5. 隨機資料產生器
    const generateRandomData = (type) => {
        const randStr = Math.random().toString(36).substring(2, 8);
        switch(type) {
            case 'email': return `test_${randStr}@example.com`;
            case 'number': return Math.floor(Math.random() * 1000);
            case 'tel': return '09' + Math.floor(Math.random() * 100000000).toString().padStart(8, '0');
            case 'date': return '2026-01-01'; // 預設測試日期
            default: return `測試資料_${randStr}`;
        }
    };

    console.log(`🚀 開始執行批量送出 ${count} 次...`);

    // 6. 執行迴圈送出
    for (let i = 1; i <= count; i++) {
        // 填寫欄位
        inputs.forEach(input => {
            if (input.tagName.toLowerCase() === 'select') {
                const options = input.querySelectorAll('option');
                if(options.length > 0) {
                    const randIndex = Math.floor(Math.random() * options.length);
                    input.value = options[randIndex].value;
                }
            } else if (input.type === 'checkbox' || input.type === 'radio') {
                input.checked = Math.random() > 0.5;
            } else {
                input.value = generateRandomData(input.type);
            }
            
            // 觸發 input 與 change 事件（支援 React/Vue 等前端框架的資料雙向綁定）
            input.dispatchEvent(new Event('input', { bubbles: true }));
            input.dispatchEvent(new Event('change', { bubbles: true }));
        });

        // 點擊送出
        if (submitBtn) {
            submitBtn.click();
        } else {
            form.submit();
        }

        console.log(`✅ 第 ${i} 次送出完成。`);
        
        // 等待 800 毫秒再送下一次，避免請求過快被伺服器阻擋或瀏覽器卡死
        await new Promise(resolve => setTimeout(resolve, 800));
    }

    alert(`🎉 已完成 ${count} 次批量測試送出！`);
    form.target = originalTarget; // 執行完畢後復原
})();
