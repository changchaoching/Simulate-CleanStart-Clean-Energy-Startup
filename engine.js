/**
 * CleanStart: Simulating a Clean Energy Startup (24-Quarter Edition)
 * Simulation Core Engine
 * Based on MIT Sloan (Prof. John Sterman, David Miller, Joe Hsueh)
 */

class CleanStartEngine {
    constructor() {
        this.reset();
    }

    reset() {
        this.currentQuarter = 1;
        this.maxQuarters = 24; // 完整 24 期 (6 年完整創業週期)
        this.isGameOver = false;
        this.gameOverReason = "";
        this.hasIPO = false;

        // ---- 1. 人力資本 (Human Resources) ----
        this.engineers = 3;                // 初期研發工程師 (人)
        this.salespeople = 1;              // 初期業務銷售人員 (人)
        this.engineerProductivity = 1.0;   // 研發工程師平均生產力 (基準 1.0)
        this.salesProductivity = 1.0;      // 業務人員銷售力 (基準 1.0)
        this.staffMorale = 1.0;            // 員工綜合士氣 (0.2 ~ 1.5)
        this.turnoverRate = 0.03;          // 季自然離職率 3%

        // 薪資與激勵政策 (Compensation Policy)
        this.marketSalary = 24000;         // 市場基準季薪 ($24k / 季，約年薪 $96k)
        this.actualSalary = 20000;         // 實際發放季薪 ($)
        this.stockOptionRate = 0.05;       // 股票選擇權比例 (0% ~ 20%)
        this.profitSharingRate = 0.05;     // 利潤分享比例 (0% ~ 20%)

        // ---- 2. 技術與產品研發 (Technology & Products) ----
        this.cumulativeRndPoints = 10;     // 累計研發點數
        this.productQuality = 1.0;         // 產品性能/品質指標 (基準 1.0)
        this.unitProductionCost = 3200;    // 單位硬體安裝成本 ($/套)

        // ---- 3. 市場行銷與客戶安裝 (Market & Customers) ----
        this.productPrice = 6500;          // 產品/系統單價 ($/套)
        this.competitorPrice = 7200;       // 傳統競爭者單價 ($/套)
        this.marketAwareness = 0.15;       // 市場知名度 (0.0 ~ 1.0)
        
        // 當季運營產出
        this.installedBase = 15;           // 累計已安裝商辦/建築數量 (套)
        this.quarterlyOrders = 10;         // 當季新增訂單 (套)
        this.backlog = 0;                  // 待交付訂單
        this.quarterlyDeliveries = 10;     // 當季實際完工交付 (套)

        // ---- 4. 股權與募資結構 (Financing & Equity) ----
        this.founderShares = 1000000;      // 創辦人股數 (1,000,000 股)
        this.employeeOptionPool = 100000;  // 員工期權池股數
        this.vcShares = 0;                 // 創投 (VC) 股數
        this.totalShares = 1100000;        // 總發行股份
        this.founderOwnership = 0.909;     // 創辦人持股比例 (~90.9%)
        
        this.vcRoundAvailable = "Seed";    // 可用融資輪次: Seed -> Series A -> Series B -> IPO
        this.valuation = 2000000;          // 當前公司估值 ($2M)

        // ---- 5. 財務報表 (Financials, USD) ----
        this.cash = 450000;                // 初期天使/自籌現金 ($450,000)
        this.revenue = 0;                  // 季營收 ($)
        this.cogs = 0;                     // 銷貨成本 (COGS)
        this.grossProfit = 0;              // 毛利
        this.rndExpenses = 0;              // 研發人事與材料支出
        this.salesExpenses = 0;            // 業務人事與推廣支出
        this.adminExpenses = 12000;        // 行政固定管銷
        this.netIncome = 0;                // 當季淨利
        this.cumulativeNetIncome = 0;      // 累計淨利
        this.burnRate = 0;                 // 當季現金消耗率 (Burn Rate)

        // 初始化財務數值
        this.calculateFinancials(0, 0, false);

        // 歷史記錄
        this.history = [];
        this.recordHistory();
    }

