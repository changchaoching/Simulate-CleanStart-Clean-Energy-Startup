/**
 * CleanStart Web Simulator UI & Application Controller
 * 24-Quarter Edition + Google Sheets Two-Sheet Architecture Webhook
 */

let engine = new CleanStartEngine();
let charts = {};

// LocalStorage 鍵名
const STORAGE_KEY_WEBHOOK = "cleanstart_webhook_url";
const STORAGE_KEY_CLASS = "cleanstart_class_name";
const STORAGE_KEY_ID = "cleanstart_student_id";
const STORAGE_KEY_NAME = "cleanstart_student_name";

document.addEventListener("DOMContentLoaded", () => {
    if (window.lucide) lucide.createIcons();
    initCharts();
    bindInputs();
    loadStoredCredentials();
    updateUI();
});

// 1. 初始化 4 個 Chart.js 圖表
function initCharts() {
    const commonOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                labels: { color: '#334155', font: { size: 10, family: 'Plus Jakarta Sans' } }
            },
            tooltip: {
                mode: 'index',
                intersect: false,
                backgroundColor: 'rgba(255, 255, 255, 0.95)', borderColor: '#cbd5e1', borderWidth: 1, titleColor: '#0f172a', bodyColor: '#334155',
                titleFont: { size: 11, family: 'JetBrains Mono' },
                bodyFont: { size: 10, family: 'JetBrains Mono' }
            }
        },
        scales: {
            x: {
                grid: { color: 'rgba(226, 232, 240, 0.8)' },
                ticks: { color: '#475569', font: { size: 9, family: 'JetBrains Mono' } }
            },
            y: {
                grid: { color: 'rgba(226, 232, 240, 0.8)' },
                ticks: { color: '#475569', font: { size: 9, family: 'JetBrains Mono' } }
            }
        }
    };

    // (A) 財務與現金走勢
    const ctxFin = document.getElementById('chartFinancials').getContext('2d');
    charts.financials = new Chart(ctxFin, {
        type: 'line',
        data: {
            labels: [],
            datasets: [
                {
                    label: '季度營收 ($)',
                    data: [],
                    borderColor: '#10b981',
                    borderWidth: 2,
                    tension: 0.2
                },
                {
                    label: '現金餘額 ($)',
                    data: [],
                    borderColor: '#38bdf8',
                    borderWidth: 2,
                    tension: 0.2
                },
                {
                    label: '當季淨損益 ($)',
                    data: [],
                    borderColor: '#f43f5e',
                    borderWidth: 1.5,
                    borderDash: [4, 4],
                    tension: 0.2
                }
            ]
        },
        options: commonOptions
    });

    // (B) 商辦節能安裝量
    const ctxAdoption = document.getElementById('chartAdoption').getContext('2d');
    charts.adoption = new Chart(ctxAdoption, {
        type: 'line',
        data: {
            labels: [],
            datasets: [
                {
                    label: '累計安裝商辦 (套)',
                    data: [],
                    borderColor: '#06b6d4',
                    backgroundColor: 'rgba(6, 182, 212, 0.1)',
                    borderWidth: 2.5,
                    tension: 0.2
                },
                {
                    label: '當季完工交付 (套)',
                    data: [],
                    borderColor: '#eab308',
                    borderWidth: 1.5,
                    borderDash: [3, 3],
                    tension: 0.2
                }
            ]
        },
        options: commonOptions
    });

    // (C) 公司估值與創辦人股東價值
    const ctxVal = document.getElementById('chartValuation').getContext('2d');
    charts.valuation = new Chart(ctxVal, {
        type: 'line',
        data: {
            labels: [],
            datasets: [
                {
                    label: '公司總估值 ($)',
                    data: [],
                    borderColor: '#6366f1',
                    borderWidth: 2,
                    tension: 0.2
                },
                {
                    label: '創辦人持股市值 ($)',
                    data: [],
                    borderColor: '#a855f7',
                    borderWidth: 2,
                    borderDash: [2, 2],
                    tension: 0.2
                }
            ]
        },
        options: commonOptions
    });

    // (D) 人才團隊與技術指標
    const ctxTeam = document.getElementById('chartTeam').getContext('2d');
    charts.team = new Chart(ctxTeam, {
        type: 'line',
        data: {
            labels: [],
            datasets: [
                {
                    label: '研發工程師 (人)',
                    data: [],
                    borderColor: '#3b82f6',
                    borderWidth: 2,
                    yAxisID: 'y'
                },
                {
                    label: '業務銷售團隊 (人)',
                    data: [],
                    borderColor: '#f97316',
                    borderWidth: 2,
                    yAxisID: 'y'
                },
                {
                    label: '產品性能指標 (x)',
                    data: [],
                    borderColor: '#10b981',
                    borderWidth: 1.5,
                    borderDash: [4, 4],
                    yAxisID: 'y1'
                }
            ]
        },
        options: {
            ...commonOptions,
            scales: {
                x: commonOptions.scales.x,
                y: {
                    type: 'linear',
                    display: true,
                    position: 'left',
                    grid: { color: 'rgba(226, 232, 240, 0.8)' },
                    ticks: { color: '#475569', font: { size: 9, family: 'JetBrains Mono' } }
                },
                y1: {
                    type: 'linear',
                    display: true,
                    position: 'right',
                    grid: { drawOnChartArea: false },
                    ticks: { color: '#10b981', font: { size: 9, family: 'JetBrains Mono' } }
                }
            }
        }
    });
}

