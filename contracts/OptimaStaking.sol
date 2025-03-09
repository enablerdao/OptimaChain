// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

/**
 * @title OptimaChain Staking Contract
 * @dev ステーキングコントラクト - バリデータのステーキングと報酬分配を管理
 */
contract OptimaStaking {
    // イベント定義
    event Staked(address indexed user, uint256 amount, uint256 timestamp);
    event Unstaked(address indexed user, uint256 amount, uint256 timestamp);
    event RewardClaimed(address indexed user, uint256 amount, uint256 timestamp);
    
    // ステーキング情報構造体
    struct StakeInfo {
        uint256 amount;
        uint256 stakedAt;
        uint256 lastClaimedAt;
    }
    
    // ユーザーアドレス => ステーキング情報のマッピング
    mapping(address => StakeInfo) public stakes;
    
    // 総ステーキング量
    uint256 public totalStaked;
    
    // 年間報酬率（10000 = 100%）
    uint256 public annualRewardRate = 500; // 5%
    
    // 最小ステーキング期間（秒）
    uint256 public minimumStakingPeriod = 7 days;
    
    // コントラクト管理者
    address public admin;
    
    // 管理者のみ実行可能な修飾子
    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin can call this function");
        _;
    }
    
    /**
     * @dev コンストラクタ
     */
    constructor() {
        admin = msg.sender;
    }
    
    /**
     * @dev トークンをステーキングする
     */
    function stake() external payable {
        require(msg.value > 0, "Stake amount must be greater than 0");
        
        StakeInfo storage userStake = stakes[msg.sender];
        
        // 既存のステーキングがある場合は報酬を計算して加算
        if (userStake.amount > 0) {
            uint256 reward = calculateReward(msg.sender);
            userStake.amount += reward;
        }
        
        // 新しいステーキング情報を更新
        userStake.amount += msg.value;
        userStake.stakedAt = block.timestamp;
        userStake.lastClaimedAt = block.timestamp;
        
        // 総ステーキング量を更新
        totalStaked += msg.value;
        
        emit Staked(msg.sender, msg.value, block.timestamp);
    }
    
    /**
     * @dev ステーキングを解除する
     * @param _amount 解除する金額
     */
    function unstake(uint256 _amount) external {
        StakeInfo storage userStake = stakes[msg.sender];
        require(userStake.amount >= _amount, "Insufficient staked amount");
        require(block.timestamp >= userStake.stakedAt + minimumStakingPeriod, "Minimum staking period not reached");
        
        // 報酬を計算
        uint256 reward = calculateReward(msg.sender);
        
        // ステーキング情報を更新
        userStake.amount -= _amount;
        userStake.lastClaimedAt = block.timestamp;
        
        // 総ステーキング量を更新
        totalStaked -= _amount;
        
        // 解除金額と報酬を送金
        uint256 totalAmount = _amount + reward;
        (bool success, ) = msg.sender.call{value: totalAmount}("");
        require(success, "Transfer failed");
        
        emit Unstaked(msg.sender, _amount, block.timestamp);
        if (reward > 0) {
            emit RewardClaimed(msg.sender, reward, block.timestamp);
        }
    }
    
    /**
     * @dev 報酬のみを請求する
     */
    function claimReward() external {
        StakeInfo storage userStake = stakes[msg.sender];
        require(userStake.amount > 0, "No stake found");
        
        uint256 reward = calculateReward(msg.sender);
        require(reward > 0, "No reward to claim");
        
        // 最終請求時間を更新
        userStake.lastClaimedAt = block.timestamp;
        
        // 報酬を送金
        (bool success, ) = msg.sender.call{value: reward}("");
        require(success, "Transfer failed");
        
        emit RewardClaimed(msg.sender, reward, block.timestamp);
    }
    
    /**
     * @dev ユーザーの報酬を計算する
     * @param _user ユーザーアドレス
     * @return 報酬額
     */
    function calculateReward(address _user) public view returns (uint256) {
        StakeInfo storage userStake = stakes[_user];
        if (userStake.amount == 0) {
            return 0;
        }
        
        // 経過時間（秒）
        uint256 timeElapsed = block.timestamp - userStake.lastClaimedAt;
        
        // 報酬計算: 金額 * 年間報酬率 * 経過時間 / (365日 * 24時間 * 60分 * 60秒) / 10000
        uint256 reward = userStake.amount * annualRewardRate * timeElapsed / (365 days) / 10000;
        
        return reward;
    }
    
    /**
     * @dev ユーザーのステーキング情報を取得する
     * @param _user ユーザーアドレス
     * @return amount ステーキング金額
     * @return stakedAt ステーキング開始時間
     * @return lastClaimedAt 最終報酬請求時間
     * @return pendingReward 未請求の報酬
     */
    function getStakeInfo(address _user) external view returns (
        uint256 amount,
        uint256 stakedAt,
        uint256 lastClaimedAt,
        uint256 pendingReward
    ) {
        StakeInfo storage userStake = stakes[_user];
        return (
            userStake.amount,
            userStake.stakedAt,
            userStake.lastClaimedAt,
            calculateReward(_user)
        );
    }
    
    /**
     * @dev 年間報酬率を更新する
     * @param _newRate 新しい年間報酬率
     */
    function updateAnnualRewardRate(uint256 _newRate) external onlyAdmin {
        require(_newRate <= 3000, "Rate too high"); // 最大30%
        annualRewardRate = _newRate;
    }
    
    /**
     * @dev 最小ステーキング期間を更新する
     * @param _newPeriod 新しい最小ステーキング期間（秒）
     */
    function updateMinimumStakingPeriod(uint256 _newPeriod) external onlyAdmin {
        require(_newPeriod <= 365 days, "Period too long"); // 最大1年
        minimumStakingPeriod = _newPeriod;
    }
    
    /**
     * @dev 管理者を変更する
     * @param _newAdmin 新しい管理者アドレス
     */
    function transferAdmin(address _newAdmin) external onlyAdmin {
        require(_newAdmin != address(0), "Invalid admin address");
        admin = _newAdmin;
    }
    
    /**
     * @dev コントラクトの残高を確認する
     * @return コントラクトの残高
     */
    function getBalance() external view returns (uint256) {
        return address(this).balance;
    }
    
    /**
     * @dev ETHを受け取るための関数
     */
    receive() external payable {
        // コントラクトに直接送金された場合は、総ステーキング量に加算しない
    }
}