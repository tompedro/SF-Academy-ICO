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

        address inv1 = 0x621d58Ed97F126d5DF7c55f951eaea87e888AFf1;
        address inv2 = 0x6d53E5134EB72A66970Db0f13e11bb8eFa0aF550;
        address inv3 = 0x6192c2D89cc95764420b26d36861340Dd143177C;
        address[] memory invs = new address[](3);
        invs[0] = inv1;
        invs[1] = inv2;
        invs[2] = inv3;

        uint256[] memory balances = new uint256[](3);
        balances[0] = 1000000;
        balances[1] = 2500000;
        balances[2] = 10000000;

        require(airdrop(owner,invs,balances),"Error while airdropping");
        require(burn(owner,20000000-(balances[0]+balances[1]+balances[2])),"Error while burning");
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

    function airdrop(address _from,address[] memory _to,uint256[] memory _ammount) public returns(bool success){

        for(uint256 i = 0; i < _to.length;i++){

            require(balance[_from] >= _ammount[i],"The sender not have enough tokens!");

            balance[_from] -= _ammount[i];
            balance[_to[i]] += _ammount[i];

            emit Transfer(_from,_to[i],_ammount[i]);
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