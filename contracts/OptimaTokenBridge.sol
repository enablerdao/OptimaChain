// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

/**
 * @title OptimaChain Token Bridge
 * @dev クロスチェーンブリッジコントラクト - 異なるブロックチェーン間のトークン移動を管理
 */
contract OptimaTokenBridge {
    // イベント定義
    event TokenLocked(address indexed from, uint256 amount, bytes32 targetChain, bytes32 targetAddress);
    event TokenReleased(address indexed to, uint256 amount, bytes32 sourceChain, bytes32 sourceAddress);
    
    // ブリッジ管理者アドレス
    address public admin;
    // バリデータアドレスのマッピング
    mapping(address => bool) public validators;
    // バリデータ数
    uint256 public validatorCount;
    // トランザクション承認に必要なバリデータ数
    uint256 public requiredValidations;
    
    // クロスチェーントランザクション構造体
    struct CrossChainTx {
        bytes32 txHash;
        bytes32 sourceChain;
        bytes32 targetChain;
        address sourceAddress;
        bytes32 targetAddress;
        uint256 amount;
        bool executed;
        uint256 validationCount;
    }
    
    // トランザクションハッシュ => トランザクション情報のマッピング
    mapping(bytes32 => CrossChainTx) public transactions;
    // トランザクションハッシュ => バリデータアドレス => 検証状態のマッピング
    mapping(bytes32 => mapping(address => bool)) public validations;
    
    // 管理者のみ実行可能な修飾子
    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin can call this function");
        _;
    }
    
    // バリデータのみ実行可能な修飾子
    modifier onlyValidator() {
        require(validators[msg.sender], "Only validator can call this function");
        _;
    }
    
    /**
     * @dev コンストラクタ
     * @param _validators バリデータアドレスの配列
     * @param _requiredValidations 必要な検証数
     */
    constructor(address[] memory _validators, uint256 _requiredValidations) {
        require(_validators.length > 0, "Validators required");
        require(_requiredValidations > 0 && _requiredValidations <= _validators.length, 
                "Invalid number of required validations");
        
        admin = msg.sender;
        
        for (uint256 i = 0; i < _validators.length; i++) {
            address validator = _validators[i];
            require(validator != address(0), "Invalid validator address");
            require(!validators[validator], "Duplicate validator");
            
            validators[validator] = true;
        }
        
        validatorCount = _validators.length;
        requiredValidations = _requiredValidations;
    }
    
    /**
     * @dev トークンをロックしてブリッジを開始する
     * @param _targetChain 送金先チェーンID
     * @param _targetAddress 送金先アドレス
     */
    function lockTokens(bytes32 _targetChain, bytes32 _targetAddress) external payable {
        require(msg.value > 0, "Amount must be greater than 0");
        
        // トランザクションハッシュを生成
        bytes32 txHash = keccak256(abi.encodePacked(
            block.timestamp,
            msg.sender,
            msg.value,
            _targetChain,
            _targetAddress
        ));
        
        // トランザクション情報を保存
        transactions[txHash] = CrossChainTx({
            txHash: txHash,
            sourceChain: bytes32("ethereum"),
            targetChain: _targetChain,
            sourceAddress: msg.sender,
            targetAddress: _targetAddress,
            amount: msg.value,
            executed: false,
            validationCount: 0
        });
        
        emit TokenLocked(msg.sender, msg.value, _targetChain, _targetAddress);
    }
    
    /**
     * @dev バリデータがクロスチェーントランザクションを検証する
     * @param _txHash トランザクションハッシュ
     * @param _sourceChain 送金元チェーンID
     * @param _sourceAddress 送金元アドレス
     * @param _amount 送金額
     */
    function validateTransaction(
        bytes32 _txHash,
        bytes32 _sourceChain,
        bytes32 _sourceAddress,
        uint256 _amount
    ) external onlyValidator {
        require(!validations[_txHash][msg.sender], "Already validated by this validator");
        
        // 新しいトランザクションの場合は作成
        if (transactions[_txHash].txHash == bytes32(0)) {
            transactions[_txHash] = CrossChainTx({
                txHash: _txHash,
                sourceChain: _sourceChain,
                targetChain: bytes32("ethereum"),
                sourceAddress: address(bytes20(_sourceAddress)),
                targetAddress: bytes32(0),
                amount: _amount,
                executed: false,
                validationCount: 0
            });
        }
        
        // 検証を記録
        validations[_txHash][msg.sender] = true;
        transactions[_txHash].validationCount += 1;
        
        // 必要な検証数に達したら実行
        if (transactions[_txHash].validationCount >= requiredValidations && !transactions[_txHash].executed) {
            executeRelease(_txHash);
        }
    }
    
    /**
     * @dev トークンの解放を実行する（内部関数）
     * @param _txHash トランザクションハッシュ
     */
    function executeRelease(bytes32 _txHash) internal {
        CrossChainTx storage transaction = transactions[_txHash];
        require(!transaction.executed, "Transaction already executed");
        require(transaction.validationCount >= requiredValidations, "Not enough validations");
        
        transaction.executed = true;
        
        // トークンを送金先に解放
        address payable recipient = payable(transaction.sourceAddress);
        (bool success, ) = recipient.call{value: transaction.amount}("");
        require(success, "Token release failed");
        
        emit TokenReleased(
            transaction.sourceAddress,
            transaction.amount,
            transaction.sourceChain,
            transaction.targetAddress
        );
    }
    
    /**
     * @dev バリデータを追加する
     * @param _validator 追加するバリデータアドレス
     */
    function addValidator(address _validator) external onlyAdmin {
        require(_validator != address(0), "Invalid validator address");
        require(!validators[_validator], "Already a validator");
        
        validators[_validator] = true;
        validatorCount += 1;
    }
    
    /**
     * @dev バリデータを削除する
     * @param _validator 削除するバリデータアドレス
     */
    function removeValidator(address _validator) external onlyAdmin {
        require(validators[_validator], "Not a validator");
        require(validatorCount > requiredValidations, "Cannot remove validator below required threshold");
        
        validators[_validator] = false;
        validatorCount -= 1;
    }
    
    /**
     * @dev 必要な検証数を更新する
     * @param _requiredValidations 新しい必要検証数
     */
    function updateRequiredValidations(uint256 _requiredValidations) external onlyAdmin {
        require(_requiredValidations > 0 && _requiredValidations <= validatorCount, 
                "Invalid number of required validations");
        
        requiredValidations = _requiredValidations;
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
}