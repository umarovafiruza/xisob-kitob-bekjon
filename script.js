/**
 * ==========================================================
 * Oila Xarajatlari (Expense Tracker)
 * Toza JavaScript: Oyma-oy ko'rish, Kirim/Chiqim, Tezkor shablonlar
 * ==========================================================
 */

// 1. O'zgarmaslar va asosiy kategoriyalar ro'yxati
const STORAGE_KEY = 'oila_xarajatlari_v1';
const BUDGET_STORAGE_KEY = 'oila_budjeti_summa_v1';

// Chiqim kategoriyalari
const EXPENSE_CATEGORIES = [
  { id: 'rozgor', name: 'Ro‘zg‘or', dotClass: 'cat-dot-rozgor' },
  { id: 'talim', name: 'Ta’lim', dotClass: 'cat-dot-talim' },
  { id: 'transport', name: 'Transport', dotClass: 'cat-dot-transport' },
  { id: 'kitob', name: 'Kitob/O‘quv qurollari', dotClass: 'cat-dot-kitob' },
  { id: 'kredit', name: 'Kredit/Qarz', dotClass: 'cat-dot-kredit' },
  { id: 'boshqa', name: 'Boshqa', dotClass: 'cat-dot-boshqa' }
];

// Kirim kategoriyalari
const INCOME_CATEGORIES = [
  { id: 'oylik', name: 'Oylik maosh', dotClass: 'cat-dot-rozgor' },
  { id: 'pensiya', name: 'Pensiya', dotClass: 'cat-dot-talim' },
  { id: 'savdo', name: 'Savdo/Biznes', dotClass: 'cat-dot-transport' },
  { id: 'qoshimcha', name: 'Qo‘shimcha daromad', dotClass: 'cat-dot-kitob' },
  { id: 'sovga', name: 'Sovg‘a/Yordam', dotClass: 'cat-dot-boshqa' },
  { id: 'boshqa_kirim', name: 'Boshqa kirim', dotClass: 'cat-dot-boshqa' }
];

// Tezkor shablonlar (Ota-onalar uchun 1 bosishda to'ldirish)
const QUICK_TEMPLATES = {
  expense: [
    { label: '🥖 Non', name: 'Non', category: 'Ro‘zg‘or' },
    { label: '🥩 Go‘sht', name: 'Go‘sht', category: 'Ro‘zg‘or' },
    { label: '🛒 Bozorlik', name: 'Bozorlik', category: 'Ro‘zg‘or' },
    { label: '💡 Svet/Gaz/Suv', name: 'Kommunal to‘lovlar', category: 'Ro‘zg‘or' },
    { label: '💊 Dorixona', name: 'Dorixona', category: 'Ro‘zg‘or' },
    { label: '🚕 Yo‘l kira', name: 'Yo‘l kira (Taksi/Avtobus)', category: 'Transport' }
  ],
  income: [
    { label: '💵 Oylik maosh', name: 'Oylik maosh', category: 'Oylik maosh' },
    { label: '🧓 Pensiya', name: 'Pensiya puli', category: 'Pensiya' },
    { label: '💼 Savdo/Biznes', name: 'Savdo tushumi', category: 'Savdo/Biznes' },
    { label: '🎁 Sovg‘a/Yordam', name: 'Sovg‘a yoki yordam', category: 'Sovg‘a/Yordam' }
  ]
};

