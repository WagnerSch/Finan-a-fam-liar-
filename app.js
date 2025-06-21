// Controle Financeiro Familiar - JavaScript App
class FinancialController {
    constructor() {
        this.transactions = this.loadData('transactions') || [];
        this.categories = this.loadData('categories') || this.getDefaultCategories();
        this.currentEditingTransaction = null;
        this.currentEditingCategory = null;
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadCategories();
        this.updateDashboard();
        this.loadTransactions();
        this.setupCharts();
        this.setCurrentDate();
    }

    // Data Management
    saveData(key, data) {
        localStorage.setItem(key, JSON.stringify(data));
    }

    loadData(key) {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : null;
    }

    getDefaultCategories() {
        return [
            { id: 1, name: 'Salário', type: 'receita', icon: 'fas fa-briefcase', color: '#16a34a' },
            { id: 2, name: 'Freelance', type: 'receita', icon: 'fas fa-laptop', color: '#059669' },
            { id: 3, name: 'Investimentos', type: 'receita', icon: 'fas fa-chart-line', color: '#0d9488' },
            { id: 4, name: 'Alimentação', type: 'despesa', icon: 'fas fa-utensils', color: '#dc2626' },
            { id: 5, name: 'Transporte', type: 'despesa', icon: 'fas fa-car', color: '#ea580c' },
            { id: 6, name: 'Moradia', type: 'despesa', icon: 'fas fa-home', color: '#d97706' },
            { id: 7, name: 'Saúde', type: 'despesa', icon: 'fas fa-heart', color: '#c2410c' },
            { id: 8, name: 'Educação', type: 'despesa', icon: 'fas fa-graduation-cap', color: '#b91c1c' },
            { id: 9, name: 'Lazer', type: 'despesa', icon: 'fas fa-gamepad', color: '#991b1b' }
        ];
    }