    /**
     * 計算當期財務 (內部輔助)
     */
    calculateFinancials(newEngHired, newSalesHired, takeVCFunding) {
        // 營收 = 當季交付套數 * 單價
        this.revenue = this.quarterlyDeliveries * this.productPrice;

        // 銷貨成本 = 交付套數 * 單位製造成本
        this.cogs = this.quarterlyDeliveries * this.unitProductionCost;
        this.grossProfit = this.revenue - this.cogs;

        // 薪資計算 (底薪 + 利潤分享分紅)
        let totalStaff = this.engineers + this.salespeople;
        let baseSalaryPayout = totalStaff * this.actualSalary;
        let profitSharePayout = this.grossProfit > 0 ? (this.grossProfit * this.profitSharingRate) : 0;

        // 研發支出 = 工程師薪資 + 測試材料與雲端伺服器 (每工程師約 $2,500/季)
        let engSalaryRatio = this.engineers / Math.max(1, totalStaff);
        this.rndExpenses = (baseSalaryPayout + profitSharePayout) * engSalaryRatio + this.engineers * 2500;

        // 銷售費用 = 業務薪資 + 客戶差旅與展示推廣 (每業務約 $3,000/季)
        let salesSalaryRatio = this.salespeople / Math.max(1, totalStaff);
        this.salesExpenses = (baseSalaryPayout + profitSharePayout) * salesSalaryRatio + this.salespeople * 3000;

        // 管理固定管銷
        this.adminExpenses = 12000 + totalStaff * 800;

        let totalOperatingExpenses = this.rndExpenses + this.salesExpenses + this.adminExpenses;
        this.netIncome = this.grossProfit - totalOperatingExpenses;
        this.cumulativeNetIncome += this.netIncome;

        // 現金消耗或淨流入
        let netCashFlow = this.netIncome;

        // 招聘新人的簽約費用 ($4,000/人)
        let hiringCosts = (Math.max(0, newEngHired) + Math.max(0, newSalesHired)) * 4000;
        netCashFlow -= hiringCosts;

        // 處理 VC 融資注入
        let fundingInflow = 0;
        if (takeVCFunding) {
            fundingInflow = this.executeFundingRound();
            netCashFlow += fundingInflow;
        }

        this.cash += netCashFlow;
        this.burnRate = netCashFlow < 0 ? Math.abs(netCashFlow) : 0;

        // 估值更新 (年化營收倍數 + 產品技術點數 + 獲利溢價)
        let annualizedRevenue = this.revenue * 4;
        let growthMultiple = Math.max(2.5, Math.min(10.0, 3.0 + (this.quarterlyOrders / Math.max(1, this.installedBase)) * 3.0));
        let techAssetVal = this.cumulativeRndPoints * 20000;
        let profitBonus = this.netIncome > 0 ? this.netIncome * 8.0 : 0;
        let estimatedVal = Math.max(1200000, annualizedRevenue * growthMultiple + techAssetVal + profitBonus + Math.max(0, this.cash));
        this.valuation = Math.round(this.valuation * 0.7 + estimatedVal * 0.3);
    }

    /**
     * 執行融資輪次 (VC Equity Financing)
     */
    executeFundingRound() {
        let amount = 0;
        let dilutionRate = 0.20;

        if (this.vcRoundAvailable === "Seed") {
            amount = 750000; // $750k Seed Round
            dilutionRate = 0.20;
            this.vcRoundAvailable = "Series A";
        } else if (this.vcRoundAvailable === "Series A") {
            amount = 2500000; // $2.5M Series A
            dilutionRate = 0.22;
            this.vcRoundAvailable = "Series B";
        } else if (this.vcRoundAvailable === "Series B") {
            amount = 6000000; // $6.0M Series B
            dilutionRate = 0.18;
            this.vcRoundAvailable = "IPO Ready";
        } else if (this.vcRoundAvailable === "IPO Ready" && !this.hasIPO) {
            amount = 15000000; // $15M IPO proceeds
            dilutionRate = 0.15;
            this.hasIPO = true;
            this.vcRoundAvailable = "Public";
        }

        if (amount > 0) {
            let newShares = Math.round(this.totalShares * (dilutionRate / (1 - dilutionRate)));
            this.vcShares += newShares;
            this.totalShares += newShares;
            this.founderOwnership = this.founderShares / this.totalShares;
        }

        return amount;
    }

