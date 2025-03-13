// OptimaChain固有のJavaScript機能

document.addEventListener('DOMContentLoaded', function() {
    // 特徴セクションのアニメーション
    const featureCards = document.querySelectorAll('.feature-card');
    
    featureCards.forEach((card, index) => {
        card.classList.add('scroll-reveal');
        card.style.transitionDelay = `${index * 0.1}s`;
    });
    
    // ロードマップのアニメーション
    const roadmapItems = document.querySelectorAll('.roadmap-item');
    
    roadmapItems.forEach((item) => {
        item.classList.add('scroll-reveal');
    });
    
    // DEXデモのインタラクティブな要素
    const dexSection = document.querySelector('#features');
    
    if (dexSection) {
        const dexFeature = dexSection.querySelector('h3:contains("高性能DEX")');
        
        if (dexFeature) {
            const dexCard = dexFeature.closest('.feature-card');
            
            if (dexCard) {
                const demoButton = document.createElement('button');
                demoButton.textContent = 'DEXデモを見る';
                demoButton.className = 'bg-green-600 hover:bg-green-500 text-white rounded px-3 py-1 mt-4 text-sm focus:outline-none';
                
                dexCard.appendChild(demoButton);
                
                demoButton.addEventListener('click', function() {
                    // DEXデモのモーダルを表示
                    const modal = document.createElement('div');
                    modal.className = 'fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50';
                    modal.innerHTML = `
                        <div class="bg-gray-800 p-6 rounded-lg max-w-2xl w-full">
                            <div class="flex justify-between items-center mb-4">
                                <h3 class="text-xl font-bold">OptimaChain DEXデモ</h3>
                                <button class="text-gray-400 hover:text-white focus:outline-none" id="close-modal">
                                    <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                            <div class="mb-4">
                                <div class="bg-gray-900 p-4 rounded mb-4">
                                    <div class="flex justify-between items-center mb-2">
                                        <div class="flex items-center">
                                            <div class="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center mr-2">ETH</div>
                                            <span>Ethereum</span>
                                        </div>
                                        <input type="text" value="1.0" class="bg-gray-700 rounded px-3 py-1 w-24 text-right">
                                    </div>
                                    <div class="flex justify-center my-2">
                                        <button class="bg-green-600 rounded-full p-2">
                                            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                                            </svg>
                                        </button>
                                    </div>
                                    <div class="flex justify-between items-center">
                                        <div class="flex items-center">
                                            <div class="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center mr-2">OPC</div>
                                            <span>OptimaChain</span>
                                        </div>
                                        <input type="text" value="1,250.00" class="bg-gray-700 rounded px-3 py-1 w-24 text-right">
                                    </div>
                                </div>
                                <div class="bg-gray-700 p-3 rounded">
                                    <div class="flex justify-between text-sm mb-1">
                                        <span>レート</span>
                                        <span>1 ETH = 1,250 OPC</span>
                                    </div>
                                    <div class="flex justify-between text-sm mb-1">
                                        <span>スリッページ</span>
                                        <span class="text-green-400">0.05%</span>
                                    </div>
                                    <div class="flex justify-between text-sm">
                                        <span>ガス料金</span>
                                        <span class="text-green-400">$0.12</span>
                                    </div>
                                </div>
                            </div>
                            <div class="text-center">
                                <button class="bg-green-600 hover:bg-green-500 text-white rounded-lg px-6 py-3 w-full font-medium focus:outline-none">スワップ</button>
                            </div>
                        </div>
                    `;
                    
                    document.body.appendChild(modal);
                    
                    document.getElementById('close-modal').addEventListener('click', function() {
                        document.body.removeChild(modal);
                    });
                });
            }
        }
    }
});