// 2. 綁定滑桿與數值連動
function bindInputs() {
    const sync = (sliderId, displayId, prefix = '', suffix = '', divisor = 1) => {
        const slider = document.getElementById(sliderId);
        const display = document.getElementById(displayId);
        if (!slider || !display) return;
        const update = () => {
            let val = Number(slider.value);
            if (divisor !== 1) val = (val / divisor).toFixed(divisor === 100 ? 0 : 1);
            else val = val.toLocaleString();
            display.textContent = `${prefix}${val}${suffix}`;
            updateLivePreview();
        };
        slider.addEventListener('input', update);
        update();
    };

    sync('inputPrice', 'valPrice', '$');
    sync('inputHireEng', 'valHireEng', '+');
    sync('inputHireSales', 'valHireSales', '+');
    sync('inputSalary', 'valSalary', '$');
    sync('inputOption', 'valOption', '', '%', 0.01);
    sync('inputProfitShare', 'valProfitShare', '', '%', 0.01);

    const checkTakeVC = document.getElementById('checkTakeVC');
    if (checkTakeVC) checkTakeVC.addEventListener('change', updateLivePreview);

    const btnNext = document.getElementById('btnNextQuarter');
    if (btnNext) btnNext.addEventListener('click', advanceQuarter);
}

// 實時預估當季支出與營運
function updateLivePreview() {
    const eng = engine.engineers + Number(document.getElementById('inputHireEng').value);
    const sales = engine.salespeople + Number(document.getElementById('inputHireSales').value);
    const sal = Number(document.getElementById('inputSalary').value);
    const estPayroll = (eng + sales) * sal;
    const estBurn = estPayroll + (eng * 2500) + (sales * 3000) + 12000;
    
    const previewEl = document.getElementById('previewBurn');
    if (previewEl) {
        previewEl.textContent = `預估當季營運固定費用: ~$${estBurn.toLocaleString()}`;
    }
}

