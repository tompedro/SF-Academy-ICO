pragma solidity >=0.4.21 <0.6.0;

contract Token{
    address public owner;
    string public name = "T-Coin";
    string public symbol = "TC";
    uint256 public totalAmmount;

    mapping (address => uint256) public balance;

    event Transfer(
        address _from,
        address _to,
        uint256 _ammount
    );
    event Airdrop(
        address _from,
        address[] _to,
        uint256[] _ammounts
    );

    event Burn(
        address _address,
        uint256 _ammount
    );

    event Balance(
        address _address,
        uint256 _balance
    );

    constructor (uint256 _total) public{
        owner = msg.sender;
        name = "T-Coin";
        symbol = "TC";
        totalAmmount = _total;
        //give myself total
        balance[owner] = totalAmmount;
    }

    function depositTokens(address _address,uint256 _value) public returns(uint256 newBalance){
        balance[_address] = _value;
        return balance[_address];
    }

    function transfer(address _from,address _to,uint256 _ammount) public returns(bool success){
        //require _from have tokens
        require(balance[_from] >= _ammount,"The sender not have enough tokens!");

        //transfer
        balance[_from] -= _ammount;
        balance[_to] += _ammount;

        emit Transfer(_from,_to,_ammount);

        return true;
    }

    function airdrop(address[] memory _to,uint256[] memory _ammount) public returns(bool success){

        for(uint256 i = 0; i <= _to.length;i++){

            require(balance[msg.sender] >= _ammount[i],"The sender not have enough tokens!");

            balance[msg.sender] -= _ammount[i];
            balance[_to[i]] += _ammount[i];

            emit Transfer(msg.sender,_to[i],_ammount[i]);
        }
        return true;
    }

    function burn(address _address,uint256 _ammount) public returns(bool success){
        require(balance[_address] >= _ammount,"The address not have enough tokens to burn!");

        balance[_address] -= _ammount;

        emit Burn(_address,_ammount);
        return true;
    }

    function getBalance(address _address) public returns(uint256 gotbalance){
        emit Balance(_address,balance[_address]);
        return balance[_address];
    }
}