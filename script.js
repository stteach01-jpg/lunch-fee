const LUNCH_PRICE = 55;
const STORAGE_KEY = "shetouTeacherLunchRegistrations";

const weekdays = [
  { value: 1, label: "星期一", shortLabel: "一" },
  { value: 2, label: "星期二", shortLabel: "二" },
  { value: 3, label: "星期三", shortLabel: "三" },
  { value: 4, label: "星期四", shortLabel: "四" },
  { value: 5, label: "星期五", shortLabel: "五" },
];

const elements = {
  monthPicker: document.querySelector("#monthPicker"),
  monthLabel: document.querySelector("#monthLabel"),
  excludedDates: document.querySelector("#excludedDates"),
  excludedDatesHint: document.querySelector("#excludedDatesHint"),
  weekdaySummary: document.querySelector("#weekdaySummary"),
  weekdayCardTemplate: document.querySelector("#weekdayCardTemplate"),
  form: document.querySelector("#lunchForm"),
  teacherName: document.querySelector("#teacherName"),
  weekdayInputs: Array.from(document.querySelectorAll("input[name='weekday']")),
  previewDays: document.querySelector("#previewDays"),
  previewAmount: document.querySelector("#previewAmount"),
  resetFormButton: document.querySelector("#resetFormButton"),
  tableSummary: document.querySelector("#tableSummary"),
  registrationTable: document.querySelector("#registrationTable"),
  totalDays: document.querySelector("#totalDays"),
  totalAmount: document.querySelector("#totalAmount"),
  exportButton: document.querySelector("#exportButton"),
  clearMonthButton: document.querySelector("#clearMonthButton"),
  saveButton: document.querySelector("#saveButton"),
};

let state = loadState();
let editingId = null;

function getCurrentMonthValue() {
  const now = new Date();
  if (now.getDate() > 15) {
    now.setMonth(now.getMonth() + 1);
  }
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

function loadState() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : {};
  } catch {
    return {};
  }
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function getMonthData(monthKey) {
  if (Array.isArray(state[monthKey])) {
    state[monthKey] = {
      entries: state[monthKey],
      excludedDates: "",
    };
  }

  if (!state[monthKey]) {
    state[monthKey] = {
      entries: [],
      excludedDates: "",
    };
  }

  return state[monthKey];
}

function getMonthEntries(monthKey) {
  return getMonthData(monthKey).entries;
}

function getBaseWeekdayCounts(monthKey) {
  const [year, month] = monthKey.split("-").map(Number);
  const lastDate = new Date(year, month, 0).getDate();
  const counts = Object.fromEntries(weekdays.map((weekday) => [weekday.value, 0]));

  for (let date = 1; date <= lastDate; date += 1) {
    const day = new Date(year, month - 1, date).getDay();
    if (day >= 1 && day <= 5) {
      counts[day] += 1;
    }
  }

  return counts;
}

function getExcludedDateInfo(monthKey) {
  const [year, month] = monthKey.split("-").map(Number);
  const lastDate = new Date(year, month, 0).getDate();
  const input = getMonthData(monthKey).excludedDates || "";
  const excludedDates = new Set();
  const ignored = [];

  input
    .split(/[\s,，、;；]+/)
    .map((item) => item.trim())
    .filter(Boolean)
    .forEach((item) => {
      const day = parseExcludedDay(item, year, month, lastDate);
      if (day) {
        excludedDates.add(day);
      } else {
        ignored.push(item);
      }
    });

  const byWeekday = Object.fromEntries(weekdays.map((weekday) => [weekday.value, 0]));
  const weekdayDates = [];
  const weekendDates = [];

  Array.from(excludedDates)
    .sort((a, b) => a - b)
    .forEach((date) => {
      const day = new Date(year, month - 1, date).getDay();
      if (day >= 1 && day <= 5) {
        byWeekday[day] += 1;
        weekdayDates.push(date);
      } else {
        weekendDates.push(date);
      }
    });

  return {
    byWeekday,
    ignored,
    weekdayDates,
    weekendDates,
  };
}