// 3. 推進季度 (Advance Quarter)
function advanceQuarter() {
    if (engine.isGameOver) {
        openSubmitModal();
        return;
    }

    const decisions = {
        productPrice: Number(document.getElementById('inputPrice').value),
        hireEngineers: Number(document.getElementById('inputHireEng').value),
        hireSalespeople: Number(document.getElementById('inputHireSales').value),
        salaryOffer: Number(document.getElementById('inputSalary').value),
        stockOptionRate: Number(document.getElementById('inputOption').value),
        profitSharingRate: Number(document.getElementById('inputProfitShare').value),
        takeVCFunding: document.getElementById('checkTakeVC').checked
    };

    engine.step(decisions);

    // 重置單次事件 Checkbox
    document.getElementById('checkTakeVC').checked = false;

    // 招聘人數歸零
    document.getElementById('inputHireEng').value = 0;
    document.getElementById('inputHireSales').value = 0;
    document.getElementById('inputHireEng').dispatchEvent(new Event('input'));
    document.getElementById('inputHireSales').dispatchEvent(new Event('input'));

    updateUI();

    if (engine.isGameOver) {
        setTimeout(() => {
            openSubmitModal();
        }, 800);
    }
}

// 4. 更新整體 UI 介面
function updateUI() {
    // (A) 頂部 KPI 與 24 季進度
    let currentY = 1 + Math.floor((engine.currentQuarter - 1) / 4);
    let currentQ = ((engine.currentQuarter - 1) % 4) + 1;
    let quarterLabel = `Y${currentY} Q${currentQ}`;

    setText('kpiQuarter', quarterLabel);
    setText('kpiQuarterNum', Math.min(24, engine.currentQuarter));
    setText('kpiCash', `$${Math.round(engine.cash).toLocaleString()}`);
    setText('kpiValuation', `$${(engine.valuation / 1e6).toFixed(1)}M`);
    setText('kpiOwnership', `${(engine.founderOwnership * 100).toFixed(1)}%`);

    // (B) 創辦人身價
    let founderNetWorth = Math.round(engine.valuation * engine.founderOwnership);
    setText('valFounderWorth', `$${(founderNetWorth / 1e6).toFixed(2)}M`);

    // (C) 團隊人力狀態卡
    setText('statusEngineers', engine.engineers);
    setText('statusSales', engine.salespeople);
    setText('statusMorale', `${Math.round(engine.staffMorale * 100)}%`);
    setText('statusProductQuality', `${engine.productQuality.toFixed(2)}x`);

    // (D) 營運與市場指標卡
    setText('statusOrders', engine.quarterlyOrders);
    setText('statusDeliveries', engine.quarterlyDeliveries);
    setText('statusBacklog', engine.backlog);
    setText('statusInstalled', engine.installedBase);
    setText('statusAwareness', `${(engine.marketAwareness * 100).toFixed(1)}%`);
    setText('statusUnitCost', `$${engine.unitProductionCost.toLocaleString()}`);

    // (E) 財務報表卡
    setText('finRevenue', `$${Math.round(engine.revenue).toLocaleString()}`);
    setText('finCogs', `$${Math.round(engine.cogs).toLocaleString()}`);
    setText('finGrossProfit', `$${Math.round(engine.grossProfit).toLocaleString()}`);
    setText('finRnd', `$${Math.round(engine.rndExpenses).toLocaleString()}`);
    setText('finSales', `$${Math.round(engine.salesExpenses).toLocaleString()}`);
    setText('finAdmin', `$${Math.round(engine.adminExpenses).toLocaleString()}`);
    
    const netEl = document.getElementById('finNetIncome');
    if (netEl) {
        netEl.textContent = `${engine.netIncome >= 0 ? '+' : ''}$${Math.round(engine.netIncome).toLocaleString()}`;
        netEl.className = `font-mono font-bold ${engine.netIncome >= 0 ? 'text-emerald-600' : 'text-rose-600'}`;
    }

    setText('finCumulativeNet', `$${Math.round(engine.cumulativeNetIncome).toLocaleString()}`);
    setText('finBurnRate', `$${Math.round(engine.burnRate).toLocaleString()}`);

    // (F) 募資輪次資訊
    setText('badgeVCRound', engine.vcRoundAvailable);
    const vcOfferText = getVCOfferDescription(engine.vcRoundAvailable, engine.hasIPO);
    setText('textVCOffer', vcOfferText);

    // (G) 遊戲結束警示與按鈕狀態
    const banner = document.getElementById('gameAlertBanner');
    const alertTitle = document.getElementById('alertTitle');
    const alertMsg = document.getElementById('alertMessage');
    const btnNext = document.getElementById('btnNextQuarter');

    if (engine.isGameOver) {
        banner.classList.remove('hidden');
        if (engine.cash < -20000) {
            banner.className = "p-4 rounded-2xl border transition-all shadow-md bg-rose-50 border-rose-200 text-rose-900";
            alertTitle.textContent = "新創破產 (Insolvency)";
            alertMsg.textContent = engine.gameOverReason;
        } else {
            banner.className = "p-4 rounded-2xl border transition-all shadow-md bg-emerald-50 border-emerald-200 text-emerald-900";
            alertTitle.textContent = "達成 24 期創業挑戰！";
            alertMsg.textContent = engine.gameOverReason;
        }

        if (btnNext) {
            btnNext.innerHTML = `<i data-lucide="award" class="w-4 h-4"></i> 經營已結算・登錄總成績至 Google 試算表`;
            btnNext.className = "w-full py-3 bg-indigo-600 hover:bg-indigo-700 active:scale-[0.99] text-white font-bold text-sm rounded-xl shadow-lg shadow-indigo-600/20 flex items-center justify-center gap-2 transition cursor-pointer";
        }
    } else {
        banner.classList.add('hidden');
        if (btnNext) {
            btnNext.innerHTML = `<i data-lucide="play" class="w-4 h-4 fill-white"></i> 執行當季決策並推進至下一季 (Y${currentY} Q${currentQ})`;
            btnNext.className = "w-full py-3 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white font-bold text-sm rounded-xl shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2 transition cursor-pointer";
        }
    }

    // 更新圖表與資料表
    updateCharts();
    updateTableData();

    if (window.lucide) lucide.createIcons();
}