// 2. Dastlabki demo ma'lumotlar
const INITIAL_DEMO_EXPENSES = [
  {
    id: 'demo-inc-1',
    type: 'income',
    name: 'Oylik maosh',
    amount: 5000000,
    category: 'Oylik maosh',
    date: new Date(Date.now() - 3600000 * 24 * 3).toISOString()
  },
  {
    id: 'demo-exp-1',
    type: 'expense',
    name: 'Bozorlik (Go‘sht va mahsulotlar)',
    amount: 420000,
    category: 'Ro‘zg‘or',
    date: new Date(Date.now() - 3600000 * 2).toISOString()
  },
  {
    id: 'demo-exp-2',
    type: 'expense',
    name: 'Ingliz tili kursi',
    amount: 250000,
    category: 'Ta’lim',
    date: new Date(Date.now() - 3600000 * 24).toISOString()
  },
  {
    id: 'demo-exp-3',
    type: 'expense',
    name: 'Kitob va konselyariya buyumlari',
    amount: 95000,
    category: 'Kitob/O‘quv qurollari',
    date: new Date(Date.now() - 3600000 * 48).toISOString()
  }
];

// Oylar ro'yxati (o'zbek tilida)
const MONTHS_UZ = [
  'Yanvar', 'Fevral', 'Mart', 'Aprel', 'May', 'Iyun',
  'Iyul', 'Avgust', 'Sentabr', 'Oktabr', 'Noyabr', 'Dekabr'
];

// 3. Ilova holati (State)
let expenses = [];
let familyBudget = 3000000; // Boshlang'ich byudjet
let currentTab = 'tab-home';
let currentTransactionType = 'expense'; // 'expense' yoki 'income'
let historyFilter = 'all'; // 'all', 'expense', 'income'

// Tanlangan oy va yil
let selectedYear = new Date().getFullYear();
let selectedMonth = new Date().getMonth(); // 0 - 11

// 4. DOM elementlarini qabul qilish
const totalAmountEl = document.getElementById('total-amount');
const totalCountEl = document.getElementById('total-count');
const categoriesGridEl = document.getElementById('categories-grid');
const expenseListEl = document.getElementById('expense-list');
const recentExpenseListEl = document.getElementById('recent-expense-list');
const emptyStateEl = document.getElementById('empty-state');
const listCountBadgeEl = document.getElementById('list-count-badge');
const desktopHistoryBadgeEl = document.getElementById('desktop-history-badge');
const navHistoryBadgeEl = document.getElementById('nav-history-badge');
const currentDateEl = document.getElementById('current-date');

// Oylik navigatsiya elementlari
const prevMonthBtn = document.getElementById('prev-month-btn');
const nextMonthBtn = document.getElementById('next-month-btn');
const currentMonthDisplayEl = document.getElementById('current-month-display');
const todayMonthBtn = document.getElementById('today-month-btn');
const historyMonthSubtitleEl = document.getElementById('history-month-subtitle');

// Byudjet DOM elementlari
const budgetAmountEl = document.getElementById('budget-amount');
const budgetStatusSubEl = document.getElementById('budget-status-sub');
const remainingAmountEl = document.getElementById('remaining-amount');
const remainingPercentageEl = document.getElementById('remaining-percentage');
const budgetProgressFillEl = document.getElementById('budget-progress-fill');
const progressSpentTextEl = document.getElementById('progress-spent-text');
const progressRemainingTextEl = document.getElementById('progress-remaining-text');
const openBudgetModalBtn = document.getElementById('open-budget-modal-btn');
const closeBudgetModalBtn = document.getElementById('close-budget-modal-btn');
const cancelBudgetBtn = document.getElementById('cancel-budget-btn');
const budgetModal = document.getElementById('budget-modal');
const budgetForm = document.getElementById('budget-form');
const budgetInput = document.getElementById('budget-input');

// Forma elementlari
const expenseForm = document.getElementById('expense-form');
const expenseNameInput = document.getElementById('expense-name');
const expenseAmountInput = document.getElementById('expense-amount');
const expenseCategorySelect = document.getElementById('expense-category');
const quickChipsContainer = document.getElementById('quick-chips-container');
const typeExpenseBtn = document.getElementById('type-expense-btn');
const typeIncomeBtn = document.getElementById('type-income-btn');
const formHeadingTitle = document.getElementById('form-heading-title');
const formHeadingDesc = document.getElementById('form-heading-desc');
const labelName = document.getElementById('label-name');
const addBtn = document.getElementById('add-btn');