function parseExcludedDay(value, year, month, lastDate) {
  const normalized = value.replaceAll("/", "-");
  let targetYear = year;
  let targetMonth = month;
  let targetDay = null;

  if (/^\d{1,2}$/.test(normalized)) {
    targetDay = Number(normalized);
  } else if (/^\d{1,2}-\d{1,2}$/.test(normalized)) {
    const [inputMonth, inputDay] = normalized.split("-").map(Number);
    targetMonth = inputMonth;
    targetDay = inputDay;
  } else if (/^\d{4}-\d{1,2}-\d{1,2}$/.test(normalized)) {
    const parts = normalized.split("-").map(Number);
    targetYear = parts[0];
    targetMonth = parts[1];
    targetDay = parts[2];
  }

  if (
    targetYear !== year ||
    targetMonth !== month ||
    !Number.isInteger(targetDay) ||
    targetDay < 1 ||
    targetDay > lastDate
  ) {
    return null;
  }

  return targetDay;
}

function getWeekdayCounts(monthKey) {
  const baseCounts = getBaseWeekdayCounts(monthKey);
  const excluded = getExcludedDateInfo(monthKey);
  const counts = { ...baseCounts };

  weekdays.forEach((weekday) => {
    counts[weekday.value] = Math.max(0, baseCounts[weekday.value] - excluded.byWeekday[weekday.value]);
  });

  return {
    baseCounts,
    adjustedCounts: counts,
    excluded,
  };
}

function getMonthDisplay(monthKey) {
  const [year, month] = monthKey.split("-");
  return `${year} 年 ${Number(month)} 月`;
}

function getSelectedWeekdays() {
  return elements.weekdayInputs
    .filter((input) => input.checked)
    .map((input) => Number(input.value));
}

function calculateDays(selectedWeekdays, counts) {
  return selectedWeekdays.reduce((sum, weekday) => sum + (counts[weekday] || 0), 0);
}

function formatMoney(amount) {
  return `${amount.toLocaleString("zh-TW")} 元`;
}

function renderWeekdaySummary() {
  const monthKey = elements.monthPicker.value;
  const { baseCounts, adjustedCounts, excluded } = getWeekdayCounts(monthKey);
  const fragment = document.createDocumentFragment();

  elements.monthLabel.textContent = getMonthDisplay(monthKey);
  elements.weekdaySummary.replaceChildren();

  weekdays.forEach((weekday) => {
    const card = elements.weekdayCardTemplate.content.cloneNode(true);
    card.querySelector(".weekday-name").textContent = weekday.label;
    card.querySelector(".weekday-count").textContent = `${adjustedCounts[weekday.value]} 天`;
    card.querySelector(".weekday-detail").textContent = excluded.byWeekday[weekday.value]
      ? `原 ${baseCounts[weekday.value]} 天，扣 ${excluded.byWeekday[weekday.value]} 天`
      : `原 ${baseCounts[weekday.value]} 天`;
    fragment.appendChild(card);
  });

  elements.weekdaySummary.appendChild(fragment);
  renderExcludedHint(excluded);
}

function renderExcludedHint(excluded) {
  const parts = [];
  if (excluded.weekdayDates.length) {
    parts.push(`已扣除：${excluded.weekdayDates.join("、")} 日`);
  }
  if (excluded.weekendDates.length) {
    parts.push(`週末不影響：${excluded.weekendDates.join("、")} 日`);
  }
  if (excluded.ignored.length) {
    parts.push(`未採計：${excluded.ignored.join("、")}`);
  }
  elements.excludedDatesHint.textContent = parts.length
    ? parts.join("；")
    : "可輸入本月假日或停餐日，系統會從星期天數中扣除。";
}

function renderPreview() {
  const { adjustedCounts } = getWeekdayCounts(elements.monthPicker.value);
  const days = calculateDays(getSelectedWeekdays(), adjustedCounts);
  elements.previewDays.textContent = `${days} 天`;
  elements.previewAmount.textContent = formatMoney(days * LUNCH_PRICE);
}