    /**
     * 每季決策推進 (Quarterly Simulation Step)
     * @param {Object} decisions 
     */
    step(decisions) {
        if (this.isGameOver) return;

        // 1. 取得並校驗決策
        this.productPrice = Math.max(3000, Math.min(15000, Number(decisions.productPrice) || 6500));
        let hireEng = Math.max(-10, Math.min(25, Number(decisions.hireEngineers) || 0));
        let hireSales = Math.max(-10, Math.min(25, Number(decisions.hireSalespeople) || 0));
        this.actualSalary = Math.max(12000, Math.min(45000, Number(decisions.salaryOffer) || 20000));
        this.stockOptionRate = Math.max(0.0, Math.min(0.20, Number(decisions.stockOptionRate) || 0.05));
        this.profitSharingRate = Math.max(0.0, Math.min(0.20, Number(decisions.profitSharingRate) || 0.05));
        let takeVCFunding = Boolean(decisions.takeVCFunding);

        // 2. 人員編制更新
        this.engineers = Math.max(1, this.engineers + hireEng);
        this.salespeople = Math.max(1, this.salespeople + hireSales);

        // 薪資激勵度與士氣模型 (Compensation & Morale)
        let salaryRatio = this.actualSalary / this.marketSalary;
        let compensationIncentive = (salaryRatio * 0.5) + (this.stockOptionRate * 3.5) + (this.profitSharingRate * 2.5);
        let targetMorale = Math.max(0.2, Math.min(1.5, compensationIncentive));
        this.staffMorale = this.staffMorale * 0.7 + targetMorale * 0.3;

        // 離職率 (士氣低時離職率增高)
        let currentTurnover = this.turnoverRate * (1.6 - 0.6 * this.staffMorale);
        let engDepartures = Math.round(this.engineers * currentTurnover);
        let salesDepartures = Math.round(this.salespeople * currentTurnover);
        this.engineers = Math.max(1, this.engineers - engDepartures);
        this.salespeople = Math.max(1, this.salespeople - salesDepartures);

        // 3. 研發進度與技術突破 (R&D & Product Quality)
        let quarterlyRndOutput = this.engineers * this.engineerProductivity * this.staffMorale;
        this.cumulativeRndPoints += quarterlyRndOutput;
        
        // 產品效能品質
        this.productQuality = 1.0 + Math.log10(1 + this.cumulativeRndPoints / 12.0);

        // 製造學習曲線 (規模經濟降低單位成本: 每翻倍累計安裝，成本下降約 14%)
        let experienceCurve = Math.pow(Math.max(10, this.installedBase) / 10.0, -0.20);
        this.unitProductionCost = Math.max(1600, Math.round(3200 * experienceCurve));

        // 4. 市場競爭、知名度與訂單獲取 (Sales & Customer Acquisition)
        let salesOutreach = this.salespeople * this.salesProductivity * this.staffMorale;
        this.marketAwareness = Math.min(0.95, this.marketAwareness * 0.90 + (salesOutreach * 0.012) + (this.installedBase * 0.0006));

        // 價格競爭力
        let priceAttractiveness = Math.pow(this.competitorPrice / this.productPrice, 1.3);
        
        // 節能品質吸引力
        let qualityAttractiveness = Math.pow(this.productQuality, 1.25);

        // 當季新接建築訂單數
        let potentialMarket = 150 + this.currentQuarter * 10;
        let baseNewOrders = Math.round(potentialMarket * this.marketAwareness * priceAttractiveness * qualityAttractiveness * (salesOutreach / (salesOutreach + 3)));
        this.quarterlyOrders = Math.max(1, baseNewOrders);

        // 交付履約能力
        let maxInstallationCapacity = Math.round(this.engineers * 8.5 + this.salespeople * 4.0 + (this.installedBase * 0.05));
        let totalPending = this.quarterlyOrders + this.backlog;
        this.quarterlyDeliveries = Math.min(totalPending, maxInstallationCapacity);
        this.backlog = Math.max(0, totalPending - this.quarterlyDeliveries);
        this.installedBase += this.quarterlyDeliveries;

        // 5. 結算財務與估值
        this.calculateFinancials(hireEng, hireSales, takeVCFunding);

        // 6. 勝負與破產判定 (確保支援執行完整 24 期)
        if (this.cash < -20000) {
            this.isGameOver = true;
            this.gameOverReason = `【宣告破產 (Insolvent)】第 ${this.currentQuarter} 季現金枯竭 ($${Math.round(this.cash).toLocaleString()})！新創公司無力支付員工薪資與零件貨款，被迫清算倒閉！`;
        } else if (this.currentQuarter >= this.maxQuarters) {
            this.isGameOver = true;
            let founderNetWorth = Math.round(this.valuation * this.founderOwnership);
            let ipoTag = this.hasIPO ? "且已成功上市 (Public)" : (this.cumulativeNetIncome > 0 ? "且穩健獲利" : "");
            this.gameOverReason = `【完成完整 24 期 (6年) 創業挑戰】達成第 24 季營運！累積安裝商辦: ${this.installedBase} 套，公司最終估值: $${(this.valuation / 1e6).toFixed(1)}M，創辦人持股身價: $${(founderNetWorth / 1e6).toFixed(1)}M (${(this.founderOwnership * 100).toFixed(1)}%) ${ipoTag}！`;
        }

        // 7. 推進季度並記錄歷史
        this.currentQuarter++;
        this.recordHistory();
    }

    recordHistory() {
        let year = 1 + Math.floor((this.currentQuarter - 1) / 4);
        let q = ((this.currentQuarter - 1) % 4) + 1;
        let periodLabel = `Y${year} Q${q}`;

        this.history.push({
            quarter: this.currentQuarter,
            label: periodLabel,
            year: year,
            q: q,
            engineers: this.engineers,
            salespeople: this.salespeople,
            totalStaff: this.engineers + this.salespeople,
            morale: Math.round(this.staffMorale * 100) / 100,
            productQuality: Math.round(this.productQuality * 100) / 100,
            unitCost: this.unitProductionCost,
            productPrice: this.productPrice,
            orders: this.quarterlyOrders,
            deliveries: this.quarterlyDeliveries,
            installedBase: this.installedBase,
            marketAwareness: Math.round(this.marketAwareness * 1000) / 10,
            revenue: Math.round(this.revenue),
            cogs: Math.round(this.cogs),
            grossProfit: Math.round(this.grossProfit),
            rndExpenses: Math.round(this.rndExpenses),
            salesExpenses: Math.round(this.salesExpenses),
            netIncome: Math.round(this.netIncome),
            cash: Math.round(this.cash),
            valuation: Math.round(this.valuation),
            founderOwnership: Math.round(this.founderOwnership * 1000) / 10,
            vcRoundAvailable: this.vcRoundAvailable,
            hasIPO: this.hasIPO
        });
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = CleanStartEngine;
}