// Toast elementlari
const toastEl = document.getElementById('toast');
const toastMessageEl = document.getElementById('toast-message');

/**
 * Pul miqdorini o'zbek so'mi formatiga o'tkazish
 * Masalan: 765000 -> "765 000 so‘m"
 */
function formatCurrency(amount) {
  const rounded = Math.round(Number(amount) || 0);
  const formattedNumber = rounded.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  return `${formattedNumber} so‘m`;
}

/**
 * Sanani o'zbekcha qisqa formatda ko'rsatish
 * Masalan: "29-sentabr, 14:30"
 */
function formatDate(isoString) {
  if (!isoString) return '';
  const date = new Date(isoString);
  const day = date.getDate();
  const month = MONTHS_UZ[date.getMonth()].toLowerCase();
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');

  return `${day}-${month}, ${hours}:${minutes}`;
}

/**
 * Bugungi sanani sarlavhaga chiqarish
 */
function displayHeaderDate() {
  const now = new Date();
  const weekdaysUz = [
    'Yakshanba', 'Dushanba', 'Seshanba', 'Chorshanba', 'Payshanba', 'Juma', 'Shanba'
  ];

  const weekday = weekdaysUz[now.getDay()];
  const day = now.getDate();
  const month = MONTHS_UZ[now.getMonth()].toLowerCase();
  const year = now.getFullYear();

  if (currentDateEl) {
    currentDateEl.textContent = `${weekday}, ${day}-${month}, ${year}-yil`;
  }
}

/**
 * Oylik navigatsiya ko'rinishini yangilash
 */
function updateMonthDisplay() {
  const now = new Date();
  const isCurrentMonth = (now.getFullYear() === selectedYear && now.getMonth() === selectedMonth);

  if (currentMonthDisplayEl) {
    currentMonthDisplayEl.textContent = `${MONTHS_UZ[selectedMonth]} ${selectedYear}`;
  }

  if (historyMonthSubtitleEl) {
    historyMonthSubtitleEl.textContent = `${MONTHS_UZ[selectedMonth]} ${selectedYear} oyi uchun hisobot`;
  }

  // Agar hozirgi oyda bo'lmasa, "Hozirgi oy" tugmasini ko'rsatamiz
  if (todayMonthBtn) {
    if (isCurrentMonth) {
      todayMonthBtn.classList.add('hidden');
    } else {
      todayMonthBtn.classList.remove('hidden');
    }
  }
}

function prevMonth() {
  if (selectedMonth === 0) {
    selectedMonth = 11;
    selectedYear -= 1;
  } else {
    selectedMonth -= 1;
  }
  updateMonthDisplay();
  render();
}

function nextMonth() {
  if (selectedMonth === 11) {
    selectedMonth = 0;
    selectedYear += 1;
  } else {
    selectedMonth += 1;
  }
  updateMonthDisplay();
  render();
}

function goToCurrentMonth() {
  const now = new Date();
  selectedYear = now.getFullYear();
  selectedMonth = now.getMonth();
  updateMonthDisplay();
  render();
}

/**
 * Amaliyot turini o'zgartirish (Kirim yoki Chiqim)
 */
