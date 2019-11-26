const ICO = artifacts.require("./TokenMarketplace.sol")
const token = artifacts.require("./Token.sol")

require('chai')
    .use(require('chai-as-promised'))
    .should()

contract('Token',([seller,buyer]) =>{
    let Coin

    before(async()=>{
        Coin = await token.deployed()
    })

    describe('deployment',async() =>{
        it('deploys successfully', async() =>{
            const address = await Coin.owner
            assert.notEqual(address,0x0)
            assert.notEqual(address,'')
            assert.notEqual(address,null)
            assert.notEqual(address,undefined)
        })
        it('name of token',async() =>{
            const name = await Coin.name()
            const sym = await Coin.symbol()
            assert.equal(name,"T-Coin")
            assert.equal(sym,"TC")
        })
        it('give tokens',async() =>{
            const balance = await Coin.balance(seller)
            assert.equal(balance,1000)
        })
    })
})

contract('TokenMarketplace',([seller,buyer,deployer]) => {
    let ico

    before(async()=>{
        ico = await ICO.deployed()
    })

    describe('deployment',async() =>{
        it('deploys successfully', async() =>{
            const address = await ico.address
            assert.notEqual(address,0x0)
            assert.notEqual(address,'')
            assert.notEqual(address,null)
            assert.notEqual(address,undefined)
        })
        
    })

    describe('token',async() =>{
        let result, offerCount

        before('deposits and creates first offer',async()=>{
            ico.depositDollars('400000000000000',{from:buyer})
            let balance = await ico.dollars(buyer)
            assert.equal(balance.toNumber(),400000000000000)
            offerCount = await ico.offersIndex()
            result = await ico.sell(3,'10000000000000',{from:seller})
        })

        it('creates offer',async() =>{
            //successo
            assert.equal(offerCount,0)
            const event = result.logs[0].args //product
            assert.equal(event.id.toNumber(),offerCount.toNumber(),'id is correct')
            assert.equal(event.tokens.toNumber(),3,'number is correct')
            assert.equal(event.price.toNumber(),'10000000000000','price is correct')
            assert.equal(event.owner,seller,'owner is correct')
            assert.equal(event.purchased,false,'purchased is correct') 
            //fallimento
            await await ico.sell(0,'10000000000000',{from:seller}).should.be.rejected
            await await ico.sell(3,0,{from:seller}).should.be.rejected
        })
        it('lists offers',async () =>{
            const tokens = await ico.offers(offerCount)

            assert.equal(tokens.id.toNumber(),offerCount.toNumber(),'id is correct')
            assert.equal(tokens.tokens.toNumber(),3,'number is correct')
            assert.equal(tokens.price.toNumber(),'10000000000000','price is correct')
            assert.equal(tokens.owner,seller,'owner is correct')
            assert.equal(tokens.purchased,false,'purchased is correct')
        })

        it('sells tokens',async () =>{
            let oldSellerBalance
            oldSellerBalance = await ico.dollars(seller)
            //succcesso :compratore paga
            result = await ico.buy(offerCount,{from:buyer})
            //logs
            const event = result.logs[0].args //product
            assert.equal(event.id.toNumber(),offerCount.toNumber(),'id is correct')
            assert.equal(event.tokens.toNumber(),3,'number is correct')
            assert.equal(event.price.toNumber(),'30000000000000','price is correct')
            assert.equal(event.owner,buyer,'owner is correct')
            assert.equal(event.purchased,true,'purchased is correct') 
        
            //controllare se il venditore ha preso i soldi
            let newSellerBalance
            newSellerBalance = await ico.dollars(seller)

            const exepectedBalance = oldSellerBalance.toNumber() + 30000000000000
            assert.equal(newSellerBalance.toString(),exepectedBalance.toString())

            //fallimento prova a comprare un oggetto che non esiste
            await ico.buy(99,{from:buyer, value:10000000000000}).should.be.rejected
            //fallimento prova a comprare con non abbastanza soldi
            await ico.buy(offerCount,{from:buyer, value:5000000000000}).should.be.rejected
            //fallimento prvova a comprare l'oggetto da qualcunaltro
            await ico.buy(offerCount,{from:deployer, value:10000000000000}).should.be.rejected
            //fallimento prova a comprarlo 2 volte
            await ico.buy(offerCount,{from:seller, value:10000000000000}).should.be.rejected
        })
    })
})