function renderTable() {
  const monthKey = elements.monthPicker.value;
  const { adjustedCounts } = getWeekdayCounts(monthKey);
  const entries = getMonthEntries(monthKey);
  const fragment = document.createDocumentFragment();

  elements.registrationTable.replaceChildren();

  if (entries.length === 0) {
    const row = document.createElement("tr");
    row.className = "empty-row";
    row.innerHTML = '<td colspan="9">尚無登記資料</td>';
    elements.registrationTable.appendChild(row);
  } else {
    entries
      .slice()
      .sort((a, b) => a.name.localeCompare(b.name, "zh-Hant"))
      .forEach((entry) => {
        const selected = new Set(entry.weekdays);
        const days = calculateDays(entry.weekdays, adjustedCounts);
        const row = document.createElement("tr");
        row.innerHTML = `
          <td>${escapeHtml(entry.name)}</td>
          ${weekdays.map((weekday) => renderWeekdayCell(selected, weekday.value)).join("")}
          <td>${days} 天</td>
          <td>${formatMoney(days * LUNCH_PRICE)}</td>
          <td>
            <div class="row-actions">
              <button type="button" class="secondary-button" data-action="edit" data-id="${entry.id}">編輯</button>
              <button type="button" class="danger-button" data-action="delete" data-id="${entry.id}">刪除</button>
            </div>
          </td>
        `;
        fragment.appendChild(row);
      });
    elements.registrationTable.appendChild(fragment);
  }

  const totalDays = entries.reduce((sum, entry) => sum + calculateDays(entry.weekdays, adjustedCounts), 0);
  const totalAmount = totalDays * LUNCH_PRICE;
  elements.totalDays.textContent = `${totalDays} 天`;
  elements.totalAmount.textContent = formatMoney(totalAmount);
  elements.tableSummary.textContent = entries.length
    ? `${entries.length} 位教師，合計 ${totalDays} 天，${formatMoney(totalAmount)}`
    : "尚無登記資料";
  elements.exportButton.disabled = entries.length === 0;
  elements.clearMonthButton.disabled = entries.length === 0;
}

function renderWeekdayCell(selected, weekdayValue) {
  const isActive = selected.has(weekdayValue);
  return `<td><span class="status-pill${isActive ? " active" : ""}">${isActive ? "訂" : "-"}</span></td>`;
}

function escapeHtml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function resetForm() {
  editingId = null;
  elements.form.reset();
  elements.saveButton.textContent = "加入總表";
  renderPreview();
  elements.teacherName.focus();
}

function handleSubmit(event) {
  event.preventDefault();

  const monthKey = elements.monthPicker.value;
  const name = elements.teacherName.value.trim();
  const selectedWeekdays = getSelectedWeekdays();

  if (!name) {
    elements.teacherName.focus();
    return;
  }

  if (selectedWeekdays.length === 0) {
    alert("請至少選擇一個訂午餐的星期。");
    return;
  }

  const entries = getMonthEntries(monthKey);
  const duplicate = entries.find((entry) => entry.name === name && entry.id !== editingId);

  if (duplicate && !confirm(`${name} 在本月已有登記，是否覆蓋原本資料？`)) {
    return;
  }

  if (duplicate) {
    duplicate.weekdays = selectedWeekdays;
    if (editingId) {
      getMonthData(monthKey).entries = entries.filter((entry) => entry.id !== editingId);
    }
  } else if (editingId) {
    const current = entries.find((entry) => entry.id === editingId);
    if (current) {
      current.name = name;
      current.weekdays = selectedWeekdays;
    }
  } else {
    entries.push({
      id: globalThis.crypto?.randomUUID ? globalThis.crypto.randomUUID() : String(Date.now()),
      name,
      weekdays: selectedWeekdays,
    });
  }

  saveState();
  resetForm();
  renderTable();
}

