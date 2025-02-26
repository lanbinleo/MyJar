// 等待页面完全加载和Chart.js库加载完成
document.addEventListener('DOMContentLoaded', function () {
    // 检查Chart.js是否已加载
    const checkChartJs = () => {
        if (typeof Chart !== 'undefined') {
            initApp();
        } else {
            setTimeout(checkChartJs, 100);
        }
    };

    checkChartJs();
});

function initApp() {
    // 初始化数据
    let tasks = JSON.parse(localStorage.getItem('efficiencyTasks')) || [];
    let totalPoints = tasks.reduce((sum, task) => sum + task.points, 0);

    // DOM元素
    const taskForm = document.getElementById('task-form');
    const taskList = document.getElementById('task-list');
    const totalPointsEl = document.querySelector('#total-points span');
    const weightInput = document.getElementById('weight');
    const difficultyInput = document.getElementById('difficulty');
    const timeInput = document.getElementById('time');
    const completionInput = document.getElementById('completion');
    const pointsPreview = document.getElementById('points-preview');
    const weightValue = document.getElementById('weight-value');
    const difficultyValue = document.getElementById('difficulty-value');
    const completionValue = document.getElementById('completion-value');
    const clearTasksBtn = document.getElementById('clear-tasks');
    const exportDataBtn = document.getElementById('export-data');
    const importDataBtn = document.getElementById('import-data');
    const totalTasksEl = document.getElementById('total-tasks');
    const totalTimeEl = document.getElementById('total-time');
    const avgDifficultyEl = document.getElementById('avg-difficulty');
    const avgCompletionEl = document.getElementById('avg-completion');
    // 商城相关DOM元素
    const productsContainer = document.getElementById('products-container');
    const addProductBtn = document.getElementById('add-product');
    const productModal = document.getElementById('product-modal');
    const productForm = document.getElementById('product-form');
    const purchaseModal = document.getElementById('purchase-modal');
    const btnPurchase = document.getElementById('btn-purchase');
    const btnUse = document.getElementById('btn-use');

    // 在DOM元素部分添加（在现有变量声明后）
    const syncDataBtn = document.getElementById('sync-data');
    const userIdInput = document.getElementById('user-id');
    const userIdForm = document.getElementById('user-id-form');
    const userIdDisplay = document.getElementById('user-id-display');
    const userIdValue = document.getElementById('user-id-value');
    const changeUserBtn = document.getElementById('change-user');

    // 用户ID存储
    let userId = localStorage.getItem('efficiencyUserId') || '';
    // 最后同步时间
    let lastSyncTime = localStorage.getItem('efficiencyLastSync') || '';

    // 关闭按钮
    const closeButtons = document.querySelectorAll('.close');

    // 商品数据
    let products = JSON.parse(localStorage.getItem('efficiencyProducts')) || [];
    let selectedProduct = null;

    // 初始化图表
    let pointsChart, taskDistributionChart;

    // 计算积分
    function calculatePoints() {
        const weight = parseInt(weightInput.value);
        const difficulty = parseInt(difficultyInput.value);
        const time = parseInt(timeInput.value);
        const completion = parseInt(completionInput.value);

        // 积分计算公式: (权重 * 难度 * 时间 / 10) * (完成度 / 100)
        const maxPoints = (weight * difficulty * time / 10);
        const actualPoints = Math.round(maxPoints * (completion / 100));

        return actualPoints;
    }

    // 更新预览积分
    function updatePointsPreview() {
        const points = calculatePoints();
        pointsPreview.textContent = points;

        // 更新滑块值显示
        weightValue.textContent = weightInput.value;
        difficultyValue.textContent = difficultyInput.value;
        completionValue.textContent = `${completionInput.value}%`;
    }

    // 渲染任务列表
    function renderTasks() {
        taskList.innerHTML = '';

        if (tasks.length === 0) {
            taskList.innerHTML = '<div style="text-align: center; padding: 20px; color: var(--gray-dark);">暂无任务记录</div>';
            return;
        }

        // 按日期降序排序
        const sortedTasks = [...tasks].sort((a, b) => new Date(b.date) - new Date(a.date));

        // 只显示最近的10个任务
        const recentTasks = sortedTasks.slice(0, 10);

        recentTasks.forEach(task => {
            // 修改后：
            const taskEl = document.createElement('div');
            taskEl.className = 'task-item'; // 添加基础样式类
            // 根据任务类型设置不同样式
            console.log(task.points);
            if (task.points < 0) {
                taskEl.className += ' purchase'; // 注意空格
            } else if (task.points > 0) {
                taskEl.className += ' task'; // 注意空格
            } else {
                taskEl.className += ' usage'; // 注意空格
            }

            const date = new Date(task.date);
            const formattedDate = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;

            taskEl.innerHTML = `
        <div class="task-header">
          <h3>${task.title}</h3>
          <div class="task-points">${task.points > 0 ? '+' : ''}${task.points == 0 ? '✔' : task.points}</div>
        </div>
        <div class="task-description">${task.description}</div>
        <div class="task-meta">
          <span>权重: ${task.weight}</span>
          <span>难度: ${task.difficulty}</span>
          <span>时长: ${task.time}分钟</span>
          <span>完成度: ${task.completion}%</span>
          <span>日期: ${formattedDate}</span>
        </div>
      `;

            taskList.appendChild(taskEl);
        });
        // 打开添加商品模态框
        addProductBtn.addEventListener('click', () => {
            productForm.reset();
            productModal.style.display = 'block';
        });

        // 关闭所有模态框
        closeButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                productModal.style.display = 'none';
                purchaseModal.style.display = 'none';
            });
        });

        // 点击模态框外部关闭
        window.addEventListener('click', (e) => {
            if (e.target === productModal) {
                productModal.style.display = 'none';
            }
            if (e.target === purchaseModal) {
                purchaseModal.style.display = 'none';
            }
        });

        // 添加商品表单处理
        productForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const name = document.getElementById('product-name').value;
            const description = document.getElementById('product-description').value;
            const points = parseInt(document.getElementById('product-points').value);
            const quantity = parseInt(document.getElementById('product-quantity').value);

            const newProduct = {
                id: Date.now(),
                name,
                description,
                points,
                quantity
            };

            products.push(newProduct);
            saveProducts();
            renderProducts();

            productModal.style.display = 'none';
        });

        // 商品购买和使用按钮
        btnPurchase.addEventListener('click', purchaseProduct);
        btnUse.addEventListener('click', useProduct);

        // 在初始化应用部分添加
        renderProducts();
    }

    // 更新数据摘要
    function updateSummary() {
        totalPointsEl.textContent = totalPoints;
        totalTasksEl.textContent = tasks.length;

        if (tasks.length === 0) {
            totalTimeEl.textContent = '0';
            avgDifficultyEl.textContent = '0';
            avgCompletionEl.textContent = '0%';
            return;
        }

        const totalTime = tasks.reduce((sum, task) => sum + task.time, 0);
        const avgDifficulty = (tasks.reduce((sum, task) => sum + task.difficulty, 0) / tasks.length).toFixed(1);
        const avgCompletion = Math.round(tasks.reduce((sum, task) => sum + task.completion, 0) / tasks.length);

        totalTimeEl.textContent = totalTime;
        avgDifficultyEl.textContent = avgDifficulty;
        avgCompletionEl.textContent = `${avgCompletion}%`;
    }

    // 初始化图表
    function initCharts() {
        // 确保Canvas元素存在
        const pointsChartCanvas = document.getElementById('points-chart');
        const taskDistributionCanvas = document.getElementById('task-distribution');

        if (!pointsChartCanvas || !taskDistributionCanvas) {
            console.error('图表Canvas元素不存在');
            return;
        }

        // 积分趋势图
        pointsChart = new Chart(pointsChartCanvas, {
            type: 'line',
            data: {
                labels: [],
                datasets: [{
                    label: '积分变化',
                    data: [],
                    borderColor: '#4A6BF5',
                    backgroundColor: 'rgba(74, 107, 245, 0.1)',
                    fill: true,
                    tension: 0.4
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
                        beginAtZero: true
                    }
                }
            }
        });

        // 任务分布图
        taskDistributionChart = new Chart(taskDistributionCanvas, {
            type: 'doughnut',
            data: {
                labels: ['低难度 (1-3)', '中等难度 (4-7)', '高难度 (8-10)'],
                datasets: [{
                    data: [0, 0, 0],
                    backgroundColor: ['#4AC29A', '#F5C14A', '#F54A4A'],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                }
            }
        });
    }

    // 更新图表
    function updateCharts() {
        if (!pointsChart || !taskDistributionChart) {
            console.error('图表未初始化');
            return;
        }

        // 积分趋势图数据
        const sortedTasks = [...tasks].sort((a, b) => new Date(a.date) - new Date(b.date));
        let cumulativePoints = 0;
        const labels = [];
        const data = [];

        sortedTasks.forEach(task => {
            const date = new Date(task.date);
            const formattedDate = `${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;

            cumulativePoints += task.points;

            labels.push(formattedDate);
            data.push(cumulativePoints);
        });

        // 更新积分趋势图
        pointsChart.data.labels = labels;
        pointsChart.data.datasets[0].data = data;
        pointsChart.update();

        // 任务分布图数据
        const lowDifficulty = tasks.filter(task => task.difficulty >= 1 && task.difficulty <= 3).length;
        const mediumDifficulty = tasks.filter(task => task.difficulty >= 4 && task.difficulty <= 7).length;
        const highDifficulty = tasks.filter(task => task.difficulty >= 8 && task.difficulty <= 10).length;

        // 更新任务分布图
        taskDistributionChart.data.datasets[0].data = [lowDifficulty, mediumDifficulty, highDifficulty];
        taskDistributionChart.update();
    }

    // 保存数据到 localStorage
    function saveData() {
        localStorage.setItem('efficiencyTasks', JSON.stringify(tasks));
    }

    // 保存商品数据到 localStorage
    function saveProducts() {
        localStorage.setItem('efficiencyProducts', JSON.stringify(products));
    }

    // 渲染商品列表
    function renderProducts() {
        productsContainer.innerHTML = '';

        if (products.length === 0) {
            productsContainer.innerHTML = '<div style="text-align: center; padding: 20px; color: var(--gray-dark); grid-column: 1/-1;">暂无商品</div>';
            return;
        }

        products.forEach(product => {
            const productEl = document.createElement('div');
            productEl.className = 'product-card';
            productEl.dataset.id = product.id;

            // 判断是否可用（库存 > 0）
            const isAvailable = product.quantity > 0;

            productEl.innerHTML = `
        ${isAvailable
                    ? '<div class="status-badge status-available">可用</div>'
                    : '<div class="status-badge status-unavailable">缺货</div>'}
        <div class="product-name">${product.name}</div>
        <div class="product-description">${product.description}</div>
        <div class="product-meta">
          <div class="product-points">${product.points}积分</div>
          <div class="product-quantity">库存: ${product.quantity}</div>
        </div>
      `;

            productEl.addEventListener('click', () => openPurchaseModal(product));

            productsContainer.appendChild(productEl);
        });
    }

    // 打开商品购买/使用模态框
    function openPurchaseModal(product) {
        selectedProduct = product;

        const productDetails = document.getElementById('product-details');
        productDetails.innerHTML = `
      <h3>${product.name}</h3>
      <p>${product.description}</p>
      <div style="margin: 15px 0;">
        <div>所需积分: <strong>${product.points}</strong></div>
        <div>库存数量: <strong>${product.quantity}</strong></div>
        <div>当前积分: <strong>${totalPoints}</strong></div>
      </div>
    `;

        // 根据当前状态启用/禁用按钮
        const canPurchase = totalPoints >= product.points;
        const canUse = product.quantity > 0;

        btnPurchase.disabled = !canPurchase;
        btnUse.disabled = !canUse;

        if (!canPurchase) {
            btnPurchase.style.opacity = '0.5';
            btnPurchase.title = '积分不足';
        } else {
            btnPurchase.style.opacity = '1';
            btnPurchase.title = '';
        }

        if (!canUse) {
            btnUse.style.opacity = '0.5';
            btnUse.title = '库存不足';
        } else {
            btnUse.style.opacity = '1';
            btnUse.title = '';
        }

        purchaseModal.style.display = 'block';
    }

    // 购买商品
    function purchaseProduct() {
        if (!selectedProduct) return;

        if (totalPoints < selectedProduct.points) {
            alert('积分不足，无法购买！');
            return;
        }

        // 创建扣除积分的任务记录
        const newTask = {
            id: Date.now(),
            title: `购买商品: ${selectedProduct.name}`,
            description: `使用积分购买了商品`,
            weight: 0,
            difficulty: 0,
            time: 0,
            completion: 100,
            points: -selectedProduct.points, // 负分表示扣除积分
            date: new Date().toISOString(),
            type: 'purchase' // 添加类型标记
        };

        tasks.push(newTask);
        totalPoints -= selectedProduct.points;

        // 增加商品库存
        const productIndex = products.findIndex(p => p.id === selectedProduct.id);
        if (productIndex !== -1) {
            products[productIndex].quantity += 1;
        }

        saveData();
        saveProducts();
        renderTasks();
        renderProducts();
        updateSummary();
        updateCharts();

        alert('购买成功！');
        purchaseModal.style.display = 'none';
    }

    // 使用商品
    function useProduct() {
        if (!selectedProduct) return;

        if (selectedProduct.quantity <= 0) {
            alert('库存不足，无法使用！');
            return;
        }

        // 创建使用商品的记录
        const newTask = {
            id: Date.now(),
            title: `使用商品: ${selectedProduct.name}`,
            description: `使用了库存商品`,
            weight: 0,
            difficulty: 0,
            time: 0,
            completion: 100,
            points: 0, // 使用不消耗积分
            date: new Date().toISOString(),
            type: 'usage' // 添加类型标记
        };

        tasks.push(newTask);

        // 减少商品库存
        const productIndex = products.findIndex(p => p.id === selectedProduct.id);
        if (productIndex !== -1) {
            products[productIndex].quantity -= 1;
        }

        saveData();
        saveProducts();
        renderTasks();
        renderProducts();

        alert('使用成功！');
        purchaseModal.style.display = 'none';
    }

    function saveUserId(id) {
        userId = id;
        localStorage.setItem('efficiencyUserId', id);
        updateUserIdDisplay();
    }

    // 更新用户ID显示
    function updateUserIdDisplay() {
        if (userId) {
            userIdDisplay.style.display = 'block';
            userIdValue.textContent = userId;
            userIdForm.style.display = 'none';
            syncDataBtn.disabled = false;
        } else {
            userIdDisplay.style.display = 'none';
            userIdForm.style.display = 'block';
            syncDataBtn.disabled = true;
        }
    }

    // 同步数据到服务器
    async function syncDataToServer() {
        if (!userId) {
            alert('请先设置用户ID');
            return;
        }

        try {
            const syncData = {
                tasks: tasks,
                products: products,
                timestamp: new Date().toISOString()
            };

            const response = await fetch(`http://localhost:8000/${userId}/save`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(syncData)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || '同步失败');
            }

            const result = await response.json();
            lastSyncTime = syncData.timestamp;
            localStorage.setItem('efficiencyLastSync', lastSyncTime);

            alert(`同步成功: ${result.message}`);
            updateSyncStatus();

        } catch (error) {
            alert(`同步出错: ${error.message}`);
            console.error('同步错误:', error);
        }
    }

    // 从服务器获取数据
    async function fetchDataFromServer() {
        if (!userId) {
            alert('请先设置用户ID');
            return;
        }

        try {
            const response = await fetch(`http://localhost:8000/${userId}/get`);

            if (!response.ok) {
                if (response.status === 404) {
                    alert('未找到远程数据，将上传本地数据');
                    await syncDataToServer();
                    return;
                }
                const errorData = await response.json();
                throw new Error(errorData.detail || '获取数据失败');
            }

            const data = await response.json();

            if (confirm('是否要用服务器数据替换本地数据？')) {
                tasks = data.tasks || [];
                products = data.products || [];
                totalPoints = tasks.reduce((sum, task) => sum + task.points, 0);

                saveData();
                saveProducts();
                renderTasks();
                renderProducts();
                updateSummary();
                updateCharts();

                lastSyncTime = data.timestamp;
                localStorage.setItem('efficiencyLastSync', lastSyncTime);

                alert('数据同步完成');
                updateSyncStatus();
            }

        } catch (error) {
            alert(`获取数据出错: ${error.message}`);
            console.error('获取数据错误:', error);
        }
    }

    // 更新同步状态显示
    function updateSyncStatus() {
        const syncStatusEl = document.getElementById('last-sync-time');
        if (syncStatusEl) {
            if (lastSyncTime) {
                const date = new Date(lastSyncTime);
                syncStatusEl.textContent = `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
            } else {
                syncStatusEl.textContent = '从未同步';
            }
        }
    }

    // 添加任务事件处理
    taskForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const title = document.getElementById('title').value;
        const description = document.getElementById('description').value;
        const weight = parseInt(weightInput.value);
        const difficulty = parseInt(difficultyInput.value);
        const time = parseInt(timeInput.value);
        const completion = parseInt(completionInput.value);
        const points = calculatePoints();

        const newTask = {
            id: Date.now(),
            title,
            description,
            weight,
            difficulty,
            time,
            completion,
            points,
            date: new Date().toISOString()
        };

        tasks.push(newTask);
        totalPoints += points;

        saveData();
        renderTasks();
        updateSummary();
        updateCharts();

        // 重置表单
        taskForm.reset();
        weightInput.value = 5;
        difficultyInput.value = 5;
        completionInput.value = 100;
        timeInput.value = 30;
        updatePointsPreview();
    });

    // 清空任务
    clearTasksBtn.addEventListener('click', () => {
        if (confirm('确定要清空所有任务记录吗？此操作不可恢复。')) {
            tasks = [];
            totalPoints = 0;
            saveData();
            renderTasks();
            updateSummary();
            updateCharts();
        }
    });

    // 导出数据
    exportDataBtn.addEventListener('click', () => {
        const dataStr = JSON.stringify(tasks, null, 2);
        const blob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;
        a.download = `效率存钱罐_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    });

    // 导入数据
    importDataBtn.addEventListener('click', () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';

        input.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = (event) => {
                try {
                    const importedTasks = JSON.parse(event.target.result);

                    if (Array.isArray(importedTasks)) {
                        if (confirm(`确定要导入${importedTasks.length}条任务记录吗？现有数据将被替换。`)) {
                            tasks = importedTasks;
                            totalPoints = tasks.reduce((sum, task) => sum + task.points, 0);
                            saveData();
                            renderTasks();
                            updateSummary();
                            updateCharts();
                        }
                    } else {
                        alert('导入失败：数据格式不正确');
                    }
                } catch (err) {
                    alert('导入失败：无法解析JSON文件');
                    console.error(err);
                }
            };

            reader.readAsText(file);
        });

        input.click();
    });

    userIdForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const newUserId = userIdInput.value.trim();

        if (!newUserId) {
            alert('请输入有效的用户ID');
            return;
        }

        if (!/^[a-zA-Z0-9]+$/.test(newUserId)) {
            alert('用户ID只能包含字母和数字');
            return;
        }

        saveUserId(newUserId);
        fetchDataFromServer(); // 设置ID后尝试获取数据
    });

    // 更换用户按钮处理
    changeUserBtn.addEventListener('click', () => {
        if (confirm('更换用户ID将清除当前同步状态，确定要继续吗？')) {
            userId = '';
            localStorage.removeItem('efficiencyUserId');
            localStorage.removeItem('efficiencyLastSync');
            lastSyncTime = '';
            updateUserIdDisplay();
            updateSyncStatus();
        }
    });

    // 同步数据按钮处理
    syncDataBtn.addEventListener('click', async () => {
        try {
            // 先尝试获取远程数据
            const response = await fetch(`http://localhost:8000/${userId}/get`);

            if (response.ok) {
                // 远程有数据，询问用户要上传还是下载
                const result = await response.json();
                const remoteTime = new Date(result.timestamp || '1970-01-01');
                const localTime = lastSyncTime ? new Date(lastSyncTime) : new Date(0);

                if (remoteTime > localTime) {
                    // 远程数据更新，提示用户下载
                    if (confirm('服务器有更新的数据，是否下载？\n选择"确定"下载远程数据，选择"取消"上传本地数据。')) {
                        fetchDataFromServer();
                        return;
                    }
                }

                // 用户选择上传或本地数据更新
                syncDataToServer();
            } else if (response.status === 404) {
                // 远程无数据，直接上传
                syncDataToServer();
            } else {
                throw new Error('检查服务器数据失败');
            }
        } catch (error) {
            alert('同步前检查出错，请确保服务器连接正常');
            console.error('同步检查错误:', error);
        }
    });

    // 监听滑块值变化
    weightInput.addEventListener('input', updatePointsPreview);
    difficultyInput.addEventListener('input', updatePointsPreview);
    timeInput.addEventListener('input', updatePointsPreview);
    completionInput.addEventListener('input', updatePointsPreview);

    // 初始化应用
    initCharts();
    renderTasks();
    updateSummary();
    updateCharts();
    updatePointsPreview();
    updateUserIdDisplay();
    updateSyncStatus();
}
