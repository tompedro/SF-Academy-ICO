pragma solidity >=0.4.21 <0.6.0;
import "./Token.sol";

contract TokenMarketplace{
    address public admin;
    uint256 public tokenPrice;
    Token public token;

    struct TokenMarket{
        uint256 id;
        address owner;
        uint price;
        uint256 tokens;
        bool purchased;
    }

    event BalanceDollar(
        address _address,
        uint dollar
    );
    event TokenBalance(
        address _address,
        uint tokens
    );

    event TokenOrdered(
        uint id,
        uint price,
        address owner,
        uint256 tokens,
        bool purchased
    );

    event TokenPurchased(
        uint id,
        uint price,
        address owner,
        uint256 tokens,
        bool purchased
    );

    event DollarsDeposit(
        address account,
        uint256 dollars,
        uint256 newBalance
    );

    mapping(address => uint256) public dollars;
    mapping(uint => TokenMarket) public offers;
    uint256 public offersIndex;

    constructor(Token _token,uint256 _price) public{
        admin = msg.sender;
        token = _token;
        tokenPrice = _price;
    }   

    function depositDollars(address _address,uint256 _value) public{
        dollars[_address] = _value;
        
        emit DollarsDeposit(_address,_value,dollars[_address]);
    }

    function transferDollars(address _from,address _to,uint256 _value) public returns(bool success){
        require(dollars[_from] >= _value,"not enough money");

        dollars[_from] -= _value;
        dollars[_to] += _value;

        return true;
    }

    function getDollars(address _address) public returns(uint256 gotDollars){
        emit BalanceDollar(_address,dollars[_address]);
        return dollars[_address];
    }

    function sell(uint nTokens, uint _price) public{
        require(token.getBalance(msg.sender) >= nTokens,"Seller not have enough tokens;");
        require(nTokens > 0,"Error rejected");
        require(_price > 0,"Error rejected");

        offers[offersIndex] = TokenMarket(offersIndex,msg.sender,_price,nTokens,false);
    
        //event
        
        emit TokenOrdered(offersIndex,_price,msg.sender,nTokens,false);
        offersIndex++;
    }

    function buy(uint _id) public{
        TokenMarket memory offer = offers[_id];

        require(_id < offersIndex,"Not exists");
        require(offer.purchased == false,"Purchased yet");
        require(dollars[msg.sender] >= offer.price,"Buyer not have enough moneys;");
        require(token.transfer(offer.owner,msg.sender,offer.tokens),"Error");
        require(transferDollars(msg.sender,offer.owner, offer.price),"Error");
        
        offer.purchased = true;
        offers[_id].purchased = true;

        //event
        emit TokenPurchased(_id,offer.price,msg.sender,offer.tokens,true);
    }

    function getTokensBalance(address _address) public returns(uint256 gotBalance){
        emit TokenBalance(_address, token.getBalance(_address));
        return token.getBalance(_address);
    }
}