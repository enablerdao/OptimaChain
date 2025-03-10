/**
 * OptimaChain - トランザクションシミュレーター
 * 
 * 高速トランザクション処理のリアルタイムシミュレーション
 */

class TransactionSimulator {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) return;
        
        this.ctx = this.canvas.getContext('2d');
        this.width = this.canvas.width;
        this.height = this.canvas.height;
        
        // デバイスピクセル比の調整
        const dpr = window.devicePixelRatio || 1;
        this.canvas.width = this.width * dpr;
        this.canvas.height = this.height * dpr;
        this.canvas.style.width = `${this.width}px`;
        this.canvas.style.height = `${this.height}px`;
        this.ctx.scale(dpr, dpr);
        
        // カラー設定
        this.updateColors();
        
        // シミュレーション状態
        this.state = {
            running: false,
            transactions: [],
            processedCount: 0,
            startTime: 0,
            tps: 0,
            avgTime: 0,
            totalTime: 0,
            maxConcurrent: 100, // 同時処理数
            txType: 'transfer',
            txCount: 1000,
            shards: []
        };
        
        // 初期化
        this.initializeGrid();
        
        // イベントリスナーの設定
        this.setupEventListeners();
    }
    
    updateColors() {
        // カラー設定
        const isDarkMode = document.documentElement.getAttribute('data-theme') === 'dark';
        this.colors = {
            primary: getComputedStyle(document.documentElement).getPropertyValue('--primary-color').trim(),
            secondary: getComputedStyle(document.documentElement).getPropertyValue('--secondary-color').trim(),
            accent: getComputedStyle(document.documentElement).getPropertyValue('--accent-color').trim(),
            background: isDarkMode ? 'rgba(28, 28, 30, 0.5)' : 'rgba(245, 245, 247, 0.5)',
            grid: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
            transaction: {
                transfer: isDarkMode ? 'rgba(10, 132, 255, 0.8)' : 'rgba(0, 113, 227, 0.8)',
                swap: isDarkMode ? 'rgba(94, 92, 230, 0.8)' : 'rgba(94, 92, 230, 0.8)',
                nft: isDarkMode ? 'rgba(48, 209, 88, 0.8)' : 'rgba(52, 199, 89, 0.8)'
            },
            text: isDarkMode ? '#ffffff' : '#1d1d1f',
            shard: isDarkMode ? 'rgba(44, 44, 46, 0.5)' : 'rgba(255, 255, 255, 0.5)'
        };
    }
    
    // グリッドの初期化
    initializeGrid() {
        // シャードの作成
        this.state.shards = [];
        const shardCount = 4;
        const shardWidth = this.width / shardCount;
        
        for (let i = 0; i < shardCount; i++) {
            this.state.shards.push({
                x: i * shardWidth,
                y: 0,
                width: shardWidth,
                height: this.height,
                id: i
            });
        }
        
        // 初期描画
        this.drawBackground();
    }
    
    // 背景の描画
    drawBackground() {
        // キャンバスをクリア
        this.ctx.clearRect(0, 0, this.width, this.height);
        
        // 背景色
        this.ctx.fillStyle = this.colors.background;
        this.ctx.fillRect(0, 0, this.width, this.height);
        
        // シャードの描画
        this.state.shards.forEach((shard, index) => {
            this.ctx.fillStyle = this.colors.shard;
            this.ctx.fillRect(shard.x, shard.y, shard.width, shard.height);
            
            // シャードの境界線
            this.ctx.strokeStyle = this.colors.grid;
            this.ctx.lineWidth = 1;
            this.ctx.strokeRect(shard.x, shard.y, shard.width, shard.height);
            
            // シャードID
            this.ctx.fillStyle = this.colors.text;
            this.ctx.font = '12px Inter, sans-serif';
            this.ctx.textAlign = 'center';
            this.ctx.fillText(`Shard ${index + 1}`, shard.x + shard.width / 2, 20);
        });
        
        // グリッドの描画
        this.drawGrid();
    }
    
    // グリッドを描画
    drawGrid() {
        const gridSize = 20;
        
        this.ctx.save();
        this.ctx.strokeStyle = this.colors.grid;
        this.ctx.lineWidth = 1;
        
        // 縦線
        for (let x = 0; x <= this.width; x += gridSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(x, 0);
            this.ctx.lineTo(x, this.height);
            this.ctx.stroke();
        }
        
        // 横線
        for (let y = 0; y <= this.height; y += gridSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(this.width, y);
            this.ctx.stroke();
        }
        
        this.ctx.restore();
    }
    
    // トランザクションクラス
    createTransaction(id, type) {
        // ランダムなシャードを選択
        const shardIndex = Math.floor(Math.random() * this.state.shards.length);
        const shard = this.state.shards[shardIndex];
        
        // シャード内のランダムな位置
        const x = shard.x + Math.random() * shard.width;
        
        return {
            id,
            type,
            status: 'pending', // pending, processing, completed
            startTime: 0,
            endTime: 0,
            x: x,
            y: 0,
            targetY: this.height,
            speed: this.getSpeedForType(type),
            size: 4,
            color: this.colors.transaction[type],
            trail: [],
            maxTrailLength: 10,
            shard: shardIndex
        };
    }
    
    // トランザクションタイプに応じた速度を取得
    getSpeedForType(type) {
        switch (type) {
            case 'transfer':
                return 3 + Math.random() * 2;
            case 'swap':
                return 2 + Math.random() * 1.5;
            case 'nft':
                return 1.5 + Math.random() * 1;
            default:
                return 3 + Math.random() * 2;
        }
    }
    
    // トランザクションの開始
    startTransaction(tx) {
        tx.status = 'processing';
        tx.startTime = performance.now();
    }
    
    // トランザクションの完了
    completeTransaction(tx) {
        tx.status = 'completed';
        tx.endTime = performance.now();
        return tx.endTime - tx.startTime; // 処理時間を返す
    }
    
    // トランザクションの更新
    updateTransaction(tx) {
        if (tx.status === 'processing') {
            // 軌跡を記録
            tx.trail.push({ x: tx.x, y: tx.y });
            if (tx.trail.length > tx.maxTrailLength) {
                tx.trail.shift();
            }
            
            tx.y += tx.speed;
            
            if (tx.y >= tx.targetY) {
                return this.completeTransaction(tx);
            }
        }
        return null;
    }
    
    // トランザクションの描画
    drawTransaction(tx) {
        // 軌跡を描画
        if (tx.trail.length > 1) {
            this.ctx.save();
            this.ctx.strokeStyle = tx.color;
            this.ctx.lineWidth = 2;
            this.ctx.globalAlpha = 0.3;
            this.ctx.beginPath();
            this.ctx.moveTo(tx.trail[0].x, tx.trail[0].y);
            
            for (let i = 1; i < tx.trail.length; i++) {
                this.ctx.lineTo(tx.trail[i].x, tx.trail[i].y);
            }
            
            this.ctx.stroke();
            this.ctx.restore();
        }
        
        // トランザクションを描画
        this.ctx.save();
        this.ctx.fillStyle = tx.color;
        this.ctx.beginPath();
        this.ctx.arc(tx.x, tx.y, tx.size, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.restore();
    }
    
    // シミュレーション開始
    startSimulation() {
        if (this.state.running) return;
        
        const txCountInput = document.getElementById('tx-count');
        const txTypeInput = document.getElementById('tx-type');
        
        if (txCountInput && txTypeInput) {
            this.state.txCount = parseInt(txCountInput.value);
            this.state.txType = txTypeInput.value;
        }
        
        // シミュレーション状態をリセット
        this.state = {
            ...this.state,
            running: true,
            transactions: [],
            processedCount: 0,
            startTime: performance.now(),
            tps: 0,
            avgTime: 0,
            totalTime: 0
        };
        
        // トランザクションを生成
        for (let i = 0; i < this.state.txCount; i++) {
            this.state.transactions.push(this.createTransaction(i, this.state.txType));
        }
        
        // アニメーションを開始
        requestAnimationFrame(this.animate.bind(this));
        
        // 統計更新タイマーを開始
        this.updateStatsTimer = setInterval(() => this.updateStats(), 100);
        
        // ボタンを無効化
        const startButton = document.getElementById('start-demo');
        if (startButton) {
            startButton.disabled = true;
            startButton.innerHTML = '<span class="button-text">シミュレーション実行中...</span>';
        }
    }
    
    // アニメーションループ
    animate() {
        if (!this.state.running) return;
        
        // 背景を描画
        this.drawBackground();
        
        // 処理中のトランザクションを更新・描画
        const processingTx = this.state.transactions.filter(tx => tx.status === 'processing');
        
        processingTx.forEach(tx => {
            const processingTime = this.updateTransaction(tx);
            this.drawTransaction(tx);
            
            if (processingTime !== null) {
                this.state.processedCount++;
                this.state.totalTime += processingTime;
                this.state.avgTime = this.state.totalTime / this.state.processedCount;
            }
        });
        
        // 新しいトランザクションを開始
        const pendingTx = this.state.transactions.filter(tx => tx.status === 'pending');
        
        // 同時に最大maxConcurrentのトランザクションを処理
        const currentProcessing = processingTx.length;
        const toStart = Math.min(this.state.maxConcurrent - currentProcessing, pendingTx.length);
        
        for (let i = 0; i < toStart; i++) {
            this.startTransaction(pendingTx[i]);
        }
        
        // すべてのトランザクションが完了したかチェック
        if (this.state.processedCount === this.state.transactions.length) {
            this.state.running = false;
            clearInterval(this.updateStatsTimer);
            
            // ボタンを再有効化
            const startButton = document.getElementById('start-demo');
            if (startButton) {
                startButton.disabled = false;
                startButton.innerHTML = '<span class="button-text">シミュレーション開始</span><span class="button-icon">▶</span>';
            }
        }
        
        // アニメーションを継続
        if (this.state.running) {
            requestAnimationFrame(this.animate.bind(this));
        }
    }
    
    // 統計情報を更新
    updateStats() {
        if (!this.state.running) return;
        
        const currentTime = performance.now();
        const elapsedSeconds = (currentTime - this.state.startTime) / 1000;
        
        if (elapsedSeconds > 0) {
            this.state.tps = Math.round(this.state.processedCount / elapsedSeconds);
        }
        
        const processedTxElement = document.getElementById('processed-tx');
        const currentTpsElement = document.getElementById('current-tps');
        const avgTimeElement = document.getElementById('avg-time');
        
        if (processedTxElement) {
            processedTxElement.textContent = this.state.processedCount.toLocaleString();
        }
        
        if (currentTpsElement) {
            currentTpsElement.textContent = this.state.tps.toLocaleString();
        }
        
        if (avgTimeElement) {
            avgTimeElement.textContent = `${Math.round(this.state.avgTime)} ms`;
        }
    }
    
    // イベントリスナーの設定
    setupEventListeners() {
        // スタートボタン
        const startButton = document.getElementById('start-demo');
        if (startButton) {
            startButton.addEventListener('click', () => this.startSimulation());
        }
        
        // トランザクション数スライダー
        const txCountSlider = document.getElementById('tx-count');
        const txCountValue = document.getElementById('tx-count-value');
        
        if (txCountSlider && txCountValue) {
            txCountSlider.addEventListener('input', function() {
                txCountValue.textContent = parseInt(this.value).toLocaleString();
            });
        }
        
        // トランザクションタイプセレクター
        const txTypeSelector = document.getElementById('tx-type');
        if (txTypeSelector) {
            txTypeSelector.addEventListener('change', () => {
                this.state.txType = txTypeSelector.value;
            });
        }
    }
}

// DOMが読み込まれたら初期化
document.addEventListener('DOMContentLoaded', function() {
    const canvas = document.getElementById('tx-canvas');
    if (canvas) {
        const simulator = new TransactionSimulator('tx-canvas');
        
        // テーマ変更を監視
        if (window.themeManager) {
            window.themeManager.addObserver(() => {
                simulator.updateColors();
                simulator.drawBackground();
            });
        }
    }
});