function setText(id, text) {
    const el = document.getElementById(id);
    if (el) el.textContent = text;
}

function getVCOfferDescription(round, hasIPO) {
    switch (round) {
        case "Seed":
            return "天使輪注資 $750k，釋出 20% 股權";
        case "Series A":
            return "A 輪機構注資 $2.5M，釋出 22% 股權";
        case "Series B":
            return "B 輪擴張注資 $6.0M，釋出 18% 股權";
        case "IPO Ready":
            return "IPO 上市募資 $15M，釋出 15% 股權";
        case "Public":
            return "已正式掛牌上市公司 (Public Company)";
        default:
            return "目前尚無可用募資方案";
    }
}

// 更新圖表
function updateCharts() {
    const labels = engine.history.map(h => h.label);

    // Financials chart
    charts.financials.data.labels = labels;
    charts.financials.data.datasets[0].data = engine.history.map(h => h.revenue);
    charts.financials.data.datasets[1].data = engine.history.map(h => h.cash);
    charts.financials.data.datasets[2].data = engine.history.map(h => h.netIncome);
    charts.financials.update('none');

    // Adoption chart
    charts.adoption.data.labels = labels;
    charts.adoption.data.datasets[0].data = engine.history.map(h => h.installedBase);
    charts.adoption.data.datasets[1].data = engine.history.map(h => h.deliveries);
    charts.adoption.update('none');

    // Valuation chart
    charts.valuation.data.labels = labels;
    charts.valuation.data.datasets[0].data = engine.history.map(h => h.valuation);
    charts.valuation.data.datasets[1].data = engine.history.map(h => Math.round(h.valuation * (h.founderOwnership / 100)));
    charts.valuation.update('none');

    // Team chart
    charts.team.data.labels = labels;
    charts.team.data.datasets[0].data = engine.history.map(h => h.engineers);
    charts.team.data.datasets[1].data = engine.history.map(h => h.salespeople);
    charts.team.data.datasets[2].data = engine.history.map(h => h.productQuality);
    charts.team.update('none');
}