function handleTableClick(event) {
  const button = event.target.closest("button[data-action]");
  if (!button) {
    return;
  }

  const monthKey = elements.monthPicker.value;
  const entries = getMonthEntries(monthKey);
  const entry = entries.find((item) => item.id === button.dataset.id);

  if (!entry) {
    return;
  }

  if (button.dataset.action === "edit") {
    editingId = entry.id;
    elements.teacherName.value = entry.name;
    elements.weekdayInputs.forEach((input) => {
      input.checked = entry.weekdays.includes(Number(input.value));
    });
    elements.saveButton.textContent = "更新總表";
    renderPreview();
    elements.teacherName.focus();
  }

  if (button.dataset.action === "delete" && confirm(`確定刪除 ${entry.name} 的登記資料？`)) {
    getMonthData(monthKey).entries = entries.filter((item) => item.id !== entry.id);
    saveState();
    if (editingId === entry.id) {
      resetForm();
    }
    renderTable();
  }
}

function exportCsv() {
  const monthKey = elements.monthPicker.value;
  const { adjustedCounts, excluded } = getWeekdayCounts(monthKey);
  const rows = getMonthEntries(monthKey)
    .slice()
    .sort((a, b) => a.name.localeCompare(b.name, "zh-Hant"));

  const csvRows = [
    ["月份", getMonthDisplay(monthKey)],
    ["每日午餐費", LUNCH_PRICE],
    ["不列入登記日期", excluded.weekdayDates.length ? excluded.weekdayDates.join("、") : "無"],
    [],
    ["教師姓名", "星期一", "星期二", "星期三", "星期四", "星期五", "訂餐天數", "應付金額"],
    ...rows.map((entry) => {
      const selected = new Set(entry.weekdays);
      const days = calculateDays(entry.weekdays, adjustedCounts);
      return [
        entry.name,
        ...weekdays.map((weekday) => (selected.has(weekday.value) ? adjustedCounts[weekday.value] : 0)),
        days,
        days * LUNCH_PRICE,
      ];
    }),
  ];

  const totalDays = rows.reduce((sum, entry) => sum + calculateDays(entry.weekdays, adjustedCounts), 0);
  csvRows.push(["合計", "", "", "", "", "", totalDays, totalDays * LUNCH_PRICE]);

  const csvContent = csvRows.map((row) => row.map(toCsvCell).join(",")).join("\n");
  const blob = new Blob(["\ufeff", csvContent], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `社頭國中教師營養午餐登記-${monthKey}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

function toCsvCell(value) {
  const text = String(value ?? "");
  return `"${text.replaceAll('"', '""')}"`;
}

function clearMonth() {
  const monthKey = elements.monthPicker.value;
  if (!confirm(`確定清空 ${getMonthDisplay(monthKey)} 的所有登記資料？`)) {
    return;
  }

  getMonthData(monthKey).entries = [];
  saveState();
  resetForm();
  renderTable();
}

function handleMonthChange() {
  elements.excludedDates.value = getMonthData(elements.monthPicker.value).excludedDates || "";
  resetForm();
  renderWeekdaySummary();
  renderTable();
}

function handleExcludedDatesChange() {
  const monthKey = elements.monthPicker.value;
  getMonthData(monthKey).excludedDates = elements.excludedDates.value.trim();
  saveState();
  renderWeekdaySummary();
  renderPreview();
  renderTable();
}

function init() {
  elements.monthPicker.value = getCurrentMonthValue();
  elements.excludedDates.value = getMonthData(elements.monthPicker.value).excludedDates || "";
  renderWeekdaySummary();
  renderPreview();
  renderTable();

  elements.monthPicker.addEventListener("change", handleMonthChange);
  elements.excludedDates.addEventListener("input", handleExcludedDatesChange);
  elements.form.addEventListener("submit", handleSubmit);
  elements.resetFormButton.addEventListener("click", resetForm);
  elements.weekdayInputs.forEach((input) => input.addEventListener("change", renderPreview));
  elements.registrationTable.addEventListener("click", handleTableClick);
  elements.exportButton.addEventListener("click", exportCsv);
  elements.clearMonthButton.addEventListener("click", clearMonth);
}

init();
