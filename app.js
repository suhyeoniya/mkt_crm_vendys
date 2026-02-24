// =============================================
// CRM 대시보드 메인 로직
// =============================================

let currentTab = 'contacts';
let currentData = [];
let editingRowIndex = null;

// 앱 초기화
function init() {
  renderTabs();
  loadTab('contacts');
}

// 탭 렌더링
function renderTabs() {
  const tabContainer = document.getElementById('tabs');
  tabContainer.innerHTML = Object.entries(SHEET_CONFIG).map(([key, cfg]) => `
    <button class="tab-btn ${key === currentTab ? 'active' : ''}" onclick="loadTab('${key}')">
      <span class="tab-icon">${cfg.icon}</span>
      <span class="tab-label">${cfg.label}</span>
    </button>
  `).join('');
}

// 탭 전환 & 데이터 로드
async function loadTab(target) {
  currentTab = target;
  currentData = [];
  editingRowIndex = null;

  // 탭 활성화 표시
  document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
  document.querySelectorAll('.tab-btn').forEach(btn => {
    if (btn.textContent.includes(SHEET_CONFIG[target].icon)) btn.classList.add('active');
  });
  renderTabs();

  // 헤더 업데이트
  document.getElementById('tab-title').textContent = SHEET_CONFIG[target].icon + ' ' + SHEET_CONFIG[target].label;

  // 로딩 표시
  document.getElementById('content-area').innerHTML = `
    <div class="loading">
      <div class="spinner"></div>
      <p>데이터 불러오는 중...</p>
    </div>
  `;

  currentData = await getData(target);
  renderTable();
}

// 테이블 렌더링
function renderTable(filterText = '') {
  const cfg = SHEET_CONFIG[currentTab];
  const cols = cfg.columns;

  let filtered = currentData;
  if (filterText) {
    const q = filterText.toLowerCase();
    filtered = currentData.filter(row =>
      cols.some(col => String(row[col] || '').toLowerCase().includes(q))
    );
  }

  if (!filtered.length) {
    document.getElementById('content-area').innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">${cfg.icon}</div>
        <p>데이터가 없어요</p>
        <button class="btn btn-primary" onclick="openModal()">+ 첫 번째 데이터 추가</button>
      </div>
    `;
    document.getElementById('row-count').textContent = '0개';
    return;
  }

  document.getElementById('row-count').textContent = `${filtered.length}개`;

  document.getElementById('content-area').innerHTML = `
    <div class="table-wrap">
      <table class="crm-table">
        <thead>
          <tr>
            ${cols.map(col => `<th>${col}</th>`).join('')}
            <th class="action-col">관리</th>
          </tr>
        </thead>
        <tbody>
          ${filtered.map(row => `
            <tr>
              ${cols.map(col => `<td title="${row[col] || ''}">${row[col] || '-'}</td>`).join('')}
              <td class="action-col">
                <button class="btn-icon edit" onclick="openModal(${row._rowIndex})" title="수정">✏️</button>
                <button class="btn-icon del" onclick="confirmDelete(${row._rowIndex})" title="삭제">🗑️</button>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;
}

// 검색
function handleSearch(e) {
  renderTable(e.target.value);
}

// 모달 열기 (추가 or 수정)
function openModal(rowIndex = null) {
  const cfg = SHEET_CONFIG[currentTab];
  editingRowIndex = rowIndex;

  const existingRow = rowIndex
    ? currentData.find(r => r._rowIndex === rowIndex)
    : null;

  document.getElementById('modal-title').textContent = rowIndex ? '데이터 수정' : '새 데이터 추가';

  document.getElementById('modal-form').innerHTML = cfg.columns.map(col => `
    <div class="form-group">
      <label>${col}</label>
      <input type="text" name="${col}" value="${existingRow ? (existingRow[col] || '') : ''}" placeholder="${col} 입력" />
    </div>
  `).join('');

  document.getElementById('modal').classList.add('open');
}

// 모달 닫기
function closeModal() {
  document.getElementById('modal').classList.remove('open');
  editingRowIndex = null;
}

// 폼 저장
async function saveForm() {
  const cfg = SHEET_CONFIG[currentTab];
  const form = document.getElementById('modal-form');
  const inputs = form.querySelectorAll('input');
  const rowArray = cfg.columns.map((col, i) => inputs[i].value);

  if (editingRowIndex) {
    await updateRow(currentTab, editingRowIndex, rowArray);
  } else {
    await addRow(currentTab, rowArray);
  }

  closeModal();
  loadTab(currentTab);
}

// 삭제 확인
function confirmDelete(rowIndex) {
  if (confirm('정말 삭제할까요?')) {
    deleteRow(currentTab, rowIndex).then(() => loadTab(currentTab));
  }
}

// 모달 외부 클릭 시 닫기
document.getElementById('modal').addEventListener('click', function(e) {
  if (e.target === this) closeModal();
});

// 앱 시작
init();
