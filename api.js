// =============================================
// Google Sheets API 통신 함수 모음
// =============================================

// 데이터 읽기
async function getData(target) {
  try {
    const res = await fetch(`${CONFIG.API_URL}?action=read&target=${target}`);
    const data = await res.json();
    if (data.error) throw new Error(data.error);
    return data;
  } catch (err) {
    showToast('데이터를 불러오지 못했어요: ' + err.message, 'error');
    return [];
  }
}

// 데이터 추가
async function addRow(target, rowArray) {
  try {
    const res = await fetch(CONFIG.API_URL, {
      method: 'POST',
      body: JSON.stringify({ action: 'write', target, row: rowArray })
    });
    const data = await res.json();
    if (data.error) throw new Error(data.error);
    showToast('저장되었어요!', 'success');
    return data;
  } catch (err) {
    showToast('저장 실패: ' + err.message, 'error');
  }
}

// 데이터 수정
async function updateRow(target, rowIndex, rowArray) {
  try {
    const res = await fetch(CONFIG.API_URL, {
      method: 'POST',
      body: JSON.stringify({ action: 'update', target, rowIndex, row: rowArray })
    });
    const data = await res.json();
    if (data.error) throw new Error(data.error);
    showToast('수정되었어요!', 'success');
    return data;
  } catch (err) {
    showToast('수정 실패: ' + err.message, 'error');
  }
}

// 데이터 삭제
async function deleteRow(target, rowIndex) {
  try {
    const res = await fetch(CONFIG.API_URL, {
      method: 'POST',
      body: JSON.stringify({ action: 'delete', target, rowIndex })
    });
    const data = await res.json();
    if (data.error) throw new Error(data.error);
    showToast('삭제되었어요!', 'success');
    return data;
  } catch (err) {
    showToast('삭제 실패: ' + err.message, 'error');
  }
}

// 토스트 알림
function showToast(message, type = 'success') {
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.textContent = message;
  document.body.appendChild(toast);
  setTimeout(() => toast.classList.add('show'), 10);
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 300);
  }, 2500);
}