    // Event Listeners
    setupEventListeners() {
        // Navigation
        document.getElementById('navToggle').addEventListener('click', this.toggleMobileNav);
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', (e) => this.handleNavigation(e));
        });

        // Transaction Modal
        document.getElementById('addTransactionBtn').addEventListener('click', () => this.openTransactionModal());
        document.getElementById('addTransactionBtn2').addEventListener('click', () => this.openTransactionModal());
        document.getElementById('closeTransactionModal').addEventListener('click', () => this.closeTransactionModal());
        document.getElementById('cancelTransaction').addEventListener('click', () => this.closeTransactionModal());
        document.getElementById('transactionForm').addEventListener('submit', (e) => this.handleTransactionSubmit(e));

        // Category Modal
        document.getElementById('addCategoryBtn').addEventListener('click', () => this.openCategoryModal());
        document.getElementById('closeCategoryModal').addEventListener('click', () => this.closeCategoryModal());
        document.getElementById('cancelCategory').addEventListener('click', () => this.closeCategoryModal());
        document.getElementById('categoryForm').addEventListener('submit', (e) => this.handleCategorySubmit(e));

        // Filters
        document.getElementById('filterType').addEventListener('change', () => this.applyFilters());
        document.getElementById('filterCategory').addEventListener('change', () => this.applyFilters());
        document.getElementById('filterPeriod').addEventListener('change', () => this.applyFilters());
        document.getElementById('periodSelect').addEventListener('change', () => this.updateDashboard());

        // Transaction Type Change
        document.getElementById('transactionType').addEventListener('change', () => this.updateCategoryOptions());

        // Close modals on outside click
        window.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                this.closeAllModals();
            }
        });
    }

    // Navigation
    toggleMobileNav() {
        const navMenu = document.getElementById('navMenu');
        navMenu.classList.toggle('active');
    }

    handleNavigation(e) {
        e.preventDefault();
        const targetSection = e.target.closest('.nav-link').dataset.section;
        
        // Update active nav link
        document.querySelectorAll('.nav-link').forEach(link => link.classList.remove('active'));
        e.target.closest('.nav-link').classList.add('active');
        
        // Show target section
        document.querySelectorAll('.section').forEach(section => section.classList.remove('active'));
        document.getElementById(targetSection).classList.add('active');
        
        // Close mobile nav
        document.getElementById('navMenu').classList.remove('active');
    }

    // Transaction Management
    openTransactionModal(transaction = null) {
        this.currentEditingTransaction = transaction;
        const modal = document.getElementById('transactionModal');
        const title = document.getElementById('transactionModalTitle');
        const form = document.getElementById('transactionForm');
        
        if (transaction) {
            title.textContent = 'Editar Transação';
            this.populateTransactionForm(transaction);
        } else {
            title.textContent = 'Nova Transação';
            form.reset();
            this.setCurrentDate();
        }
        
        this.updateCategoryOptions();
        modal.classList.add('active');
    }

    closeTransactionModal() {
        document.getElementById('transactionModal').classList.remove('active');
        this.currentEditingTransaction = null;
    }

    populateTransactionForm(transaction) {
        document.getElementById('transactionType').value = transaction.type;
        document.getElementById('transactionDescription').value = transaction.description;
        document.getElementById('transactionCategory').value = transaction.categoryId;
        document.getElementById('transactionValue').value = transaction.value;
        document.getElementById('transactionDate').value = transaction.date;
    }

    handleTransactionSubmit(e) {
        e.preventDefault();
        
        const formData = {
            type: document.getElementById('transactionType').value,
            description: document.getElementById('transactionDescription').value,
            categoryId: parseInt(document.getElementById('transactionCategory').value),
            value: parseFloat(document.getElementById('transactionValue').value),
            date: document.getElementById('transactionDate').value
        };

        if (this.currentEditingTransaction) {
            this.updateTransaction(this.currentEditingTransaction.id, formData);
        } else {
            this.addTransaction(formData);
        }

        this.closeTransactionModal();
    }

    addTransaction(data) {
        const transaction = {
            id: Date.now(),
            ...data,
            createdAt: new Date().toISOString()
        };

        this.transactions.push(transaction);
        this.saveData('transactions', this.transactions);
        this.updateDashboard();
        this.loadTransactions();
        this.updateCharts();
    }

    updateTransaction(id, data) {
        const index = this.transactions.findIndex(t => t.id === id);
        if (index !== -1) {
            this.transactions[index] = { ...this.transactions[index], ...data };
            this.saveData('transactions', this.transactions);
            this.updateDashboard();
            this.loadTransactions();
            this.updateCharts();
        }
    }

    deleteTransaction(id) {
        if (confirm('Tem certeza que deseja excluir esta transação?')) {
            this.transactions = this.transactions.filter(t => t.id !== id);
            this.saveData('transactions', this.transactions);
            this.updateDashboard();
            this.loadTransactions();
            this.updateCharts();
        }
    }

    // Category Management
    openCategoryModal(category = null) {
        this.currentEditingCategory = category;
        const modal = document.getElementById('categoryModal');
        const form = document.getElementById('categoryForm');
        
        if (category) {
            this.populateCategoryForm(category);
        } else {
            form.reset();
            document.getElementById('categoryColor').value = '#2563eb';
        }
        
        modal.classList.add('active');
    }

    closeCategoryModal() {
        document.getElementById('categoryModal').classList.remove('active');
        this.currentEditingCategory = null;
    }

    populateCategoryForm(category) {
        document.getElementById('categoryName').value = category.name;
        document.getElementById('categoryType').value = category.type;
        document.getElementById('categoryIcon').value = category.icon;
        document.getElementById('categoryColor').value = category.color;
    }

    handleCategorySubmit(e) {
        e.preventDefault();
        
        const formData = {
            name: document.getElementById('categoryName').value,
            type: document.getElementById('categoryType').value,
            icon: document.getElementById('categoryIcon').value,
            color: document.getElementById('categoryColor').value
        };

        if (this.currentEditingCategory) {
            this.updateCategory(this.currentEditingCategory.id, formData);
        } else {
            this.addCategory(formData);
        }

        this.closeCategoryModal();
    }

    addCategory(data) {
        const category = {
            id: Date.now(),
            ...data
        };

        this.categories.push(category);
        this.saveData('categories', this.categories);
        this.loadCategories();
        this.updateCategoryOptions();
    }

    updateCategory(id, data) {
        const index = this.categories.findIndex(c => c.id === id);
        if (index !== -1) {
            this.categories[index] = { ...this.categories[index], ...data };
            this.saveData('categories', this.categories);
            this.loadCategories();
            this.updateCategoryOptions();
        }
    }

    deleteCategory(id) {
        if (confirm('Tem certeza que deseja excluir esta categoria?')) {
            this.categories = this.categories.filter(c => c.id !== id);
            this.saveData('categories', this.categories);
            this.loadCategories();
            this.updateCategoryOptions();
        }
    }

    // UI Updates
    updateCategoryOptions() {
        const type = document.getElementById('transactionType').value;
        const categorySelect = document.getElementById('transactionCategory');
        const filterCategorySelect = document.getElementById('filterCategory');
        
        // Clear options
        categorySelect.innerHTML = '<option value="">Selecione</option>';
        filterCategorySelect.innerHTML = '<option value="">Todas</option>';
        
        // Add filtered categories
        const filteredCategories = type ? this.categories.filter(c => c.type === type) : this.categories;
        
        filteredCategories.forEach(category => {
            const option = document.createElement('option');
            option.value = category.id;
            option.textContent = category.name;
            categorySelect.appendChild(option);
        });

        // Add all categories to filter
        this.categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category.id;
            option.textContent = category.name;
            filterCategorySelect.appendChild(option);
        });
    }

    setCurrentDate() {
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('transactionDate').value = today;
    }

    closeAllModals() {
        document.querySelectorAll('.modal').forEach(modal => {
            modal.classList.remove('active');
        });
    }

    // Dashboard Updates
    updateDashboard() {
        const period = document.getElementById('periodSelect').value;
        const filteredTransactions = this.getTransactionsByPeriod(period);
        
        const receitas = filteredTransactions.filter(t => t.type === 'receita');
        const despesas = filteredTransactions.filter(t => t.type === 'despesa');
        
        const totalReceitas = receitas.reduce((sum, t) => sum + t.value, 0);
        const totalDespesas = despesas.reduce((sum, t) => sum + t.value, 0);
        const saldo = totalReceitas - totalDespesas;
        const economia = saldo > 0 ? saldo : 0;
        
        // Update summary cards
        document.getElementById('totalReceitas').textContent = this.formatCurrency(totalReceitas);
        document.getElementById('totalDespesas').textContent = this.formatCurrency(totalDespesas);
        document.getElementById('saldoAtual').textContent = this.formatCurrency(saldo);
        document.getElementById('totalEconomia').textContent = this.formatCurrency(economia);
        
        // Update progress bars and percentages
        const orcadoReceitas = 5000; // Exemplo de orçamento
        const orcadoDespesas = 4000;
        const metaEconomia = 1000;
        
        document.getElementById('orcadoReceitas').textContent = this.formatCurrency(orcadoReceitas);
        document.getElementById('orcadoDespesas').textContent = this.formatCurrency(orcadoDespesas);
        document.getElementById('metaEconomia').textContent = this.formatCurrency(metaEconomia);
        
        const percentReceitas = Math.min((totalReceitas / orcadoReceitas) * 100, 100);
        const percentDespesas = Math.min((totalDespesas / orcadoDespesas) * 100, 100);
        const percentEconomia = Math.min((economia / metaEconomia) * 100, 100);
        
        document.getElementById('progressReceitas').style.width = `${percentReceitas}%`;
        document.getElementById('progressDespesas').style.width = `${percentDespesas}%`;
        document.getElementById('percentReceitas').textContent = `${Math.round(percentReceitas)}%`;
        document.getElementById('percentDespesas').textContent = `${Math.round(percentDespesas)}%`;
        document.getElementById('percentEconomia').textContent = `${Math.round(percentEconomia)}%`;
        
        // Update status
        const statusSaldo = document.getElementById('statusSaldo');
        if (saldo > 0) {
            statusSaldo.textContent = 'Situação positiva';
            statusSaldo.className = 'meta-text text-success';
        } else if (saldo < 0) {
            statusSaldo.textContent = 'Situação negativa';
            statusSaldo.className = 'meta-text text-danger';
        } else {
            statusSaldo.textContent = 'Situação equilibrada';
            statusSaldo.className = 'meta-text';
        }
        
        this.loadRecentTransactions();
        this.updateCharts();
    }

    getTransactionsByPeriod(period) {
        const now = new Date();
        let startDate;
        
        switch (period) {
            case 'mes':
                startDate = new Date(now.getFullYear(), now.getMonth(), 1);
                break;
            case 'trimestre':
                startDate = new Date(now.getFullYear(), now.getMonth() - 2, 1);
                break;
            case 'ano':
                startDate = new Date(now.getFullYear(), 0, 1);
                break;
            default:
                startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        }
        
        return this.transactions.filter(t => new Date(t.date) >= startDate);
    }

    loadRecentTransactions() {
        const recentTransactions = this.transactions
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .slice(0, 5);
        
        const container = document.getElementById('recentTransactionsList');
        
        if (recentTransactions.length === 0) {
            container.innerHTML = '<p class="text-center" style="color: #64748b; padding: 2rem;">Nenhuma transação encontrada</p>';
            return;
        }
        
        container.innerHTML = recentTransactions.map(transaction => {
            const category = this.categories.find(c => c.id === transaction.categoryId);
            return `
                <div class="transaction-item">
                    <div class="transaction-info">
                        <div class="transaction-description">${transaction.description}</div>
                        <div class="transaction-meta">
                            ${category ? category.name : 'Sem categoria'} • ${this.formatDate(transaction.date)}
                        </div>
                    </div>
                    <div class="transaction-amount ${transaction.type}">
                        ${transaction.type === 'receita' ? '+' : '-'}${this.formatCurrency(transaction.value)}
                    </div>
                </div>
            `;
        }).join('');
    }

    // Transactions Table
    loadTransactions() {
        const tbody = document.getElementById('transactionsTableBody');
        const filteredTransactions = this.applyFilters();
        
        if (filteredTransactions.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" class="text-center">Nenhuma transação encontrada</td></tr>';
            return;
        }
        
        tbody.innerHTML = filteredTransactions.map(transaction => {
            const category = this.categories.find(c => c.id === transaction.categoryId);
            return `
                <tr>
                    <td>${this.formatDate(transaction.date)}</td>
                    <td>${transaction.description}</td>
                    <td>${category ? category.name : 'Sem categoria'}</td>
                    <td><span class="transaction-type ${transaction.type}">${transaction.type}</span></td>
                    <td class="transaction-value ${transaction.type}">
                        ${transaction.type === 'receita' ? '+' : '-'}${this.formatCurrency(transaction.value)}
                    </td>
                    <td>
                        <div class="action-buttons">
                            <button class="btn btn-sm btn-edit" onclick="app.openTransactionModal(${JSON.stringify(transaction).replace(/"/g, '&quot;')})">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="btn btn-sm btn-delete" onclick="app.deleteTransaction(${transaction.id})">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        }).join('');
    }

    applyFilters() {
        const typeFilter = document.getElementById('filterType').value;
        const categoryFilter = document.getElementById('filterCategory').value;
        const periodFilter = document.getElementById('filterPeriod').value;
        
        let filtered = [...this.transactions];
        
        if (typeFilter) {
            filtered = filtered.filter(t => t.type === typeFilter);
        }
        
        if (categoryFilter) {
            filtered = filtered.filter(t => t.categoryId === parseInt(categoryFilter));
        }
        
        if (periodFilter) {
            const [year, month] = periodFilter.split('-');
            filtered = filtered.filter(t => {
                const transactionDate = new Date(t.date);
                return transactionDate.getFullYear() === parseInt(year) && 
                       transactionDate.getMonth() === parseInt(month) - 1;
            });
        }
        
        // Sort by date (newest first)
        filtered.sort((a, b) => new Date(b.date) - new Date(a.date));
        
        // Update table
        this.loadTransactions = () => {
            const tbody = document.getElementById('transactionsTableBody');
            
            if (filtered.length === 0) {
                tbody.innerHTML = '<tr><td colspan="6" class="text-center">Nenhuma transação encontrada</td></tr>';
                return;
            }
            
            tbody.innerHTML = filtered.map(transaction => {
                const category = this.categories.find(c => c.id === transaction.categoryId);
                return `
                    <tr>
                        <td>${this.formatDate(transaction.date)}</td>
                        <td>${transaction.description}</td>
                        <td>${category ? category.name : 'Sem categoria'}</td>
                        <td><span class="transaction-type ${transaction.type}">${transaction.type}</span></td>
                        <td class="transaction-value ${transaction.type}">
                            ${transaction.type === 'receita' ? '+' : '-'}${this.formatCurrency(transaction.value)}
                        </td>
                        <td>
                            <div class="action-buttons">
                                <button class="btn btn-sm btn-edit" onclick="app.openTransactionModal(${JSON.stringify(transaction).replace(/"/g, '&quot;')})">
                                    <i class="fas fa-edit"></i>
                                </button>
                                <button class="btn btn-sm btn-delete" onclick="app.deleteTransaction(${transaction.id})">
                                    <i class="fas fa-trash"></i>
                                </button>
                            </div>
                        </td>
                    </tr>
                `;
            }).join('');
        };
        
        this.loadTransactions();
        return filtered;
    }

    // Categories Display
    loadCategories() {
        const container = document.getElementById('categoriesGrid');
        
        if (this.categories.length === 0) {
            container.innerHTML = '<p class="text-center">Nenhuma categoria encontrada</p>';
            return;
        }
        
        container.innerHTML = this.categories.map(category => {
            const categoryTransactions = this.transactions.filter(t => t.categoryId === category.id);
            const total = categoryTransactions.reduce((sum, t) => sum + t.value, 0);
            const count = categoryTransactions.length;
            
            return `
                <div class="category-card" style="--category-color: ${category.color}">
                    <div class="category-header">
                        <div class="category-icon" style="background-color: ${category.color}">
                            <i class="${category.icon}"></i>
                        </div>
                        <div>
                            <div class="category-name">${category.name}</div>
                            <div style="font-size: 0.875rem; color: #64748b;">${category.type}</div>
                        </div>
                    </div>
                    <div class="category-stats">
                        <span>${count} transações</span>
                        <span class="text-${category.type === 'receita' ? 'success' : 'danger'}">${this.formatCurrency(total)}</span>
                    </div>
                    <div class="action-buttons" style="margin-top: 1rem;">
                        <button class="btn btn-sm btn-edit" onclick="app.openCategoryModal(${JSON.stringify(category).replace(/"/g, '&quot;')})">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-sm btn-delete" onclick="app.deleteCategory(${category.id})">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            `;
        }).join('');
    }

    // Charts
    setupCharts() {
        this.evolutionChart = null;
        this.categoryChart = null;
        this.comparisonChart = null;
        this.expensesByCategoryChart = null;
        
        this.updateCharts();
    }

    updateCharts() {
        this.updateEvolutionChart();
        this.updateCategoryChart();
        this.updateComparisonChart();
        this.updateExpensesByCategoryChart();
    }

    updateEvolutionChart() {
        const ctx = document.getElementById('evolutionChart');
        if (!ctx) return;
        
        if (this.evolutionChart) {
            this.evolutionChart.destroy();
        }
        
        const monthlyData = this.getMonthlyData();
        
        this.evolutionChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: monthlyData.labels,
                datasets: [
                    {
                        label: 'Receitas',
                        data: monthlyData.receitas,
                        backgroundColor: '#16a34a',
                        borderColor: '#16a34a',
                        borderWidth: 1
                    },
                    {
                        label: 'Despesas',
                        data: monthlyData.despesas,
                        backgroundColor: '#dc2626',
                        borderColor: '#dc2626',
                        borderWidth: 1
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'top',
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return 'R$ ' + value.toLocaleString('pt-BR');
                            }
                        }
                    }
                }
            }
        });
    }

    updateCategoryChart() {
        const ctx = document.getElementById('categoryChart');
        if (!ctx) return;
        
        if (this.categoryChart) {
            this.categoryChart.destroy();
        }
        
        const categoryData = this.getCategoryData();
        
        this.categoryChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: categoryData.labels,
                datasets: [{
                    data: categoryData.values,
                    backgroundColor: categoryData.colors,
                    borderWidth: 2,
                    borderColor: '#ffffff'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                    }
                }
            }
        });
    }

    updateComparisonChart() {
        const ctx = document.getElementById('comparisonChart');
        if (!ctx) return;
        
        if (this.comparisonChart) {
            this.comparisonChart.destroy();
        }
        
        const monthlyData = this.getMonthlyData();
        
        this.comparisonChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: monthlyData.labels,
                datasets: [
                    {
                        label: 'Receitas',
                        data: monthlyData.receitas,
                        borderColor: '#16a34a',
                        backgroundColor: 'rgba(22, 163, 74, 0.1)',
                        fill: true,
                        tension: 0.4
                    },
                    {
                        label: 'Despesas',
                        data: monthlyData.despesas,
                        borderColor: '#dc2626',
                        backgroundColor: 'rgba(220, 38, 38, 0.1)',
                        fill: true,
                        tension: 0.4
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'top',
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return 'R$ ' + value.toLocaleString('pt-BR');
                            }
                        }
                    }
                }
            }
        });
    }

    updateExpensesByCategoryChart() {
        const ctx = document.getElementById('expensesByCategoryChart');
        if (!ctx) return;
        
        if (this.expensesByCategoryChart) {
            this.expensesByCategoryChart.destroy();
        }
        
        const expenseCategories = this.getExpenseCategoryData();
        
        this.expensesByCategoryChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: expenseCategories.labels,
                datasets: [{
                    label: 'Despesas por Categoria',
                    data: expenseCategories.values,
                    backgroundColor: expenseCategories.colors,
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return 'R$ ' + value.toLocaleString('pt-BR');
                            }
                        }
                    }
                }
            }
        });
    }

    // Chart Data Helpers
    getMonthlyData() {
        const months = [];
        const receitas = [];
        const despesas = [];
        
        // Get last 6 months
        for (let i = 5; i >= 0; i--) {
            const date = new Date();
            date.setMonth(date.getMonth() - i);
            
            const monthName = date.toLocaleDateString('pt-BR', { month: 'short' });
            months.push(monthName);
            
            const monthTransactions = this.transactions.filter(t => {
                const transactionDate = new Date(t.date);
                return transactionDate.getMonth() === date.getMonth() && 
                       transactionDate.getFullYear() === date.getFullYear();
            });
            
            const monthReceitas = monthTransactions
                .filter(t => t.type === 'receita')
                .reduce((sum, t) => sum + t.value, 0);
            
            const monthDespesas = monthTransactions
                .filter(t => t.type === 'despesa')
                .reduce((sum, t) => sum + t.value, 0);
            
            receitas.push(monthReceitas);
            despesas.push(monthDespesas);
        }
        
        return { labels: months, receitas, despesas };
    }

    getCategoryData() {
        const categoryTotals = {};
        const categoryColors = {};
        
        this.transactions.forEach(transaction => {
            const category = this.categories.find(c => c.id === transaction.categoryId);
            if (category) {
                if (!categoryTotals[category.name]) {
                    categoryTotals[category.name] = 0;
                    categoryColors[category.name] = category.color;
                }
                categoryTotals[category.name] += transaction.value;
            }
        });
        
        const labels = Object.keys(categoryTotals);
        const values = Object.values(categoryTotals);
        const colors = labels.map(label => categoryColors[label]);
        
        return { labels, values, colors };
    }

    getExpenseCategoryData() {
        const categoryTotals = {};
        const categoryColors = {};
        
        this.transactions
            .filter(t => t.type === 'despesa')
            .forEach(transaction => {
                const category = this.categories.find(c => c.id === transaction.categoryId);
                if (category) {
                    if (!categoryTotals[category.name]) {
                        categoryTotals[category.name] = 0;
                        categoryColors[category.name] = category.color;
                    }
                    categoryTotals[category.name] += transaction.value;
                }
            });
        
        const labels = Object.keys(categoryTotals);
        const values = Object.values(categoryTotals);
        const colors = labels.map(label => categoryColors[label]);
        
        return { labels, values, colors };
    }

    // Utility Functions
    formatCurrency(value) {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(value);
    }

    formatDate(dateString) {
        return new Date(dateString).toLocaleDateString('pt-BR');
    }
}

// Initialize the application
const app = new FinancialController();

// Add some sample data for demonstration
if (app.transactions.length === 0) {
    const sampleTransactions = [
        {
            id: 1,
            type: 'receita',
            description: 'Salário',
            categoryId: 1,
            value: 3500,
            date: '2024-12-01',
            createdAt: new Date().toISOString()
        },
        {
            id: 2,
            type: 'despesa',
            description: 'Supermercado',
            categoryId: 4,
            value: 450,
            date: '2024-12-02',
            createdAt: new Date().toISOString()
        },
        {
            id: 3,
            type: 'despesa',
            description: 'Combustível',
            categoryId: 5,
            value: 200,
            date: '2024-12-03',
            createdAt: new Date().toISOString()
        },
        {
            id: 4,
            type: 'receita',
            description: 'Freelance',
            categoryId: 2,
            value: 800,
            date: '2024-12-04',
            createdAt: new Date().toISOString()
        },
        {
            id: 5,
            type: 'despesa',
            description: 'Aluguel',
            categoryId: 6,
            value: 1200,
            date: '2024-12-05',
            createdAt: new Date().toISOString()
        }
    ];
    
    app.transactions = sampleTransactions;
    app.saveData('transactions', app.transactions);
    app.updateDashboard();
    app.loadTransactions();
}

