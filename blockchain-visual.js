class BlockchainVisualizer {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.blocks = [];
        this.transactions = [];
        this.maxBlocks = 8;
        this.blockWidth = 80;
        this.blockHeight = 50;
        this.blockGap = 20;
        this.transactionSpeed = 3;
        
        // Resize canvas to fit container
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());
        
        // Initialize blocks
        this.initializeBlocks();
        
        // Start animation
        this.animate();
        
        // Periodically add new transactions
        setInterval(() => this.addTransaction(), 500);
        
        // Periodically add new blocks
        setInterval(() => this.addBlock(), 5000);
    }
    
    resizeCanvas() {
        const container = this.canvas.parentElement;
        this.canvas.width = container.offsetWidth;
        this.canvas.height = 200;
        
        // Recalculate block positions after resize
        if (this.blocks.length > 0) {
            this.updateBlockPositions();
        }
    }
    
    initializeBlocks() {
        const startX = 50;
        const y = this.canvas.height / 2 - this.blockHeight / 2;
        
        for (let i = 0; i < this.maxBlocks; i++) {
            this.blocks.push({
                x: startX + i * (this.blockWidth + this.blockGap),
                y: y,
                width: this.blockWidth,
                height: this.blockHeight,
                color: i === this.maxBlocks - 1 ? '#a777e3' : '#6e8efb',
                id: i + 1,
                transactions: Math.floor(Math.random() * 50) + 20
            });
        }
    }
    
    updateBlockPositions() {
        const startX = 50;
        const y = this.canvas.height / 2 - this.blockHeight / 2;
        
        this.blocks.forEach((block, i) => {
            block.x = startX + i * (this.blockWidth + this.blockGap);
            block.y = y;
        });
    }
    
    addTransaction() {
        // Add a new transaction starting from random position at the top
        const startX = Math.random() * this.canvas.width;
        
        // Find the newest block (rightmost)
        const targetBlock = this.blocks[this.blocks.length - 1];
        
        this.transactions.push({
            x: startX,
            y: 0,
            targetX: targetBlock.x + this.blockWidth / 2,
            targetY: targetBlock.y,
            color: `hsl(${Math.random() * 60 + 220}, 80%, 60%)`,
            size: Math.random() * 3 + 2,
            speed: Math.random() * 2 + 1
        });
        
        // Limit the number of active transactions
        if (this.transactions.length > 50) {
            this.transactions.shift();
        }
    }
    
    addBlock() {
        // Update colors of existing blocks
        this.blocks.forEach(block => {
            block.color = '#6e8efb';
        });
        
        // Add a new block
        const lastBlock = this.blocks[this.blocks.length - 1];
        const newBlockId = lastBlock.id + 1;
        
        this.blocks.push({
            x: lastBlock.x + this.blockWidth + this.blockGap,
            y: lastBlock.y,
            width: this.blockWidth,
            height: this.blockHeight,
            color: '#a777e3',
            id: newBlockId,
            transactions: Math.floor(Math.random() * 50) + 20
        });
        
        // Remove oldest block if we exceed the maximum
        if (this.blocks.length > this.maxBlocks) {
            this.blocks.shift();
            this.updateBlockPositions();
        }
    }
    
    animate() {
        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw connections between blocks
        this.drawConnections();
        
        // Update and draw transactions
        this.updateTransactions();
        
        // Draw blocks
        this.drawBlocks();
        
        // Continue animation
        requestAnimationFrame(() => this.animate());
    }
    
    drawConnections() {
        this.ctx.beginPath();
        this.ctx.strokeStyle = '#5469d4';
        this.ctx.lineWidth = 2;
        
        for (let i = 1; i < this.blocks.length; i++) {
            const prevBlock = this.blocks[i-1];
            const currBlock = this.blocks[i];
            
            this.ctx.moveTo(prevBlock.x + prevBlock.width, prevBlock.y + prevBlock.height/2);
            this.ctx.lineTo(currBlock.x, currBlock.y + currBlock.height/2);
        }
        
        this.ctx.stroke();
    }
    
    updateTransactions() {
        // Draw and update transactions
        for (let i = this.transactions.length - 1; i >= 0; i--) {
            const tx = this.transactions[i];
            
            // Calculate direction vector
            const dx = tx.targetX - tx.x;
            const dy = tx.targetY - tx.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            // Move transaction toward target
            if (distance > 5) {
                tx.x += (dx / distance) * tx.speed;
                tx.y += (dy / distance) * tx.speed;
                
                // Draw transaction
                this.ctx.beginPath();
                this.ctx.fillStyle = tx.color;
                this.ctx.arc(tx.x, tx.y, tx.size, 0, Math.PI * 2);
                this.ctx.fill();
                
                // Draw trail
                this.ctx.beginPath();
                this.ctx.strokeStyle = tx.color;
                this.ctx.globalAlpha = 0.3;
                this.ctx.lineWidth = tx.size / 2;
                this.ctx.moveTo(tx.x, tx.y);
                this.ctx.lineTo(tx.x - (dx / distance) * 10, tx.y - (dy / distance) * 10);
                this.ctx.stroke();
                this.ctx.globalAlpha = 1;
            } else {
                // Transaction reached its target, remove it
                this.transactions.splice(i, 1);
                
                // Increment the transaction count of the target block
                const targetBlock = this.blocks[this.blocks.length - 1];
                targetBlock.transactions++;
            }
        }
    }
    
    drawBlocks() {
        this.blocks.forEach(block => {
            // Draw block
            this.ctx.fillStyle = block.color;
            this.ctx.fillRect(block.x, block.y, block.width, block.height);
            
            // Draw block border
            this.ctx.strokeStyle = '#ffffff';
            this.ctx.lineWidth = 1;
            this.ctx.strokeRect(block.x, block.y, block.width, block.height);
            
            // Draw block number
            this.ctx.fillStyle = 'white';
            this.ctx.font = '12px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText(`Block ${block.id}`, block.x + block.width/2, block.y + block.height/2);
            
            // Draw transaction count
            this.ctx.font = '10px Arial';
            this.ctx.fillText(`${block.transactions} tx`, block.x + block.width/2, block.y + block.height/2 + 15);
        });
    }
}

// Initialize when the DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    const canvas = document.getElementById('blockchain-canvas');
    if (canvas) {
        new BlockchainVisualizer('blockchain-canvas');
    }
});