function setTransactionType(type) {
  currentTransactionType = type;

  if (type === 'income') {
    typeIncomeBtn.classList.add('active');
    typeExpenseBtn.classList.remove('active');
    formHeadingTitle.textContent = 'Yangi kirim (daromad) kiritish';
    formHeadingDesc.textContent = 'Oila byudjetiga qo‘shiladigan pul summasini yozing';
    labelName.textContent = 'Kirim nomi / Manbasi';
    expenseNameInput.placeholder = 'Masalan: Oylik maosh, Pensiya, Savdo tushumi...';
    addBtn.textContent = 'Kirimni saqlash';
    addBtn.classList.add('income-mode');
  } else {
    typeExpenseBtn.classList.add('active');
    typeIncomeBtn.classList.remove('active');
    formHeadingTitle.textContent = 'Yangi xarajat kiritish';
    formHeadingDesc.textContent = 'Oila xarajati summasi va toifasini belgilang';
    labelName.textContent = 'Xarajat nomi';
    expenseNameInput.placeholder = 'Masalan: Bozorlik, Go‘sht, Dorixona...';
    addBtn.textContent = 'Xarajatni saqlash';
    addBtn.classList.remove('income-mode');
  }

  updateCategorySelect();
  renderQuickChips();
}

window.setTransactionType = setTransactionType;

/**
 * Kategoriyalar Select ro'yxatini yangilash
 */
function updateCategorySelect() {
  const cats = (currentTransactionType === 'income') ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
  expenseCategorySelect.innerHTML = cats.map(cat => 
    `<option value="${escapeHtml(cat.name)}">${escapeHtml(cat.name)}</option>`
  ).join('');
}

/**
 * Tezkor shablon tugmalarini chizish
 */
function renderQuickChips() {
  const templates = QUICK_TEMPLATES[currentTransactionType] || [];
  quickChipsContainer.innerHTML = templates.map((t, idx) => `
    <button type="button" class="chip-btn" onclick="applyTemplate(${idx})">
      ${escapeHtml(t.label)}
    </button>
  `).join('');
}

/**
 * Tezkor shablonni forma maydonlariga qo'yish
 */
function applyTemplate(index) {
  const templates = QUICK_TEMPLATES[currentTransactionType] || [];
  const t = templates[index];
  if (!t) return;

  expenseNameInput.value = t.name;
  expenseCategorySelect.value = t.category;
  expenseAmountInput.focus();
}

window.applyTemplate = applyTemplate;

/**
 * Tarix sahifasida filtrlash (Barchasi, Chiqimlar, Kirimlar)
 */
function setHistoryFilter(filter) {
  historyFilter = filter;
  document.querySelectorAll('.filter-chip').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.filter === filter);
  });
  renderHistoryList();
}

window.setHistoryFilter = setHistoryFilter;

/**
 * localStorage dan xarajatlarni yuklash
 */
function loadExpenses() {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored !== null) {
    try {
      expenses = JSON.parse(stored) || [];
      // Eski formatdagi elementlarga 'expense' turini biriktiramiz
      expenses.forEach(item => {
        if (!item.type) item.type = 'expense';
      });
    } catch (e) {
      console.error("Xotiradan o'qishda xatolik:", e);
      expenses = [];
    }
  } else {
    expenses = [...INITIAL_DEMO_EXPENSES];
    saveExpenses();
  }
}

/**
 * Xarajatlarni localStorage ga saqlash
 */
function saveExpenses() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(expenses));
  } catch (e) {
    console.error("Xotiraga saqlashda xatolik:", e);
  }
}

/**
 * Byudjetni localStorage dan yuklash
 */
function loadBudget() {
  const stored = localStorage.getItem(BUDGET_STORAGE_KEY);
  if (stored !== null) {
    familyBudget = parseFloat(stored) || 0;
  } else {
    familyBudget = 3000000;
    saveBudget();
  }
}

/**
 * Byudjetni localStorage ga saqlash
 */
function saveBudget() {
  try {
    localStorage.setItem(BUDGET_STORAGE_KEY, familyBudget.toString());
  } catch (e) {
    console.error("Byudjetni saqlashda xatolik:", e);
  }
}

/**
 * Byudjetni tahrirlash modalini ochish
 */
function openBudgetModal() {
  if (budgetInput) {
    budgetInput.value = familyBudget > 0 ? familyBudget : '';
  }
  if (budgetModal) {
    budgetModal.showModal();
    if (budgetInput) {
      budgetInput.focus();
      budgetInput.select();
    }
  }
}