// 更新歷程表格
function updateTableData() {
    const tbody = document.getElementById('dataTableBody');
    if (!tbody) return;
    tbody.innerHTML = '';
    
    [...engine.history].reverse().forEach(h => {
        const tr = document.createElement('tr');
        tr.className = 'hover:bg-slate-50 transition border-b border-slate-200';
        const netClass = h.netIncome >= 0 ? 'text-emerald-600' : 'text-rose-600';
        tr.innerHTML = `
            <td class="p-2 font-bold text-slate-800">${h.label}</td>
            <td class="p-2 text-right">${h.engineers}</td>
            <td class="p-2 text-right">${h.salespeople}</td>
            <td class="p-2 text-right">${h.orders}</td>
            <td class="p-2 text-right">${h.deliveries}</td>
            <td class="p-2 text-right text-teal-700 font-bold">${h.installedBase}</td>
            <td class="p-2 text-right">$${h.productPrice.toLocaleString()}</td>
            <td class="p-2 text-right">$${h.revenue.toLocaleString()}</td>
            <td class="p-2 text-right text-slate-500">$${h.rndExpenses.toLocaleString()}</td>
            <td class="p-2 text-right font-bold ${netClass}">${h.netIncome >= 0 ? '+' : ''}$${h.netIncome.toLocaleString()}</td>
            <td class="p-2 text-right">$${h.cash.toLocaleString()}</td>
            <td class="p-2 text-right text-amber-700 font-bold">$${(h.valuation / 1e6).toFixed(2)}M</td>
            <td class="p-2 text-right">${h.founderOwnership}%</td>
        `;
        tbody.appendChild(tr);
    });
}

// 5. 頁籤切換
function switchView(viewName) {
    document.getElementById('viewCharts').classList.toggle('hidden', viewName !== 'charts');
    document.getElementById('viewTable').classList.toggle('hidden', viewName !== 'table');
    document.getElementById('viewCausal').classList.toggle('hidden', viewName !== 'causal');

    const btnCharts = document.getElementById('tabBtnCharts');
    const btnTable = document.getElementById('tabBtnTable');
    const btnCausal = document.getElementById('tabBtnCausal');

    [btnCharts, btnTable, btnCausal].forEach(btn => {
        btn.className = 'px-3.5 py-1.5 rounded-lg hover:bg-slate-100 text-slate-600 text-xs font-semibold transition';
    });

    if (viewName === 'charts') {
        btnCharts.className = 'px-3.5 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-bold transition';
    } else if (viewName === 'table') {
        btnTable.className = 'px-3.5 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-bold transition';
    } else if (viewName === 'causal') {
        btnCausal.className = 'px-3.5 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-bold transition';
    }
}

// 6. 重置模擬
function resetGame() {
    if (confirm('確定要重新創立清潔科技新創公司嗎？當前模擬數據將會重置。')) {
        engine = new CleanStartEngine();
        document.getElementById('inputPrice').value = 6500;
        document.getElementById('inputHireEng').value = 1;
        document.getElementById('inputHireSales').value = 1;
        document.getElementById('inputSalary').value = 22000;
        document.getElementById('inputOption').value = 0.05;
        document.getElementById('inputProfitShare').value = 0.05;
        document.getElementById('checkTakeVC').checked = false;

        ['inputPrice', 'inputHireEng', 'inputHireSales', 'inputSalary', 'inputOption', 'inputProfitShare'].forEach(id => {
            document.getElementById(id).dispatchEvent(new Event('input'));
        });
        updateUI();
    }
}

