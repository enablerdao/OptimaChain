// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

/**
 * @title OptimaChain MultiSig Wallet
 * @dev マルチシグネチャウォレットコントラクト - 複数の署名者による承認が必要な取引を実行
 */
contract MultiSigWallet {
    // イベント定義
    event Deposit(address indexed sender, uint amount, uint balance);
    event SubmitTransaction(
        address indexed owner,
        uint indexed txIndex,
        address indexed to,
        uint value,
        bytes data
    );
    event ConfirmTransaction(address indexed owner, uint indexed txIndex);
    event RevokeConfirmation(address indexed owner, uint indexed txIndex);
    event ExecuteTransaction(address indexed owner, uint indexed txIndex);

    // オーナーアドレスの配列
    address[] public owners;
    // アドレスがオーナーかどうかのマッピング
    mapping(address => bool) public isOwner;
    // トランザクション実行に必要な承認数
    uint public numConfirmationsRequired;

    // トランザクション構造体
    struct Transaction {
        address to;
        uint value;
        bytes data;
        bool executed;
        uint numConfirmations;
    }

    // トランザクションID => オーナーアドレス => 承認状態のマッピング
    mapping(uint => mapping(address => bool)) public isConfirmed;
    // トランザクション配列
    Transaction[] public transactions;

    // オーナーのみ実行可能な修飾子
    modifier onlyOwner() {
        require(isOwner[msg.sender], "not owner");
        _;
    }

    // トランザクションが存在する場合のみ実行可能な修飾子
    modifier txExists(uint _txIndex) {
        require(_txIndex < transactions.length, "tx does not exist");
        _;
    }

    // トランザクションが未実行の場合のみ実行可能な修飾子
    modifier notExecuted(uint _txIndex) {
        require(!transactions[_txIndex].executed, "tx already executed");
        _;
    }

    // トランザクションが未承認の場合のみ実行可能な修飾子
    modifier notConfirmed(uint _txIndex) {
        require(!isConfirmed[_txIndex][msg.sender], "tx already confirmed");
        _;
    }

    /**
     * @dev コンストラクタ
     * @param _owners オーナーアドレスの配列
     * @param _numConfirmationsRequired 必要な承認数
     */
    constructor(address[] memory _owners, uint _numConfirmationsRequired) {
        require(_owners.length > 0, "owners required");
        require(
            _numConfirmationsRequired > 0 &&
                _numConfirmationsRequired <= _owners.length,
            "invalid number of required confirmations"
        );

        for (uint i = 0; i < _owners.length; i++) {
            address owner = _owners[i];

            require(owner != address(0), "invalid owner");
            require(!isOwner[owner], "owner not unique");

            isOwner[owner] = true;
            owners.push(owner);
        }

        numConfirmationsRequired = _numConfirmationsRequired;
    }

    /**
     * @dev ETHを受け取るための関数
     */
    receive() external payable {
        emit Deposit(msg.sender, msg.value, address(this).balance);
    }

    /**
     * @dev 新しいトランザクションを提案する
     * @param _to 送金先アドレス
     * @param _value 送金額
     * @param _data トランザクションデータ
     * @return トランザクションインデックス
     */
    function submitTransaction(
        address _to,
        uint _value,
        bytes memory _data
    ) public onlyOwner returns (uint) {
        uint txIndex = transactions.length;

        transactions.push(
            Transaction({
                to: _to,
                value: _value,
                data: _data,
                executed: false,
                numConfirmations: 0
            })
        );

        emit SubmitTransaction(msg.sender, txIndex, _to, _value, _data);
        return txIndex;
    }

    /**
     * @dev トランザクションを承認する
     * @param _txIndex トランザクションインデックス
     */
    function confirmTransaction(uint _txIndex)
        public
        onlyOwner
        txExists(_txIndex)
        notExecuted(_txIndex)
        notConfirmed(_txIndex)
    {
        Transaction storage transaction = transactions[_txIndex];
        transaction.numConfirmations += 1;
        isConfirmed[_txIndex][msg.sender] = true;

        emit ConfirmTransaction(msg.sender, _txIndex);
    }

    /**
     * @dev トランザクションを実行する
     * @param _txIndex トランザクションインデックス
     */
    function executeTransaction(uint _txIndex)
        public
        onlyOwner
        txExists(_txIndex)
        notExecuted(_txIndex)
    {
        Transaction storage transaction = transactions[_txIndex];

        require(
            transaction.numConfirmations >= numConfirmationsRequired,
            "cannot execute tx"
        );

        transaction.executed = true;

        (bool success, ) = transaction.to.call{value: transaction.value}(
            transaction.data
        );
        require(success, "tx failed");

        emit ExecuteTransaction(msg.sender, _txIndex);
    }

    /**
     * @dev トランザクションの承認を取り消す
     * @param _txIndex トランザクションインデックス
     */
    function revokeConfirmation(uint _txIndex)
        public
        onlyOwner
        txExists(_txIndex)
        notExecuted(_txIndex)
    {
        require(isConfirmed[_txIndex][msg.sender], "tx not confirmed");

        Transaction storage transaction = transactions[_txIndex];
        transaction.numConfirmations -= 1;
        isConfirmed[_txIndex][msg.sender] = false;

        emit RevokeConfirmation(msg.sender, _txIndex);
    }

    /**
     * @dev オーナーアドレスの一覧を取得
     * @return オーナーアドレスの配列
     */
    function getOwners() public view returns (address[] memory) {
        return owners;
    }

    /**
     * @dev トランザクション数を取得
     * @return トランザクション数
     */
    function getTransactionCount() public view returns (uint) {
        return transactions.length;
    }

    /**
     * @dev トランザクション情報を取得
     * @param _txIndex トランザクションインデックス
     * @return to 送金先アドレス
     * @return value 送金額
     * @return data トランザクションデータ
     * @return executed 実行済みフラグ
     * @return numConfirmations 承認数
     */
    function getTransaction(uint _txIndex)
        public
        view
        returns (
            address to,
            uint value,
            bytes memory data,
            bool executed,
            uint numConfirmations
        )
    {
        Transaction storage transaction = transactions[_txIndex];

        return (
            transaction.to,
            transaction.value,
            transaction.data,
            transaction.executed,
            transaction.numConfirmations
        );
    }
}