function closeBudgetModal() {
  if (budgetModal) {
    budgetModal.close();
  }
}

function handleSaveBudget(e) {
  e.preventDefault();
  const val = parseFloat(budgetInput.value);

  if (isNaN(val) || val < 0) {
    budgetInput.focus();
    return;
  }

  familyBudget = val;
  saveBudget();
  render();
  closeBudgetModal();
  showToast('Oila byudjeti muvaffaqiyatli yangilandi!');
}

/**
 * Sahifalarni (Tablarni) almashtirish funksiyasi
 */
function switchTab(tabId) {
  currentTab = tabId;

  // 1. Sahifalarni ko'rsatish/yashirish
  const tabPages = document.querySelectorAll('.tab-page');
  tabPages.forEach(page => {
    if (page.id === tabId) {
      page.classList.add('active');
    } else {
      page.classList.remove('active');
    }
  });

  // 2. Mobil pastki navigatsiya tugmalarini yangilash
  const navBtns = document.querySelectorAll('.nav-btn');
  navBtns.forEach(btn => {
    btn.classList.toggle('active', btn.dataset.tab === tabId);
  });

  // 3. Desktop tab tugmalarini yangilash
  const desktopBtns = document.querySelectorAll('.desktop-tab-btn');
  desktopBtns.forEach(btn => {
    btn.classList.toggle('active', btn.dataset.tab === tabId);
  });

  window.scrollTo({ top: 0, behavior: 'smooth' });

  if (tabId === 'tab-add' && expenseNameInput) {
    setTimeout(() => expenseNameInput.focus(), 80);
  }
}

window.switchTab = switchTab;

/**
 * Qisqa xabarnoma (Toast) ko'rsatish
 */
let toastTimeout;
function showToast(message) {
  if (!toastEl) return;
  if (toastMessageEl) toastMessageEl.textContent = message;
  toastEl.classList.remove('hidden');

  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => {
    toastEl.classList.add('hidden');
  }, 2200);
}

/**
 * Tanlangan oydagi ma'lumotlarni filtrlash
 */
function getSelectedMonthItems() {
  return expenses.filter(item => {
    const d = new Date(item.date);
    return d.getFullYear() === selectedYear && d.getMonth() === selectedMonth;
  });
}

/**
 * Kategoriyalar kartalarini chizish (Faqat tanlangan oyning chiqimlari uchun)
 */
