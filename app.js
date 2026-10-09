/**
 * CleanStart Web Simulator UI & Application Controller
 */

let engine = new CleanStartEngine();
let charts = {};

document.addEventListener("DOMContentLoaded", () => {
    lucide.createIcons();
    initCharts();
    bindInputs();
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

    // (C) 公司估值與創辦人資產
    const ctxVal = document.getElementById('chartValuation').getContext('2d');
    charts.valuation = new Chart(ctxVal, {
        type: 'line',
        data: {
            labels: [],
            datasets: [
                {
                    label: '公司總估值 ($)',
                    data: [],
                    borderColor: '#14b8a6',
                    borderWidth: 2.5,
                    tension: 0.2
                },
                {
                    label: '創辦人持股價值 ($)',
                    data: [],
                    borderColor: '#f59e0b',
                    borderWidth: 2,
                    tension: 0.2
                }
            ]
        },
        options: commonOptions
    });

    // (D) 團隊規模與技術品質
    const ctxTeam = document.getElementById('chartTeam').getContext('2d');
    charts.team = new Chart(ctxTeam, {
        type: 'line',
        data: {
            labels: [],
            datasets: [
                {
                    label: '工程師人數 (人)',
                    data: [],
                    borderColor: '#3b82f6',
                    yAxisID: 'y',
                    borderWidth: 2,
                    tension: 0.2
                },
                {
                    label: '業務銷售人數 (人)',
                    data: [],
                    borderColor: '#f97316',
                    yAxisID: 'y',
                    borderWidth: 2,
                    tension: 0.2
                },
                {
                    label: '節能產品效能評等',
                    data: [],
                    borderColor: '#a855f7',
                    yAxisID: 'y1',
                    borderWidth: 1.5,
                    borderDash: [4, 4],
                    tension: 0.2
                }
            ]
        },
        options: {
            ...commonOptions,
            scales: {
                ...commonOptions.scales,
                y1: {
                    position: 'right',
                    grid: { drawOnChartArea: false },
                    ticks: { color: '#a855f7', font: { size: 9, family: 'JetBrains Mono' } }
                }
            }
        }
    });
}

// 2. 綁定滑桿與輸入監聽
function bindInputs() {
    const inputs = [
        { id: 'inputPrice', valId: 'valPrice', format: (v) => `$${Number(v).toLocaleString()}` },
        { id: 'inputHireEng', valId: 'valHireEng', format: (v) => `${Number(v) >= 0 ? '+' : ''}${v} 人` },
        { id: 'inputHireSales', valId: 'valHireSales', format: (v) => `${Number(v) >= 0 ? '+' : ''}${v} 人` },
        { id: 'inputSalary', valId: 'valSalary', format: (v) => `$${Number(v).toLocaleString()}` },
        { id: 'inputOption', valId: 'valOption', format: (v) => `${(Number(v) * 100).toFixed(1)}%` },
        { id: 'inputProfitShare', valId: 'valProfitShare', format: (v) => `${(Number(v) * 100).toFixed(1)}%` }
    ];

    inputs.forEach(({ id, valId, format }) => {
        const el = document.getElementById(id);
        const valEl = document.getElementById(valId);
        el.addEventListener('input', () => {
            valEl.textContent = format(el.value);
        });
    });
}

// 微調按鈕
function adjustValue(type, delta) {
    if (engine.isGameOver) return;
    const map = {
        price: { id: 'inputPrice', valId: 'valPrice', format: (v) => `$${Number(v).toLocaleString()}`, min: 3500, max: 12000 },
        hireEng: { id: 'inputHireEng', valId: 'valHireEng', format: (v) => `${Number(v) >= 0 ? '+' : ''}${v} 人`, min: -3, max: 10 },
        hireSales: { id: 'inputHireSales', valId: 'valHireSales', format: (v) => `${Number(v) >= 0 ? '+' : ''}${v} 人`, min: -3, max: 10 },
        salary: { id: 'inputSalary', valId: 'valSalary', format: (v) => `$${Number(v).toLocaleString()}`, min: 15000, max: 35000 }
    };

    const target = map[type];
    const el = document.getElementById(target.id);
    let newVal = parseFloat(el.value) + delta;
    newVal = Math.max(target.min, Math.min(target.max, newVal));
    el.value = newVal;
    document.getElementById(target.valId).textContent = target.format(newVal);
}

// 策略預設 (Presets)
function applyPreset(name) {
    if (engine.isGameOver) return;
    if (name === 'bootstrap') {
        // 自力更生模式: 控制薪資、小步快跑、不拿VC
        document.getElementById('inputPrice').value = 6800;
        document.getElementById('inputHireEng').value = 1;
        document.getElementById('inputHireSales').value = 1;
        document.getElementById('inputSalary').value = 20000;
        document.getElementById('inputOption').value = 0.08;
        document.getElementById('inputProfitShare').value = 0.08;
        document.getElementById('checkTakeVC').checked = false;
    } else if (name === 'vcscale') {
        // 創投激進擴張: 爭取高融資、大舉招聘研發與銷售衝刺估值
        document.getElementById('inputPrice').value = 6200;
        document.getElementById('inputHireEng').value = 3;
        document.getElementById('inputHireSales').value = 2;
        document.getElementById('inputSalary').value = 25000;
        document.getElementById('inputOption').value = 0.10;
        document.getElementById('inputProfitShare').value = 0.03;
        document.getElementById('checkTakeVC').checked = true;
    }

    ['inputPrice', 'inputHireEng', 'inputHireSales', 'inputSalary', 'inputOption', 'inputProfitShare'].forEach(id => {
        document.getElementById(id).dispatchEvent(new Event('input'));
    });
}

// 3. 推進模擬
function runNextQuarter() {
    if (engine.isGameOver) return;

    const decisions = {
        productPrice: parseFloat(document.getElementById('inputPrice').value),
        hireEngineers: parseInt(document.getElementById('inputHireEng').value),
        hireSalespeople: parseInt(document.getElementById('inputHireSales').value),
        salaryOffer: parseFloat(document.getElementById('inputSalary').value),
        stockOptionRate: parseFloat(document.getElementById('inputOption').value),
        profitSharingRate: parseFloat(document.getElementById('inputProfitShare').value),
        takeVCFunding: document.getElementById('checkTakeVC').checked
    };

    engine.step(decisions);
    // 重置融資勾選
    document.getElementById('checkTakeVC').checked = false;
    updateUI();
}

function runMultipleQuarters(count) {
    for (let i = 0; i < count; i++) {
        if (engine.isGameOver) break;
        runNextQuarter();
    }
}

// 4. 更新介面
function updateUI() {
    const cur = engine.history[engine.history.length - 1];

    // Header KPIs
    document.getElementById('kpiQuarter').textContent = cur.label;
    document.getElementById('kpiQuarterNum').textContent = cur.quarter;
    document.getElementById('kpiCash').textContent = `$${Math.round(cur.cash).toLocaleString()}`;
    document.getElementById('kpiCash').className = cur.cash < 0 ? 'font-bold text-red-400 text-sm' : 'font-bold text-emerald-400 text-sm';
    document.getElementById('kpiValuation').textContent = `$${(cur.valuation / 1e6).toFixed(2)}M`;
    document.getElementById('kpiOwnership').textContent = `${cur.founderOwnership}%`;

    // Cockpit Info
    document.getElementById('currentEngCount').textContent = cur.engineers;
    document.getElementById('currentSalesCount').textContent = cur.salespeople;

    // VC Offer Info
    const badge = document.getElementById('vcRoundBadge');
    const desc = document.getElementById('vcOfferDescription');
    const chk = document.getElementById('checkTakeVC');
    badge.textContent = cur.vcRoundAvailable;

    if (cur.vcRoundAvailable === "Seed") {
        desc.innerHTML = '可向種子投資人融資 <strong class="text-white">$750,000</strong>，預估釋出 <strong>20%</strong> 股份。';
        chk.disabled = false;
    } else if (cur.vcRoundAvailable === "Series A") {
        desc.innerHTML = '已達成市場驗證！可啟動 Series A 融資 <strong class="text-white">$2,500,000</strong>，預估稀釋 <strong>22%</strong>。';
        chk.disabled = false;
    } else if (cur.vcRoundAvailable === "Series B") {
        desc.innerHTML = '營運快速擴張！可啟動 Series B 融資 <strong class="text-white">$6,000,000</strong>，預估稀釋 <strong>18%</strong>。';
        chk.disabled = false;
    } else if (cur.vcRoundAvailable === "IPO Ready") {
        desc.innerHTML = '具備公開上市門檻！可執行 IPO 募集 <strong class="text-white">$15,000,000</strong> 公開資金。';
        chk.disabled = false;
    } else {
        desc.innerHTML = '公司已成功於公開市場交易 (Public Company)！';
        chk.disabled = true;
    }

    // Diagnostics
    let quarterlyBurn = cur.netIncome < 0 ? Math.abs(cur.netIncome) : 0;
    let runwayMonths = quarterlyBurn > 0 ? (cur.cash / quarterlyBurn) * 3.0 : 99.0;
    document.getElementById('diagRunway').textContent = runwayMonths > 50 ? '正現金流' : runwayMonths.toFixed(1);
    const runwayStatus = document.getElementById('diagRunwayStatus');
    if (runwayMonths >= 12 || quarterlyBurn === 0) {
        runwayStatus.textContent = '資金充裕安全';
        runwayStatus.className = 'text-[10px] text-emerald-400 mt-0.5';
    } else if (runwayMonths >= 6) {
        runwayStatus.textContent = '需注意融資窗口';
        runwayStatus.className = 'text-[10px] text-amber-400 mt-0.5';
    } else {
        runwayStatus.textContent = '現金即將見底 (急需注資!)';
        runwayStatus.className = 'text-[10px] text-red-400 font-bold mt-0.5';
    }

    document.getElementById('diagMorale').textContent = cur.morale.toFixed(2);
    const moraleStatus = document.getElementById('diagMoraleStatus');
    if (cur.morale >= 0.9) {
        moraleStatus.textContent = '士氣高昂專注';
        moraleStatus.className = 'text-[10px] text-emerald-400 mt-0.5';
    } else if (cur.morale >= 0.6) {
        moraleStatus.textContent = '有離職跳槽隱憂';
        moraleStatus.className = 'text-[10px] text-amber-400 mt-0.5';
    } else {
        moraleStatus.textContent = '團隊潰散嚴重';
        moraleStatus.className = 'text-[10px] text-red-400 font-bold mt-0.5';
    }

    document.getElementById('diagQuality').textContent = cur.productQuality.toFixed(2);
    document.getElementById('diagUnitCost').textContent = cur.unitCost.toLocaleString();
    let margin = Math.round(((cur.productPrice - cur.unitCost) / cur.productPrice) * 100);
    document.getElementById('diagMargin').textContent = `${margin}%`;

    // Cards
    document.getElementById('cardOrders').innerHTML = `${cur.deliveries} <span class="text-xs text-slate-500 font-normal">套 (訂單: ${cur.orders})</span>`;
    document.getElementById('cardInstalledBase').textContent = cur.installedBase;
    document.getElementById('cardRevenue').textContent = `$${cur.revenue.toLocaleString()}`;
    document.getElementById('cardGrossProfit').textContent = `$${cur.grossProfit.toLocaleString()}`;
    document.getElementById('cardNetIncome').textContent = `${cur.netIncome >= 0 ? '+' : ''}$${cur.netIncome.toLocaleString()}`;
    document.getElementById('cardNetIncome').className = cur.netIncome >= 0 ? 'font-mono font-bold text-xl text-emerald-400 mt-1.5' : 'font-mono font-bold text-xl text-red-400 mt-1.5';
    document.getElementById('cardBurnRate').textContent = cur.netIncome < 0 ? `$${Math.round(Math.abs(cur.netIncome) / 1000)}k/季` : '淨現金流入';
    let founderNetVal = Math.round(cur.valuation * (cur.founderOwnership / 100));
    document.getElementById('cardFounderValue').textContent = `$${(founderNetVal / 1e6).toFixed(2)}M`;
    document.getElementById('cardOwnership').textContent = `${cur.founderOwnership}%`;

    // Alert Banner
    const alertBanner = document.getElementById('gameAlertBanner');
    const btnRun = document.getElementById('btnRunQuarter');
    if (engine.isGameOver) {
        alertBanner.classList.remove('hidden');
        btnRun.disabled = true;
        btnRun.classList.add('opacity-50', 'cursor-not-allowed');

        if (engine.cash < -20000) {
            alertBanner.className = 'p-4 rounded-2xl border border-red-500/50 bg-red-950/60 text-red-200 transition-all shadow-xl';
            document.getElementById('alertIcon').innerHTML = '<i data-lucide="alert-octagon" class="w-5 h-5 text-red-400"></i>';
            document.getElementById('alertTitle').textContent = '新創失敗：宣告倒閉！';
        } else if (engine.hasIPO) {
            alertBanner.className = 'p-4 rounded-2xl border border-emerald-500/50 bg-emerald-950/60 text-emerald-200 transition-all shadow-xl';
            document.getElementById('alertIcon').innerHTML = '<i data-lucide="trophy" class="w-5 h-5 text-emerald-400"></i>';
            document.getElementById('alertTitle').textContent = '敲鐘上市：達成 IPO 成就！';
        } else {
            alertBanner.className = 'p-4 rounded-2xl border border-teal-500/50 bg-teal-950/60 text-teal-200 transition-all shadow-xl';
            document.getElementById('alertIcon').innerHTML = '<i data-lucide="check-circle" class="w-5 h-5 text-teal-400"></i>';
            document.getElementById('alertTitle').textContent = '營運週期結束：成功度過 6 年考驗！';
        }
        document.getElementById('alertMessage').textContent = engine.gameOverReason;
        lucide.createIcons();
    } else {
        alertBanner.classList.add('hidden');
        btnRun.disabled = false;
        btnRun.classList.remove('opacity-50', 'cursor-not-allowed');
    }

    // 更新圖表與表格
    updateChartData();
    updateTableData();
}

function updateChartData() {
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

function updateTableData() {
    const tbody = document.getElementById('dataTableBody');
    tbody.innerHTML = '';
    
    [...engine.history].reverse().forEach(h => {
        const tr = document.createElement('tr');
        tr.className = 'hover:bg-slate-800/40 transition';
        const netClass = h.netIncome >= 0 ? 'text-emerald-400' : 'text-red-400';
        tr.innerHTML = `
            <td class="p-2 font-bold text-slate-200 border-b border-slate-800/60">${h.label}</td>
            <td class="p-2 text-right border-b border-slate-800/60">${h.engineers}</td>
            <td class="p-2 text-right border-b border-slate-800/60">${h.salespeople}</td>
            <td class="p-2 text-right border-b border-slate-800/60">${h.orders}</td>
            <td class="p-2 text-right border-b border-slate-800/60">${h.deliveries}</td>
            <td class="p-2 text-right border-b border-slate-800/60 text-teal-400 font-bold">${h.installedBase}</td>
            <td class="p-2 text-right border-b border-slate-800/60">$${h.productPrice.toLocaleString()}</td>
            <td class="p-2 text-right border-b border-slate-800/60">$${h.revenue.toLocaleString()}</td>
            <td class="p-2 text-right border-b border-slate-800/60 text-slate-500">$${h.rndExpenses.toLocaleString()}</td>
            <td class="p-2 text-right border-b border-slate-800/60 font-bold ${netClass}">${h.netIncome >= 0 ? '+' : ''}$${h.netIncome.toLocaleString()}</td>
            <td class="p-2 text-right border-b border-slate-800/60">$${h.cash.toLocaleString()}</td>
            <td class="p-2 text-right border-b border-slate-800/60 text-amber-400 font-bold">$${(h.valuation / 1e6).toFixed(2)}M</td>
            <td class="p-2 text-right border-b border-slate-800/60">${h.founderOwnership}%</td>
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
        btn.className = 'px-3.5 py-1.5 rounded-lg hover:bg-slate-800 text-slate-400 text-xs font-semibold transition';
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
    if (confirm('確定要重新創立新創公司嗎？當前模擬數據將會重置。')) {
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
    let csv = "Quarter,Period,Year,Q,Engineers,Salespeople,Orders,Deliveries,InstalledBase,Price,Revenue,COGS,GrossProfit,RndExpenses,SalesExpenses,NetIncome,Cash,Valuation,FounderOwnership_pct,VCRound,HasIPO\n";
    engine.history.forEach(h => {
        csv += `${h.quarter},${h.label},${h.year},${h.q},${h.engineers},${h.salespeople},${h.orders},${h.deliveries},${h.installedBase},${h.productPrice},${h.revenue},${h.cogs},${h.grossProfit},${h.rndExpenses},${h.salesExpenses},${h.netIncome},${h.cash},${h.valuation},${h.founderOwnership},${h.vcRoundAvailable},${h.hasIPO}\n`;
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
