/**
 * OptimaChain - ダイナミックシャーディングビジュアライゼーション
 * 
 * AIベースのトラフィック予測に基づくダイナミックシャーディングを視覚的に表現
 */

class ShardingVisualizer {
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
        
        // シャーディング状態
        this.state = {
            shards: [],
            transactions: [],
            crossTransactions: [],
            trafficLoad: 50, // パーセント
            targetShardCount: 4,
            currentShardCount: 4,
            resizing: false,
            tps: 25000, // 初期TPS
            maxTps: 50000, // 最大TPS
            aiPrediction: null
        };
        
        // 初期化
        this.initializeShards();
        
        // アニメーションの開始
        this.animate();
        
        // トラフィック負荷スライダーの設定
        const loadSlider = document.getElementById('traffic-load');
        if (loadSlider) {
            loadSlider.addEventListener('input', (e) => {
                this.state.trafficLoad = parseInt(e.target.value);
                const loadValue = document.getElementById('traffic-load-value');
                if (loadValue) {
                    loadValue.textContent = `${this.state.trafficLoad}%`;
                }
            });
            
            const applyButton = document.getElementById('apply-load');
            if (applyButton) {
                applyButton.addEventListener('click', () => {
                    this.applyTrafficLoad();
                });
            }
        }
    }
    
    updateColors() {
        // カラー設定
        const isDarkMode = document.documentElement.getAttribute('data-theme') === 'dark';
        this.colors = {
            primary: getComputedStyle(document.documentElement).getPropertyValue('--primary-color').trim(),
            secondary: getComputedStyle(document.documentElement).getPropertyValue('--secondary-color').trim(),
            accent: getComputedStyle(document.documentElement).getPropertyValue('--accent-color').trim(),
            background: isDarkMode ? 'rgba(28, 28, 30, 0.5)' : 'rgba(245, 245, 247, 0.5)',
            shard: [
                isDarkMode ? 'rgba(10, 132, 255, 0.8)' : 'rgba(0, 113, 227, 0.8)',
                isDarkMode ? 'rgba(94, 92, 230, 0.8)' : 'rgba(94, 92, 230, 0.8)',
                isDarkMode ? 'rgba(48, 209, 88, 0.8)' : 'rgba(52, 199, 89, 0.8)',
                isDarkMode ? 'rgba(255, 149, 0, 0.8)' : 'rgba(255, 149, 0, 0.8)',
                isDarkMode ? 'rgba(255, 69, 58, 0.8)' : 'rgba(255, 59, 48, 0.8)',
                isDarkMode ? 'rgba(191, 90, 242, 0.8)' : 'rgba(175, 82, 222, 0.8)',
                isDarkMode ? 'rgba(100, 210, 255, 0.8)' : 'rgba(90, 200, 250, 0.8)',
                isDarkMode ? 'rgba(255, 214, 10, 0.8)' : 'rgba(255, 204, 0, 0.8)'
            ],
            transaction: isDarkMode ? 'rgba(255, 255, 255, 0.8)' : 'rgba(255, 255, 255, 0.8)',
            crossTransaction: isDarkMode ? 'rgba(94, 92, 230, 0.8)' : 'rgba(94, 92, 230, 0.8)',
            text: isDarkMode ? '#ffffff' : '#1d1d1f',
            loadLow: isDarkMode ? 'rgba(48, 209, 88, 0.8)' : 'rgba(52, 199, 89, 0.8)',
            loadMedium: isDarkMode ? 'rgba(255, 214, 10, 0.8)' : 'rgba(255, 204, 0, 0.8)',
            loadHigh: isDarkMode ? 'rgba(255, 69, 58, 0.8)' : 'rgba(255, 59, 48, 0.8)',
            aiPrediction: isDarkMode ? 'rgba(191, 90, 242, 0.3)' : 'rgba(175, 82, 222, 0.3)'
        };
    }
    
    // シャードクラス
    createShard(id, x, y, width, height) {
        return {
            id,
            x,
            y,
            width,
            height,
            targetWidth: width,
            targetHeight: height,
            load: 0, // パーセント
            color: this.colors.shard[id % this.colors.shard.length],
            transactions: [],
            nodes: this.createShardNodes(id, x, y, width, height)
        };
    }
    
    // シャード内のノードを作成
    createShardNodes(shardId, x, y, width, height) {
        const nodes = [];
        const nodeCount = 5 + Math.floor(Math.random() * 5); // 5-9ノード
        const padding = 20;
        
        for (let i = 0; i < nodeCount; i++) {
            const nodeX = x + padding + Math.random() * (width - padding * 2);
            const nodeY = y + padding + Math.random() * (height - padding * 2);
            
            nodes.push({
                id: `${shardId}-${i}`,
                x: nodeX,
                y: nodeY,
                radius: 4 + Math.random() * 2,
                color: this.colors.shard[shardId % this.colors.shard.length]
            });
        }
        
        // ノード間の接続を生成
        const connections = [];
        for (let i = 0; i < nodes.length; i++) {
            for (let j = i + 1; j < nodes.length; j++) {
                if (Math.random() < 0.5) { // 50%の確率で接続
                    connections.push({
                        from: i,
                        to: j
                    });
                }
            }
        }
        
        return {
            list: nodes,
            connections
        };
    }
    
    // トランザクションクラス
    createTransaction(x, y, shard) {
        return {
            x,
            y,
            shard,
            size: 3 + Math.random() * 2,
            speed: 0.5 + Math.random() * 1.5,
            direction: Math.random() * Math.PI * 2,
            active: true,
            lifetime: 100 + Math.random() * 200,
            age: 0
        };
    }
    
    // クロスシャードトランザクションクラス
    createCrossTransaction(fromShard, toShard) {
        // 出発シャードのランダムなノード
        const fromNodeIndex = Math.floor(Math.random() * fromShard.nodes.list.length);
        const fromNode = fromShard.nodes.list[fromNodeIndex];
        
        // 到着シャードのランダムなノード
        const toNodeIndex = Math.floor(Math.random() * toShard.nodes.list.length);
        const toNode = toShard.nodes.list[toNodeIndex];
        
        return {
            fromNode,
            toNode,
            fromShard,
            toShard,
            x: fromNode.x,
            y: fromNode.y,
            progress: 0,
            speed: 0.02 + Math.random() * 0.01,
            size: 3,
            color: this.colors.crossTransaction,
            active: true
        };
    }
    
    // AIの予測クラス
    createAIPrediction() {
        return {
            trafficPrediction: this.state.trafficLoad,
            recommendedShardCount: this.calculateRecommendedShardCount(this.state.trafficLoad),
            predictionConfidence: 0.8 + Math.random() * 0.15, // 80-95%の信頼度
            displayTime: 200, // 表示時間（フレーム数）
            currentTime: 0,
            alpha: 0,
            fadeIn: true
        };
    }
    
    // 負荷に応じた色を取得
    getLoadColor(load) {
        if (load < 30) {
            return this.colors.loadLow;
        } else if (load < 70) {
            return this.colors.loadMedium;
        } else {
            return this.colors.loadHigh;
        }
    }
    
    // シャードを初期化
    initializeShards() {
        this.state.shards = [];
        
        const shardWidth = this.width / this.state.currentShardCount;
        const shardHeight = this.height;
        
        for (let i = 0; i < this.state.currentShardCount; i++) {
            const shard = this.createShard(
                i,
                i * shardWidth,
                0,
                shardWidth,
                shardHeight
            );
            shard.load = this.state.trafficLoad;
            this.state.shards.push(shard);
        }
        
        // AI予測を初期化
        this.state.aiPrediction = this.createAIPrediction();
    }
    
    // 負荷に応じた推奨シャード数を計算
    calculateRecommendedShardCount(load) {
        if (load < 30) {
            return 2;
        } else if (load < 60) {
            return 4;
        } else if (load < 80) {
            return 6;
        } else {
            return 8;
        }
    }
    
    // トラフィック負荷を適用
    applyTrafficLoad() {
        // 各シャードの負荷を更新
        this.state.shards.forEach(shard => {
            shard.load = this.state.trafficLoad;
        });
        
        // AI予測を更新
        this.state.aiPrediction = this.createAIPrediction();
        
        // TPSを更新
        this.updateTPS();
        
        // シャード数を調整
        this.adjustShardCount();
    }
    
    // TPSを更新
    updateTPS() {
        // シャード数と負荷に基づいてTPSを計算
        const baseTPSPerShard = 12500; // 1シャードあたりの基本TPS
        const loadFactor = 1 - (this.state.trafficLoad / 200); // 負荷が高いほど効率が下がる
        
        this.state.tps = Math.round(baseTPSPerShard * this.state.targetShardCount * loadFactor);
        
        // 最大TPSを超えないように調整
        this.state.tps = Math.min(this.state.tps, this.state.maxTps);
        
        // 表示を更新
        const tpsElement = document.getElementById('current-tps');
        if (tpsElement) {
            tpsElement.textContent = `${this.state.tps.toLocaleString()} TPS`;
        }
    }
    
    // シャード数を調整
    adjustShardCount() {
        // 負荷に応じてシャード数を決定
        this.state.targetShardCount = this.calculateRecommendedShardCount(this.state.trafficLoad);
        
        // 現在のシャード数と目標シャード数が異なる場合、リサイズを開始
        if (this.state.currentShardCount !== this.state.targetShardCount && !this.state.resizing) {
            this.resizeShards();
        }
    }
    
    // シャードをリサイズ
    resizeShards() {
        this.state.resizing = true;
        
        const currentShards = this.state.shards;
        const targetCount = this.state.targetShardCount;
        
        // 新しいシャードを作成
        const newShards = [];
        const shardWidth = this.width / targetCount;
        const shardHeight = this.height;
        
        for (let i = 0; i < targetCount; i++) {
            const shard = this.createShard(
                i,
                i * shardWidth,
                0,
                shardWidth,
                shardHeight
            );
            shard.load = this.state.trafficLoad;
            newShards.push(shard);
        }
        
        // アニメーションで徐々に変化
        const transitionDuration = 60; // フレーム数
        let transitionProgress = 0;
        
        const animateTransition = () => {
            transitionProgress++;
            const progress = transitionProgress / transitionDuration;
            
            // 古いシャードをフェードアウト
            this.ctx.clearRect(0, 0, this.width, this.height);
            
            // 背景の描画
            this.ctx.fillStyle = this.colors.background;
            this.ctx.fillRect(0, 0, this.width, this.height);
            
            // AI予測の表示
            this.drawAIPrediction();
            
            currentShards.forEach(shard => {
                this.ctx.save();
                this.ctx.globalAlpha = 1 - progress;
                this.drawShard(shard);
                this.ctx.restore();
            });
            
            // 新しいシャードをフェードイン
            newShards.forEach(shard => {
                this.ctx.save();
                this.ctx.globalAlpha = progress;
                this.drawShard(shard);
                this.ctx.restore();
            });
            
            if (progress < 1) {
                requestAnimationFrame(animateTransition);
            } else {
                // トランジション完了
                this.state.shards = newShards;
                this.state.currentShardCount = targetCount;
                this.state.resizing = false;
                
                // 統計情報を更新
                const shardCountElement = document.getElementById('shard-count');
                if (shardCountElement) {
                    shardCountElement.textContent = targetCount;
                }
                
                // クロストランザクションをリセット
                this.state.crossTransactions = [];
            }
        };
        
        animateTransition();
    }
    
    // シャードの更新
    updateShard(shard) {
        // サイズのアニメーション
        if (shard.width !== shard.targetWidth) {
            shard.width += (shard.targetWidth - shard.width) * 0.1;
            if (Math.abs(shard.width - shard.targetWidth) < 0.5) {
                shard.width = shard.targetWidth;
            }
            
            // ノードの位置を更新
            this.updateNodePositions(shard);
        }
        
        if (shard.height !== shard.targetHeight) {
            shard.height += (shard.targetHeight - shard.height) * 0.1;
            if (Math.abs(shard.height - shard.targetHeight) < 0.5) {
                shard.height = shard.targetHeight;
            }
            
            // ノードの位置を更新
            this.updateNodePositions(shard);
        }
        
        // トランザクションの更新
        shard.transactions = shard.transactions.filter(tx => {
            this.updateTransaction(tx);
            return tx.active;
        });
        
        // 新しいトランザクションの生成
        if (Math.random() < shard.load / 500) { // 負荷に応じて生成頻度を調整
            this.addTransaction(shard);
        }
    }
    
    // ノードの位置を更新
    updateNodePositions(shard) {
        const padding = 20;
        
        shard.nodes.list.forEach(node => {
            // ノードがシャードの境界内に収まるように調整
            node.x = Math.max(shard.x + padding, Math.min(shard.x + shard.width - padding, node.x));
            node.y = Math.max(shard.y + padding, Math.min(shard.y + shard.height - padding, node.y));
        });
    }
    
    // トランザクションの更新
    updateTransaction(tx) {
        // 移動
        tx.x += Math.cos(tx.direction) * tx.speed;
        tx.y += Math.sin(tx.direction) * tx.speed;
        
        // シャードの境界内に保つ
        if (tx.x < tx.shard.x + 5) {
            tx.x = tx.shard.x + 5;
            tx.direction = Math.PI - tx.direction;
        } else if (tx.x > tx.shard.x + tx.shard.width - 5) {
            tx.x = tx.shard.x + tx.shard.width - 5;
            tx.direction = Math.PI - tx.direction;
        }
        
        if (tx.y < tx.shard.y + 25) {
            tx.y = tx.shard.y + 25;
            tx.direction = -tx.direction;
        } else if (tx.y > tx.shard.y + tx.shard.height - 20) {
            tx.y = tx.shard.y + tx.shard.height - 20;
            tx.direction = -tx.direction;
        }
        
        // 寿命を更新
        tx.age++;
        if (tx.age >= tx.lifetime) {
            tx.active = false;
        }
    }
    
    // クロスシャードトランザクションの更新
    updateCrossTransaction(tx) {
        tx.progress += tx.speed;
        
        if (tx.progress >= 1) {
            tx.active = false;
            return false;
        }
        
        tx.x = tx.fromNode.x + (tx.toNode.x - tx.fromNode.x) * tx.progress;
        tx.y = tx.fromNode.y + (tx.toNode.y - tx.fromNode.y) * tx.progress;
        
        return true;
    }
    
    // AI予測の更新
    updateAIPrediction() {
        if (!this.state.aiPrediction) return;
        
        const prediction = this.state.aiPrediction;
        prediction.currentTime++;
        
        // フェードイン/アウト効果
        if (prediction.fadeIn) {
            prediction.alpha = Math.min(0.3, prediction.alpha + 0.01);
            if (prediction.alpha >= 0.3) prediction.fadeIn = false;
        } else {
            prediction.alpha = Math.max(0.1, prediction.alpha - 0.01);
            if (prediction.alpha <= 0.1) prediction.fadeIn = true;
        }
        
        // 表示時間が経過したら新しい予測を生成
        if (prediction.currentTime >= prediction.displayTime) {
            this.state.aiPrediction = this.createAIPrediction();
        }
    }
    
    // シャードの描画
    drawShard(shard) {
        // シャードの背景
        this.ctx.fillStyle = shard.color;
        this.ctx.globalAlpha = 0.2;
        this.ctx.fillRect(shard.x, shard.y, shard.width, shard.height);
        
        // シャードの境界
        this.ctx.strokeStyle = shard.color;
        this.ctx.globalAlpha = 0.8;
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(shard.x, shard.y, shard.width, shard.height);
        
        // シャードID
        this.ctx.fillStyle = shard.color;
        this.ctx.globalAlpha = 1;
        this.ctx.font = '14px Inter, sans-serif';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(`Shard ${shard.id + 1}`, shard.x + shard.width / 2, shard.y + 20);
        
        // 負荷インジケーター
        const loadWidth = (shard.width - 20) * (shard.load / 100);
        this.ctx.fillStyle = this.getLoadColor(shard.load);
        this.ctx.fillRect(shard.x + 10, shard.y + shard.height - 15, loadWidth, 10);
        
        this.ctx.strokeStyle = this.isDarkMode ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.1)';
        this.ctx.strokeRect(shard.x + 10, shard.y + shard.height - 15, shard.width - 20, 10);
        
        // ノード間の接続を描画
        this.ctx.globalAlpha = 0.4;
        this.ctx.strokeStyle = shard.color;
        this.ctx.lineWidth = 1;
        
        shard.nodes.connections.forEach(conn => {
            const fromNode = shard.nodes.list[conn.from];
            const toNode = shard.nodes.list[conn.to];
            
            this.ctx.beginPath();
            this.ctx.moveTo(fromNode.x, fromNode.y);
            this.ctx.lineTo(toNode.x, toNode.y);
            this.ctx.stroke();
        });
        
        // ノードの描画
        this.ctx.globalAlpha = 0.8;
        shard.nodes.list.forEach(node => {
            this.ctx.fillStyle = node.color;
            this.ctx.beginPath();
            this.ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
            this.ctx.fill();
        });
        
        // トランザクションの描画
        this.ctx.globalAlpha = 1;
        shard.transactions.forEach(tx => {
            this.ctx.fillStyle = this.colors.transaction;
            this.ctx.beginPath();
            this.ctx.arc(tx.x, tx.y, tx.size, 0, Math.PI * 2);
            this.ctx.fill();
        });
    }
    
    // クロスシャードトランザクションの描画
    drawCrossTransaction(tx) {
        this.ctx.save();
        this.ctx.fillStyle = tx.color;
        this.ctx.beginPath();
        this.ctx.arc(tx.x, tx.y, tx.size, 0, Math.PI * 2);
        this.ctx.fill();
        
        // 軌跡を描画
        this.ctx.strokeStyle = tx.color;
        this.ctx.globalAlpha = 0.3;
        this.ctx.lineWidth = 1;
        this.ctx.beginPath();
        this.ctx.moveTo(tx.fromNode.x, tx.fromNode.y);
        this.ctx.lineTo(tx.x, tx.y);
        this.ctx.stroke();
        
        this.ctx.restore();
    }
    
    // AI予測の描画
    drawAIPrediction() {
        if (!this.state.aiPrediction) return;
        
        const prediction = this.state.aiPrediction;
        
        this.ctx.save();
        this.ctx.globalAlpha = prediction.alpha;
        this.ctx.fillStyle = this.colors.aiPrediction;
        
        // 予測テキスト
        this.ctx.font = '12px Inter, sans-serif';
        this.ctx.textAlign = 'left';
        this.ctx.textBaseline = 'top';
        this.ctx.fillText(`AI予測: ${prediction.trafficPrediction}% 負荷`, 10, 10);
        this.ctx.fillText(`推奨シャード数: ${prediction.recommendedShardCount}`, 10, 30);
        this.ctx.fillText(`信頼度: ${Math.round(prediction.predictionConfidence * 100)}%`, 10, 50);
        
        // 予測シャードの視覚化
        const predictedWidth = this.width / prediction.recommendedShardCount;
        
        for (let i = 0; i < prediction.recommendedShardCount; i++) {
            this.ctx.strokeStyle = this.colors.aiPrediction;
            this.ctx.lineWidth = 2;
            this.ctx.setLineDash([5, 5]);
            this.ctx.strokeRect(i * predictedWidth, 0, predictedWidth, this.height);
        }
        
        this.ctx.restore();
    }
    
    // トランザクションの追加
    addTransaction(shard) {
        const tx = this.createTransaction(
            shard.x + Math.random() * shard.width,
            shard.y + Math.random() * (shard.height - 30),
            shard
        );
        shard.transactions.push(tx);
    }
    
    // クロスシャードトランザクションの生成
    createCrossShardTransaction() {
        if (this.state.shards.length < 2) return;
        
        // 負荷に応じてクロスシャードトランザクションの頻度を調整
        const probability = this.state.trafficLoad / 1000; // 最大10%
        
        if (Math.random() < probability) {
            // ランダムな2つのシャードを選択
            const fromIndex = Math.floor(Math.random() * this.state.shards.length);
            let toIndex;
            do {
                toIndex = Math.floor(Math.random() * this.state.shards.length);
            } while (toIndex === fromIndex);
            
            const fromShard = this.state.shards[fromIndex];
            const toShard = this.state.shards[toIndex];
            
            this.state.crossTransactions.push(this.createCrossTransaction(fromShard, toShard));
        }
    }
    
    // アニメーションループ
    animate() {
        if (!this.state.resizing) {
            this.ctx.clearRect(0, 0, this.width, this.height);
            
            // 背景の描画
            this.ctx.fillStyle = this.colors.background;
            this.ctx.fillRect(0, 0, this.width, this.height);
            
            // AI予測の更新と描画
            this.updateAIPrediction();
            this.drawAIPrediction();
            
            // シャードの更新と描画
            this.state.shards.forEach(shard => {
                this.updateShard(shard);
                this.drawShard(shard);
            });
            
            // クロスシャードトランザクションの更新と描画
            this.state.crossTransactions = this.state.crossTransactions.filter(tx => {
                this.drawCrossTransaction(tx);
                return this.updateCrossTransaction(tx);
            });
            
            // クロスシャードトランザクションの生成
            this.createCrossShardTransaction();
        }
        
        requestAnimationFrame(this.animate.bind(this));
    }
}

// DOMが読み込まれたら初期化
document.addEventListener('DOMContentLoaded', function() {
    const canvas = document.getElementById('sharding-canvas');
    if (canvas) {
        const visualizer = new ShardingVisualizer('sharding-canvas');
        
        // テーマ変更を監視
        if (window.themeManager) {
            window.themeManager.addObserver(() => {
                visualizer.updateColors();
            });
        }
    }
});