function renderCategoryCards(monthItems) {
  const categoryTotals = {};
  EXPENSE_CATEGORIES.forEach(cat => {
    categoryTotals[cat.name] = 0;
  });

  monthItems.filter(item => item.type !== 'income').forEach(item => {
    const matchedCategory = EXPENSE_CATEGORIES.find(
      cat => cat.name.replace(/[‘’`´']/g, '') === (item.category || '').replace(/[‘’`´']/g, '')
    );
    if (matchedCategory) {
      categoryTotals[matchedCategory.name] += Number(item.amount) || 0;
    } else {
      categoryTotals['Boshqa'] = (categoryTotals['Boshqa'] || 0) + (Number(item.amount) || 0);
    }
  });

  categoriesGridEl.innerHTML = EXPENSE_CATEGORIES.map(cat => {
    const total = categoryTotals[cat.name] || 0;
    return `
      <div class="category-card" data-category="${escapeHtml(cat.name)}">
        <div class="category-header">
          <span class="category-dot ${cat.dotClass}"></span>
          <span class="category-name" title="${escapeHtml(cat.name)}">${escapeHtml(cat.name)}</span>
        </div>
        <div class="category-sum">${formatCurrency(total)}</div>
      </div>
    `;
  }).join('');
}

/**
 * Tarix ro'yxatini chizish
 */
function renderHistoryList() {
  const monthItems = getSelectedMonthItems();

  let filtered = monthItems;
  if (historyFilter === 'expense') {
    filtered = monthItems.filter(i => i.type !== 'income');
  } else if (historyFilter === 'income') {
    filtered = monthItems.filter(i => i.type === 'income');
  }

  if (listCountBadgeEl) listCountBadgeEl.textContent = `${filtered.length} ta`;

  if (filtered.length === 0) {
    expenseListEl.innerHTML = '';
    emptyStateEl.classList.remove('hidden');
    return;
  }

  emptyStateEl.classList.add('hidden');

  const sorted = [...filtered].reverse();

  expenseListEl.innerHTML = sorted.map(item => {
    const isIncome = item.type === 'income';
    const sign = isIncome ? '+' : '-';
    const amountClass = isIncome ? 'expense-amount income' : 'expense-amount';
    const tagClass = isIncome ? 'category-tag income-tag' : 'category-tag';
    const itemClass = isIncome ? 'expense-item is-income' : 'expense-item';

    return `
      <li class="${itemClass}" data-id="${item.id}">
        <div class="expense-info">
          <div class="expense-title-row">
            <span class="expense-name">${escapeHtml(item.name)}</span>
            <span class="${tagClass}">${isIncome ? '🟢 Kirim: ' : ''}${escapeHtml(item.category)}</span>
          </div>
          <span class="expense-date">${formatDate(item.date)}</span>
        </div>

        <div class="expense-actions">
          <span class="${amountClass}">${sign}${formatCurrency(item.amount)}</span>
          <button 
            type="button" 
            class="btn-delete" 
            title="O‘chirish"
            aria-label="Amaliyotni o‘chirish"
            onclick="handleDeleteExpense('${item.id}')"
          >
            O‘chirish
          </button>
        </div>
      </li>
    `;
  }).join('');
}

/**
 * Bosh sahifadagi so'nggi 3 ta amaliyotni chizish
 */
function renderRecentList(monthItems) {
  if (!recentExpenseListEl) return;

  if (monthItems.length === 0) {
    recentExpenseListEl.innerHTML = `
      <li style="text-align: center; color: var(--text-muted); font-size: 13px; padding: 14px 0;">
        Ushbu oyda hali hech qanday amaliyot kiritilmagan.
      </li>
    `;
    return;
  }

  const recentThree = [...monthItems].reverse().slice(0, 3);
  recentExpenseListEl.innerHTML = recentThree.map(item => {
    const isIncome = item.type === 'income';
    const sign = isIncome ? '+' : '-';
    const amountClass = isIncome ? 'expense-amount income' : 'expense-amount';
    const tagClass = isIncome ? 'category-tag income-tag' : 'category-tag';

    return `
      <li class="expense-item ${isIncome ? 'is-income' : ''}" data-id="${item.id}">
        <div class="expense-info">
          <div class="expense-title-row">
            <span class="expense-name">${escapeHtml(item.name)}</span>
            <span class="${tagClass}">${isIncome ? '🟢 ' : ''}${escapeHtml(item.category)}</span>
          </div>
          <span class="expense-date">${formatDate(item.date)}</span>
        </div>
        <div class="expense-actions">
          <span class="${amountClass}">${sign}${formatCurrency(item.amount)}</span>
        </div>
      </li>
    `;
  }).join('');
}

/**
 * Asosiy render funksiyasi
 */
function render() {
  updateMonthDisplay();

  // 1. Tanlangan oydagi ma'lumotlarni ajratib olish
  const monthItems = getSelectedMonthItems();

  // 2. Chiqimlar va Kirimlarni alohida hisoblash
  const totalExpenses = monthItems
    .filter(item => item.type !== 'income')
    .reduce((sum, item) => sum + (Number(item.amount) || 0), 0);

  const totalIncome = monthItems
    .filter(item => item.type === 'income')
    .reduce((sum, item) => sum + (Number(item.amount) || 0), 0);

  // 3. Jami mavjud mablag' = Boshlang'ich Byudjet + Kirimlar
  const totalAvailableBudget = familyBudget + totalIncome;
  const remaining = totalAvailableBudget - totalExpenses;

  // Ko'rsatkichlarni yangilash
  totalAmountEl.textContent = formatCurrency(totalExpenses);
  const expenseCount = monthItems.filter(item => item.type !== 'income').length;
  totalCountEl.textContent = `${expenseCount} ta chiqim`;

  if (budgetAmountEl) {
    budgetAmountEl.textContent = formatCurrency(totalAvailableBudget);
  }

  if (budgetStatusSubEl) {
    budgetStatusSubEl.textContent = `+${formatCurrency(totalIncome)} kirim bo‘ldi`;
  }

  // Qoldiq
  if (remainingAmountEl) {
    if (remaining >= 0) {
      remainingAmountEl.textContent = formatCurrency(remaining);
      remainingAmountEl.className = 'metric-value text-remaining is-positive';
    } else {
      remainingAmountEl.textContent = `-${formatCurrency(Math.abs(remaining))}`;
      remainingAmountEl.className = 'metric-value text-remaining is-negative';
    }
  }

  // 4. Progress bar va foizlar
  if (totalAvailableBudget > 0) {
    const spentPercent = (totalExpenses / totalAvailableBudget) * 100;
    const clampedWidth = Math.min(Math.max(spentPercent, 0), 100);

    if (budgetProgressFillEl) {
      budgetProgressFillEl.style.width = `${clampedWidth}%`;
      budgetProgressFillEl.classList.remove('warning', 'danger');
      if (spentPercent > 100) {
        budgetProgressFillEl.classList.add('danger');
      } else if (spentPercent >= 80) {
        budgetProgressFillEl.classList.add('warning');
      }
    }

    if (remainingPercentageEl) {
      if (spentPercent > 100) {
        remainingPercentageEl.textContent = 'Byudjetdan oshib ketdi!';
      } else {
        remainingPercentageEl.textContent = `${spentPercent.toFixed(1)}% sarflandi`;
      }
    }

    if (progressSpentTextEl) {
      progressSpentTextEl.textContent = `${spentPercent.toFixed(0)}% ishlatildi (${formatCurrency(totalExpenses)})`;
    }

    if (progressRemainingTextEl) {
      if (remaining >= 0) {
        const remainingRatio = Math.max(0, 100 - spentPercent);
        progressRemainingTextEl.textContent = `Qoldiq: ${remainingRatio.toFixed(0)}%`;
      } else {
        progressRemainingTextEl.textContent = `Ortiqcha sarf: ${formatCurrency(Math.abs(remaining))}`;
      }
    }
  } else {
    if (budgetProgressFillEl) budgetProgressFillEl.style.width = '0%';
    if (remainingPercentageEl) remainingPercentageEl.textContent = 'Byudjet 0 so‘m';
    if (progressSpentTextEl) progressSpentTextEl.textContent = '0% ishlatildi';
    if (progressRemainingTextEl) progressRemainingTextEl.textContent = 'Byudjet belgilanmagan';
  }

  // Nishonlar
  if (desktopHistoryBadgeEl) desktopHistoryBadgeEl.textContent = `${monthItems.length}`;
  if (navHistoryBadgeEl) navHistoryBadgeEl.textContent = `${monthItems.length}`;

  // Kategoriyalar
  renderCategoryCards(monthItems);

  // So'nggi amaliyotlar
  renderRecentList(monthItems);

  // Tarix ro'yxati
  renderHistoryList();
}

/**
 * Yangi xarajat yoki kirim qo'shish funksiyasi
 */
function handleAddExpense(e) {
  e.preventDefault();

  const name = expenseNameInput.value.trim();
  const amount = parseFloat(expenseAmountInput.value);
  const category = expenseCategorySelect.value;

  if (!name) {
    expenseNameInput.focus();
    return;
  }

  if (isNaN(amount) || amount <= 0) {
    expenseAmountInput.focus();
    return;
  }

  // Yangi amaliyot obyekti
  // Agar boshqa oy tanlangan bo'lsa, o'sha oy sanasiga qo'shish imkoniyati
  const now = new Date();
  let transactionDate = now.toISOString();

  // Agar foydalanuvchi o'tmishdagi oyni ko'rib turib kiritayotgan bo'lsa, o'sha oyga yozamiz
  if (now.getFullYear() !== selectedYear || now.getMonth() !== selectedMonth) {
    const customDate = new Date(selectedYear, selectedMonth, 15, 12, 0, 0);
    transactionDate = customDate.toISOString();
  }

  const newTransaction = {
    id: Date.now().toString(),
    type: currentTransactionType,
    name: name,
    amount: amount,
    category: category,
    date: transactionDate
  };

  expenses.push(newTransaction);
  saveExpenses();

  // Formani tozalash
  expenseNameInput.value = '';
  expenseAmountInput.value = '';

  render();

  const successMsg = currentTransactionType === 'income' 
    ? 'Kirim muvaffaqiyatli saqlandi! Byudjetga qo‘shildi.' 
    : 'Xarajat muvaffaqiyatli saqlandi!';

  showToast(successMsg);

  setTimeout(() => {
    switchTab('tab-history');
  }, 300);
}

/**
 * Amaliyotni o'chirish funksiyasi
 */
function handleDeleteExpense(id) {
  const item = expenses.find(i => i.id === id);
  expenses = expenses.filter(i => i.id !== id);
  saveExpenses();
  render();
  const msg = item && item.type === 'income' ? 'Kirim o‘chirildi' : 'Xarajat o‘chirildi';
  showToast(msg);
}

window.handleDeleteExpense = handleDeleteExpense;

/**
 * XSS oldini olish
 */
function escapeHtml(text) {
  if (!text) return '';
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

/**
 * Ilovani ishga tushirish (Initialization)
 */
function init() {
  displayHeaderDate();
  loadBudget();
  loadExpenses();
  setTransactionType('expense');
  render();

  // Oylik navigatsiya
  if (prevMonthBtn) prevMonthBtn.addEventListener('click', prevMonth);
  if (nextMonthBtn) nextMonthBtn.addEventListener('click', nextMonth);
  if (todayMonthBtn) todayMonthBtn.addEventListener('click', goToCurrentMonth);

  // Forma yuborish
  if (expenseForm) {
    expenseForm.addEventListener('submit', handleAddExpense);
  }

  // Mobil navigatsiya
  const navBtns = document.querySelectorAll('.nav-btn');
  navBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const tabId = btn.dataset.tab;
      if (tabId) switchTab(tabId);
    });
  });

  // Desktop navigatsiya
  const desktopBtns = document.querySelectorAll('.desktop-tab-btn');
  desktopBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const tabId = btn.dataset.tab;
      if (tabId) switchTab(tabId);
    });
  });

  // Byudjet modali
  if (openBudgetModalBtn) openBudgetModalBtn.addEventListener('click', openBudgetModal);
  if (closeBudgetModalBtn) closeBudgetModalBtn.addEventListener('click', closeBudgetModal);
  if (cancelBudgetBtn) cancelBudgetBtn.addEventListener('click', closeBudgetModal);
  if (budgetForm) budgetForm.addEventListener('submit', handleSaveBudget);

  if (budgetModal) {
    budgetModal.addEventListener('click', (e) => {
      const rect = budgetModal.getBoundingClientRect();
      const isInside = (
        rect.top <= e.clientY && e.clientY <= rect.top + rect.height &&
        rect.left <= e.clientX && e.clientX <= rect.left + rect.width
      );
      if (!isInside) {
        closeBudgetModal();
      }
    });
  }
}

document.addEventListener('DOMContentLoaded', init);
