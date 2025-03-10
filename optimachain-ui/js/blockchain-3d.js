/**
 * OptimaChain - 3Dブロックチェーンビジュアライゼーション
 * 
 * Three.jsを使用した高度な3Dブロックチェーンビジュアライゼーション
 */

class BlockchainVisualizer {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) return;
        
        // 初期化
        this.init();
        this.createScene();
        this.setupPostprocessing();
        this.createBlockchain();
        this.animate();
        
        // イベントリスナー
        window.addEventListener('resize', this.onWindowResize.bind(this));
    }
    
    init() {
        // レンダラーの設定
        this.renderer = new THREE.WebGLRenderer({
            canvas: this.canvas,
            antialias: true,
            alpha: true
        });
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.setSize(this.canvas.clientWidth, this.canvas.clientHeight);
        this.renderer.outputEncoding = THREE.sRGBEncoding;
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 1.0;
        
        // シーンの設定
        this.scene = new THREE.Scene();
        
        // カメラの設定
        this.camera = new THREE.PerspectiveCamera(
            60,
            this.canvas.clientWidth / this.canvas.clientHeight,
            0.1,
            1000
        );
        this.camera.position.set(0, 0, 30);
        
        // コントロールの設定
        this.controls = new THREE.OrbitControls(this.camera, this.canvas);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;
        this.controls.rotateSpeed = 0.5;
        this.controls.autoRotate = true;
        this.controls.autoRotateSpeed = 0.5;
        
        // ブロックチェーンデータ
        this.blocks = [];
        this.transactions = [];
        this.connections = [];
        
        // カラー設定
        this.isDarkMode = document.documentElement.getAttribute('data-theme') === 'dark';
        this.colors = {
            primary: this.getComputedColor('--primary-color'),
            secondary: this.getComputedColor('--secondary-color'),
            accent: this.getComputedColor('--accent-color'),
            background: this.isDarkMode ? new THREE.Color(0x1c1c1e) : new THREE.Color(0xf5f5f7),
            block: this.isDarkMode ? new THREE.Color(0x0a84ff) : new THREE.Color(0x0071e3),
            genesis: this.isDarkMode ? new THREE.Color(0x5e5ce6) : new THREE.Color(0x5e5ce6),
            connection: this.isDarkMode ? new THREE.Color(0x5e9eff) : new THREE.Color(0x86b9ff),
            transaction: this.isDarkMode ? new THREE.Color(0x5e5ce6) : new THREE.Color(0x5e5ce6)
        };
    }
    
    getComputedColor(cssVar) {
        const color = getComputedStyle(document.documentElement).getPropertyValue(cssVar).trim();
        return new THREE.Color(color);
    }
    
    createScene() {
        // 環境光
        const ambientLight = new THREE.AmbientLight(0x404040, 1);
        this.scene.add(ambientLight);
        
        // ディレクショナルライト
        const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
        directionalLight.position.set(1, 1, 1);
        this.scene.add(directionalLight);
        
        // 背景の粒子
        this.createParticles();
    }
    
    createParticles() {
        const particleCount = 1000;
        const particles = new THREE.BufferGeometry();
        const positions = new Float32Array(particleCount * 3);
        
        for (let i = 0; i < particleCount; i++) {
            const i3 = i * 3;
            positions[i3] = (Math.random() - 0.5) * 100;
            positions[i3 + 1] = (Math.random() - 0.5) * 100;
            positions[i3 + 2] = (Math.random() - 0.5) * 100;
        }
        
        particles.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        
        const particleMaterial = new THREE.PointsMaterial({
            color: this.colors.primary,
            size: 0.2,
            transparent: true,
            opacity: 0.6,
            sizeAttenuation: true
        });
        
        this.particleSystem = new THREE.Points(particles, particleMaterial);
        this.scene.add(this.particleSystem);
    }
    
    setupPostprocessing() {
        // レンダーパス
        this.composer = new THREE.EffectComposer(this.renderer);
        const renderPass = new THREE.RenderPass(this.scene, this.camera);
        this.composer.addPass(renderPass);
        
        // ブルームパス
        const bloomPass = new THREE.UnrealBloomPass(
            new THREE.Vector2(this.canvas.clientWidth, this.canvas.clientHeight),
            1.5, // 強度
            0.4, // 半径
            0.85 // 閾値
        );
        this.composer.addPass(bloomPass);
    }
    
    createBlockchain() {
        // ジェネシスブロックを作成
        this.createBlock(0, new THREE.Vector3(0, 0, 0), true);
        
        // 周囲のブロックを作成
        const blockCount = 10;
        const radius = 15;
        
        for (let i = 1; i <= blockCount; i++) {
            const angle = (i / blockCount) * Math.PI * 2;
            const x = Math.cos(angle) * radius;
            const y = Math.sin(angle) * radius;
            const z = (Math.random() - 0.5) * 5;
            
            this.createBlock(i, new THREE.Vector3(x, y, z));
            this.createConnection(0, i);
        }
        
        // 第2層のブロックを作成
        const secondLayerCount = 15;
        const secondLayerRadius = 25;
        
        for (let i = 0; i < secondLayerCount; i++) {
            const angle = (i / secondLayerCount) * Math.PI * 2;
            const x = Math.cos(angle) * secondLayerRadius;
            const y = Math.sin(angle) * secondLayerRadius;
            const z = (Math.random() - 0.5) * 10;
            
            const blockId = blockCount + i + 1;
            const parentId = Math.floor(Math.random() * blockCount) + 1;
            
            this.createBlock(blockId, new THREE.Vector3(x, y, z));
            this.createConnection(parentId, blockId);
        }
    }
    
    createBlock(id, position, isGenesis = false) {
        // ブロックのジオメトリ
        const geometry = isGenesis 
            ? new THREE.OctahedronGeometry(1.5, 0) 
            : new THREE.BoxGeometry(1.2, 1.2, 1.2);
        
        // ブロックのマテリアル
        const material = new THREE.MeshPhysicalMaterial({
            color: isGenesis ? this.colors.genesis : this.colors.block,
            metalness: 0.9,
            roughness: 0.2,
            transparent: true,
            opacity: 0.9,
            emissive: isGenesis ? this.colors.genesis : this.colors.block,
            emissiveIntensity: 0.3
        });
        
        // ブロックのメッシュ
        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.copy(position);
        mesh.userData = { id, isGenesis };
        
        // シーンに追加
        this.scene.add(mesh);
        this.blocks.push(mesh);
        
        // ブロックの周りにオーラを追加
        if (isGenesis) {
            const auraSphere = new THREE.Mesh(
                new THREE.SphereGeometry(3, 32, 32),
                new THREE.MeshBasicMaterial({
                    color: this.colors.genesis,
                    transparent: true,
                    opacity: 0.1
                })
            );
            auraSphere.position.copy(position);
            this.scene.add(auraSphere);
        }
        
        return mesh;
    }
    
    createConnection(fromId, toId) {
        const fromBlock = this.blocks.find(block => block.userData.id === fromId);
        const toBlock = this.blocks.find(block => block.userData.id === toId);
        
        if (!fromBlock || !toBlock) return;
        
        // 接続線の点を作成
        const points = [];
        points.push(fromBlock.position);
        points.push(toBlock.position);
        
        // 接続線のジオメトリ
        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        
        // 接続線のマテリアル
        const material = new THREE.LineBasicMaterial({
            color: this.colors.connection,
            transparent: true,
            opacity: 0.5
        });
        
        // 接続線のメッシュ
        const line = new THREE.Line(geometry, material);
        
        // シーンに追加
        this.scene.add(line);
        this.connections.push({
            line,
            fromId,
            toId
        });
    }
    
    createTransaction(fromId, toId) {
        const fromBlock = this.blocks.find(block => block.userData.id === fromId);
        const toBlock = this.blocks.find(block => block.userData.id === toId);
        
        if (!fromBlock || !toBlock) return;
        
        // トランザクションのジオメトリ
        const geometry = new THREE.SphereGeometry(0.3, 16, 16);
        
        // トランザクションのマテリアル
        const material = new THREE.MeshBasicMaterial({
            color: this.colors.transaction,
            transparent: true,
            opacity: 0.8
        });
        
        // トランザクションのメッシュ
        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.copy(fromBlock.position);
        
        // シーンに追加
        this.scene.add(mesh);
        
        // トランザクションデータ
        this.transactions.push({
            mesh,
            fromBlock,
            toBlock,
            progress: 0,
            speed: 0.01 + Math.random() * 0.01
        });
    }
    
    updateTransactions() {
        // トランザクションの更新
        this.transactions = this.transactions.filter(tx => {
            // 進行状況を更新
            tx.progress += tx.speed;
            
            if (tx.progress >= 1) {
                // トランザクション完了
                this.scene.remove(tx.mesh);
                return false;
            }
            
            // 位置を更新
            const fromPos = tx.fromBlock.position;
            const toPos = tx.toBlock.position;
            
            tx.mesh.position.x = fromPos.x + (toPos.x - fromPos.x) * tx.progress;
            tx.mesh.position.y = fromPos.y + (toPos.y - fromPos.y) * tx.progress;
            tx.mesh.position.z = fromPos.z + (toPos.z - fromPos.z) * tx.progress;
            
            return true;
        });
        
        // ランダムにトランザクションを生成
        if (Math.random() < 0.05 && this.blocks.length > 1) {
            const fromId = Math.floor(Math.random() * this.blocks.length);
            let toId;
            do {
                toId = Math.floor(Math.random() * this.blocks.length);
            } while (toId === fromId);
            
            this.createTransaction(
                this.blocks[fromId].userData.id,
                this.blocks[toId].userData.id
            );
        }
    }
    
    animate() {
        requestAnimationFrame(this.animate.bind(this));
        
        // コントロールの更新
        this.controls.update();
        
        // パーティクルの回転
        this.particleSystem.rotation.y += 0.0005;
        
        // ブロックの回転
        this.blocks.forEach(block => {
            block.rotation.x += 0.005;
            block.rotation.y += 0.005;
        });
        
        // トランザクションの更新
        this.updateTransactions();
        
        // レンダリング
        this.composer.render();
    }
    
    onWindowResize() {
        // カメラのアスペクト比を更新
        this.camera.aspect = this.canvas.clientWidth / this.canvas.clientHeight;
        this.camera.updateProjectionMatrix();
        
        // レンダラーとコンポーザーのサイズを更新
        this.renderer.setSize(this.canvas.clientWidth, this.canvas.clientHeight);
        this.composer.setSize(this.canvas.clientWidth, this.canvas.clientHeight);
    }
    
    // テーマ変更時の色の更新
    updateColors(isDarkMode) {
        this.isDarkMode = isDarkMode;
        
        // 色を更新
        this.colors.primary = this.getComputedColor('--primary-color');
        this.colors.secondary = this.getComputedColor('--secondary-color');
        this.colors.accent = this.getComputedColor('--accent-color');
        this.colors.background = this.isDarkMode ? new THREE.Color(0x1c1c1e) : new THREE.Color(0xf5f5f7);
        this.colors.block = this.isDarkMode ? new THREE.Color(0x0a84ff) : new THREE.Color(0x0071e3);
        this.colors.genesis = this.isDarkMode ? new THREE.Color(0x5e5ce6) : new THREE.Color(0x5e5ce6);
        this.colors.connection = this.isDarkMode ? new THREE.Color(0x5e9eff) : new THREE.Color(0x86b9ff);
        
        // パーティクルの色を更新
        this.particleSystem.material.color = this.colors.primary;
        
        // ブロックの色を更新
        this.blocks.forEach(block => {
            const material = block.material;
            if (block.userData.isGenesis) {
                material.color = this.colors.genesis;
                material.emissive = this.colors.genesis;
            } else {
                material.color = this.colors.block;
                material.emissive = this.colors.block;
            }
        });
        
        // 接続線の色を更新
        this.connections.forEach(connection => {
            connection.line.material.color = this.colors.connection;
        });
    }
}

// DOMが読み込まれたら初期化
document.addEventListener('DOMContentLoaded', function() {
    // Three.jsとその拡張機能が読み込まれているか確認
    if (typeof THREE !== 'undefined' && 
        typeof THREE.OrbitControls !== 'undefined' && 
        typeof THREE.EffectComposer !== 'undefined') {
        
        const visualizer = new BlockchainVisualizer('blockchain-canvas');
        
        // テーマ変更を監視
        if (window.themeManager) {
            window.themeManager.addObserver((theme) => {
                visualizer.updateColors(theme === 'dark');
            });
        }
    } else {
        console.warn('Three.js or its extensions are not loaded. The 3D blockchain visualization will not work.');
    }
});