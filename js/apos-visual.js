/**
 * OptimaChain - Adaptive Proof-of-Stake (aPoS) ビジュアライゼーション
 * 
 * AIによる検証者選出プロセスを視覚的に表現するインタラクティブなビジュアライゼーション
 */

class APoSVisualizer {
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
        
        // aPoSシミュレーションの状態
        this.state = {
            nodes: [],
            validators: [],
            connections: [],
            aiNode: null,
            dataFlows: [],
            epoch: 0,
            epochTimer: 0,
            epochDuration: 200, // フレーム数
            validatorSelectionInProgress: false,
            networkLoad: 50 // ネットワーク負荷（0-100）
        };
        
        // 初期化
        this.initializeNodes();
        
        // アニメーションの開始
        this.animate();
        
        // ネットワーク負荷スライダーの設定
        const loadSlider = document.getElementById('network-load');
        if (loadSlider) {
            loadSlider.addEventListener('input', (e) => {
                this.state.networkLoad = parseInt(e.target.value);
                const loadValue = document.getElementById('network-load-value');
                if (loadValue) {
                    loadValue.textContent = `${this.state.networkLoad}%`;
                }
            });
            
            const applyButton = document.getElementById('apply-network-load');
            if (applyButton) {
                applyButton.addEventListener('click', () => {
                    this.selectValidators();
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
            node: isDarkMode ? 'rgba(10, 132, 255, 0.8)' : 'rgba(0, 113, 227, 0.8)',
            validator: isDarkMode ? 'rgba(94, 92, 230, 0.8)' : 'rgba(94, 92, 230, 0.8)',
            connection: isDarkMode ? 'rgba(94, 158, 255, 0.4)' : 'rgba(134, 185, 255, 0.4)',
            ai: isDarkMode ? 'rgba(48, 209, 88, 0.8)' : 'rgba(52, 199, 89, 0.8)',
            text: isDarkMode ? '#ffffff' : '#1d1d1f'
        };
    }
    
    // ノードクラス
    createNode(id, x, y, type = 'node') {
        return {
            id,
            x,
            y,
            type, // 'node', 'validator', 'ai'
            radius: type === 'ai' ? 20 : 10,
            color: type === 'validator' ? this.colors.validator : 
                   type === 'ai' ? this.colors.ai : this.colors.node,
            stake: Math.random() * 100 + 50, // ステーク量
            performance: Math.random() * 0.5 + 0.5, // パフォーマンス指標 (0.5-1.0)
            selected: false,
            pulse: 0,
            opacity: 1,
            score: 0
        };
    }
    
    // データフロークラス
    createDataFlow(fromNode, toNode, type = 'data') {
        return {
            fromNode,
            toNode,
            type, // 'data', 'selection'
            progress: 0,
            speed: 0.01 + Math.random() * 0.01,
            color: type === 'selection' ? this.colors.validator : this.colors.node,
            size: 3,
            completed: false
        };
    }
    
    // ノードの初期化
    initializeNodes() {
        this.state.nodes = [];
        this.state.validators = [];
        this.state.connections = [];
        this.state.dataFlows = [];
        
        // AIノードを中央に配置
        const aiNode = this.createNode('ai', this.width / 2, this.height / 2, 'ai');
        this.state.aiNode = aiNode;
        this.state.nodes.push(aiNode);
        
        // 通常ノードを円形に配置
        const nodeCount = 20;
        const radius = 150;
        
        for (let i = 0; i < nodeCount; i++) {
            const angle = (i / nodeCount) * Math.PI * 2;
            const x = this.width / 2 + Math.cos(angle) * radius;
            const y = this.height / 2 + Math.sin(angle) * radius;
            
            const node = this.createNode(i, x, y);
            this.state.nodes.push(node);
            
            // AIノードとの接続を追加
            this.state.connections.push({
                from: aiNode,
                to: node,
                opacity: 0.3
            });
        }
        
        // 初期バリデータの選定
        this.selectValidators();
    }
    
    // バリデータの選択
    selectValidators() {
        if (this.state.validatorSelectionInProgress) return;
        
        this.state.validatorSelectionInProgress = true;
        
        // 前回のバリデータをリセット
        this.state.validators.forEach(validator => {
            validator.type = 'node';
            validator.color = this.colors.node;
            validator.selected = false;
        });
        this.state.validators = [];
        
        // ノードからAIノードへのデータフローを生成
        this.state.nodes.forEach(node => {
            if (node.type !== 'ai') {
                this.state.dataFlows.push(this.createDataFlow(node, this.state.aiNode));
            }
        });
        
        // AIによる分析と選択の遅延
        setTimeout(() => {
            // ステークとパフォーマンスに基づいてスコアを計算
            const nodes = this.state.nodes.filter(node => node.type !== 'ai');
            nodes.forEach(node => {
                // ネットワーク負荷に応じてスコア計算ロジックを調整
                let performanceWeight, stakeWeight;
                
                if (this.state.networkLoad < 30) {
                    // 低負荷時：ステーク量重視
                    stakeWeight = 0.7;
                    performanceWeight = 0.3;
                } else if (this.state.networkLoad < 70) {
                    // 中負荷時：バランス重視
                    stakeWeight = 0.5;
                    performanceWeight = 0.5;
                } else {
                    // 高負荷時：パフォーマンス重視
                    stakeWeight = 0.3;
                    performanceWeight = 0.7;
                }
                
                node.score = (node.stake * stakeWeight) + (node.performance * 100 * performanceWeight);
            });
            
            // スコアでソート
            const sortedNodes = [...nodes].sort((a, b) => b.score - a.score);
            
            // バリデータ数を決定（ネットワーク負荷に応じて変動）
            let validatorCount;
            if (this.state.networkLoad < 30) {
                validatorCount = 3; // 低負荷時は少数
            } else if (this.state.networkLoad < 70) {
                validatorCount = 5; // 中負荷時は中程度
            } else {
                validatorCount = 7; // 高負荷時は多数
            }
            
            // 上位ノードを選択
            const selectedValidators = sortedNodes.slice(0, validatorCount);
            
            // AIノードからバリデータへのデータフローを生成
            selectedValidators.forEach(node => {
                this.state.dataFlows.push(this.createDataFlow(this.state.aiNode, node, 'selection'));
            });
            
            // 選択完了後の処理
            setTimeout(() => {
                selectedValidators.forEach(node => {
                    const nodeObj = this.state.nodes.find(n => n.id === node.id);
                    if (nodeObj) {
                        nodeObj.type = 'validator';
                        nodeObj.color = this.colors.validator;
                        nodeObj.selected = true;
                        this.state.validators.push(nodeObj);
                    }
                });
                
                this.state.validatorSelectionInProgress = false;
            }, 1000);
        }, 1000);
    }
    
    // ノードの更新
    updateNode(node) {
        // パルスエフェクト
        if (node.selected) {
            node.pulse = (node.pulse + 0.05) % (Math.PI * 2);
        }
    }
    
    // ノードの描画
    drawNode(node) {
        this.ctx.save();
        
        // パルスエフェクト
        let radiusModifier = 0;
        if (node.selected) {
            radiusModifier = Math.sin(node.pulse) * 3;
            
            // 選択されたノードの周りに輝きを追加
            const glowRadius = node.radius + 5 + radiusModifier;
            const gradient = this.ctx.createRadialGradient(
                node.x, node.y, node.radius,
                node.x, node.y, glowRadius
            );
            gradient.addColorStop(0, node.color);
            gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
            
            this.ctx.fillStyle = gradient;
            this.ctx.beginPath();
            this.ctx.arc(node.x, node.y, glowRadius, 0, Math.PI * 2);
            this.ctx.fill();
        }
        
        // ノードの描画
        this.ctx.globalAlpha = node.opacity;
        this.ctx.fillStyle = node.color;
        this.ctx.beginPath();
        this.ctx.arc(node.x, node.y, node.radius + radiusModifier, 0, Math.PI * 2);
        this.ctx.fill();
        
        // AIノードの場合、中央に「AI」と表示
        if (node.type === 'ai') {
            this.ctx.fillStyle = '#ffffff';
            this.ctx.font = '12px Inter, sans-serif';
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            this.ctx.fillText('AI', node.x, node.y);
        }
        
        this.ctx.restore();
    }
    
    // データフローの更新
    updateDataFlow(flow) {
        flow.progress += flow.speed;
        if (flow.progress >= 1) {
            flow.completed = true;
            return false;
        }
        return true;
    }
    
    // データフローの描画
    drawDataFlow(flow) {
        const fromX = flow.fromNode.x;
        const fromY = flow.fromNode.y;
        const toX = flow.toNode.x;
        const toY = flow.toNode.y;
        
        // 曲線の制御点
        const cpX = (fromX + toX) / 2 + (Math.random() - 0.5) * 50;
        const cpY = (fromY + toY) / 2 + (Math.random() - 0.5) * 50;
        
        // 現在の位置を計算（二次ベジェ曲線に沿って）
        const t = flow.progress;
        const x = Math.pow(1 - t, 2) * fromX + 2 * (1 - t) * t * cpX + Math.pow(t, 2) * toX;
        const y = Math.pow(1 - t, 2) * fromY + 2 * (1 - t) * t * cpY + Math.pow(t, 2) * toY;
        
        this.ctx.save();
        this.ctx.fillStyle = flow.color;
        this.ctx.beginPath();
        this.ctx.arc(x, y, flow.size, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.restore();
    }
    
    // エポックの更新
    updateEpoch() {
        this.state.epochTimer++;
        if (this.state.epochTimer >= this.state.epochDuration) {
            this.state.epochTimer = 0;
            this.state.epoch++;
            
            // 10エポックごとにバリデータを再選定
            if (this.state.epoch % 10 === 0 && !this.state.validatorSelectionInProgress) {
                this.selectValidators();
            }
        }
    }
    
    // アニメーションループ
    animate() {
        // キャンバスのクリア
        this.ctx.clearRect(0, 0, this.width, this.height);
        
        // 背景の描画
        this.ctx.fillStyle = this.colors.background;
        this.ctx.fillRect(0, 0, this.width, this.height);
        
        // 接続の描画
        this.state.connections.forEach(connection => {
            this.ctx.save();
            this.ctx.strokeStyle = this.colors.connection;
            this.ctx.globalAlpha = connection.opacity;
            this.ctx.lineWidth = 1;
            this.ctx.beginPath();
            this.ctx.moveTo(connection.from.x, connection.from.y);
            this.ctx.lineTo(connection.to.x, connection.to.y);
            this.ctx.stroke();
            this.ctx.restore();
        });
        
        // データフローの更新と描画
        this.state.dataFlows = this.state.dataFlows.filter(flow => {
            this.drawDataFlow(flow);
            return !flow.completed && this.updateDataFlow(flow);
        });
        
        // ノードの更新と描画
        this.state.nodes.forEach(node => {
            this.updateNode(node);
            this.drawNode(node);
        });
        
        // エポック情報の表示
        this.ctx.save();
        this.ctx.fillStyle = this.colors.text;
        this.ctx.font = '14px Inter, sans-serif';
        this.ctx.textAlign = 'left';
        this.ctx.textBaseline = 'top';
        this.ctx.fillText(`エポック: ${this.state.epoch}`, 20, 20);
        this.ctx.fillText(`バリデータ数: ${this.state.validators.length}`, 20, 40);
        this.ctx.fillText(`ネットワーク負荷: ${this.state.networkLoad}%`, 20, 60);
        this.ctx.restore();
        
        // エポックの更新
        this.updateEpoch();
        
        // アニメーションの継続
        requestAnimationFrame(this.animate.bind(this));
    }
}

// DOMが読み込まれたら初期化
document.addEventListener('DOMContentLoaded', function() {
    const canvas = document.getElementById('apos-canvas');
    if (canvas) {
        const visualizer = new APoSVisualizer('apos-canvas');
        
        // テーマ変更を監視
        if (window.themeManager) {
            window.themeManager.addObserver(() => {
                visualizer.updateColors();
            });
        }
    }
});