// 7. 匯出 CSV 報表
function exportCSV() {
    let csv = "Quarter,Period,Year,Q,Engineers,Salespeople,Orders,Deliveries,Backlog,InstalledBase,Price,Revenue,COGS,GrossProfit,RndExpenses,SalesExpenses,AdminExpenses,NetIncome,CumulativeNetIncome,Cash,Valuation,FounderOwnership_pct,VCRound,HasIPO\n";
    engine.history.forEach(h => {
        csv += `${h.quarter},${h.label},${h.year},${h.q},${h.engineers},${h.salespeople},${h.orders},${h.deliveries},${h.backlog},${h.installedBase},${h.productPrice},${h.revenue},${h.cogs},${h.grossProfit},${h.rndExpenses},${h.salesExpenses},${h.adminExpenses},${h.netIncome},${h.cumulativeNetIncome},${h.cash},${h.valuation},${h.founderOwnership},${h.vcRoundAvailable},${h.hasIPO}\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `CleanStart_Simulation_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// ==========================================
// 8. Google 試算表串接 (雙工作表架構)
// ==========================================

function loadStoredCredentials() {
    const savedUrl = localStorage.getItem(STORAGE_KEY_WEBHOOK) || "";
    const savedClass = localStorage.getItem(STORAGE_KEY_CLASS) || "";
    const savedId = localStorage.getItem(STORAGE_KEY_ID) || "";
    const savedName = localStorage.getItem(STORAGE_KEY_NAME) || "";

    const elUrl = document.getElementById('inputWebhookUrl');
    const elClass = document.getElementById('inputClass');
    const elId = document.getElementById('inputId');
    const elName = document.getElementById('inputName');

    if (elUrl) elUrl.value = savedUrl;
    if (elClass) elClass.value = savedClass;
    if (elId) elId.value = savedId;
    if (elName) elName.value = savedName;

    const btnOpen = document.getElementById('btnOpenSubmitModal');
    if (btnOpen) btnOpen.addEventListener('click', openSubmitModal);

    const btnSubmit = document.getElementById('btnSubmitScore');
    if (btnSubmit) btnSubmit.addEventListener('click', submitToGoogleSheets);
}

function openSubmitModal() {
    const modal = document.getElementById('submitModal');
    if (!modal) return;

    let currentY = 1 + Math.floor((engine.currentQuarter - 1) / 4);
    let currentQ = ((engine.currentQuarter - 1) % 4) + 1;
    let founderNetWorth = Math.round(engine.valuation * engine.founderOwnership);

    setText('modalSummaryQuarter', `第 ${Math.min(24, engine.currentQuarter)} 季 (Y${currentY} Q${currentQ}) - ${engine.isGameOver ? '創業已結算' : '進行中'}`);
    setText('modalSummaryValuation', `$${(engine.valuation / 1e6).toFixed(1)}M (創辦人身價: $${(founderNetWorth / 1e6).toFixed(1)}M, 持股 ${(engine.founderOwnership * 100).toFixed(1)}%)`);
    setText('modalSummaryInstalled', `${engine.installedBase} 套商辦 (當季單價 $${engine.productPrice.toLocaleString()})`);
    setText('modalSummaryCash', `$${Math.round(engine.cash).toLocaleString()} (累計淨利: $${Math.round(engine.cumulativeNetIncome).toLocaleString()})`);

    const msgEl = document.getElementById('submitResultMsg');
    if (msgEl) msgEl.innerHTML = '';

    modal.classList.remove('hidden');
    if (window.lucide) lucide.createIcons();
}

function closeSubmitModal() {
    const modal = document.getElementById('submitModal');
    if (modal) modal.classList.add('hidden');
}

function toggleWebhookConfig() {
    const el = document.getElementById('inputWebhookUrl');
    if (el) {
        el.focus();
        el.select();
    }
}

function submitToGoogleSheets() {
    const elUrl = document.getElementById('inputWebhookUrl');
    const elClass = document.getElementById('inputClass');
    const elId = document.getElementById('inputId');
    const elName = document.getElementById('inputName');
    const msgEl = document.getElementById('submitResultMsg');

    const webhookUrl = elUrl ? elUrl.value.trim() : "";
    const className = elClass ? elClass.value.trim() : "";
    const studentId = elId ? elId.value.trim() : "";
    const studentName = elName ? elName.value.trim() : "";

    if (!studentId || !studentName) {
        alert("請填寫「學號」與「姓名」！");
        return;
    }

    if (!webhookUrl) {
        alert("尚未填寫 Google Apps Script Webhook 網址！\n請先依據指引在 Google 試算表部署 Web 應用程式並貼上網址。");
        if (elUrl) elUrl.focus();
        return;
    }

    // 儲存於 LocalStorage
    localStorage.setItem(STORAGE_KEY_WEBHOOK, webhookUrl);
    localStorage.setItem(STORAGE_KEY_CLASS, className);
    localStorage.setItem(STORAGE_KEY_ID, studentId);
    localStorage.setItem(STORAGE_KEY_NAME, studentName);

    let founderNetWorthM = Number(((engine.valuation * engine.founderOwnership) / 1e6).toFixed(2));
    let finalValuationM = Number((engine.valuation / 1e6).toFixed(2));

    // 打包工作表 2 所需之 24 季歷程
    const quarterlyLogs = engine.history.map(r => ({
        quarter: r.quarter,
        label: r.label,
        year: r.year,
        q: r.q,
        engineers: r.engineers,
        salespeople: r.salespeople,
        morale: r.morale,
        productQuality: r.productQuality,
        unitCost: r.unitCost,
        productPrice: r.productPrice,
        orders: r.orders,
        deliveries: r.deliveries,
        backlog: r.backlog,
        installedBase: r.installedBase,
        marketAwareness: r.marketAwareness,
        revenue: r.revenue,
        cogs: r.cogs,
        grossProfit: r.grossProfit,
        rndExpenses: r.rndExpenses,
        salesExpenses: r.salesExpenses,
        adminExpenses: r.adminExpenses,
        netIncome: r.netIncome,
        cumulativeNetIncome: r.cumulativeNetIncome,
        cash: r.cash,
        valuation: r.valuation,
        founderOwnership: r.founderOwnership,
        vcRoundAvailable: r.vcRoundAvailable,
        hasIPO: r.hasIPO
    }));

    const payload = {
        summary: {
            className: className,
            studentId: studentId,
            studentName: studentName,
            finalValuationM: finalValuationM,
            founderNetWorthM: founderNetWorthM,
            founderOwnership: Number((engine.founderOwnership * 100).toFixed(1)),
            installedBase: engine.installedBase,
            cumulativeNetIncome: Math.round(engine.cumulativeNetIncome),
            cash: Math.round(engine.cash),
            hasIPO: engine.hasIPO,
            isBankrupt: engine.cash < -20000,
            isWon: engine.currentQuarter >= engine.maxQuarters && engine.cash >= 0,
            gameOverReason: engine.gameOverReason || "模擬進行中提交",
            totalLoggedQuarters: quarterlyLogs.length
        },
        yearlyLogs: quarterlyLogs,
        quarterlyLogs: quarterlyLogs
    };

    if (msgEl) {
        msgEl.innerHTML = '<span class="text-blue-600 font-semibold flex items-center justify-center gap-1"><i data-lucide="loader-2" class="w-4 h-4 animate-spin"></i> 正在批次傳輸經營成果與 24 季明細至 Google 試算表...</span>';
        if (window.lucide) lucide.createIcons();
    }

    const btnSubmit = document.getElementById('btnSubmitScore');
    if (btnSubmit) btnSubmit.disabled = true;

    fetch(webhookUrl, {
        method: "POST",
        mode: "no-cors", // 跨網域回傳，防止 CORS 阻擋
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
    })
    .then(() => {
        if (msgEl) {
            msgEl.innerHTML = '<span class="text-emerald-700 font-bold flex items-center justify-center gap-1.5 bg-emerald-50 py-2 rounded-lg border border-emerald-200">✅ 成績與 24 季營運明細已成功登錄至 Google 試算表雙工作表！</span>';
        }
        if (btnSubmit) btnSubmit.disabled = false;
        setTimeout(() => {
            closeSubmitModal();
        }, 2200);
    })
    .catch(err => {
        console.error("Submission failed:", err);
        if (msgEl) {
            msgEl.innerHTML = '<span class="text-rose-600 font-semibold">❌ 連線失敗，請檢查 Apps Script Webhook 網址是否正確部署為「所有人」皆可存取。</span>';
        }
        if (btnSubmit) btnSubmit.disabled = false;
    });
}
