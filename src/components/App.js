import React, {Component} from 'react';
import logo from '../logo.svg';
import './App.css';
import Web3 from 'web3'
import Token from '../abis/TokenMarketplace.json'
import Navbar from './Navbar'
import Main from './Main'
import { ESRCH } from 'constants';

class App extends Component{
  constructor(props) {
    super(props);
    this.state = { apiResponse: "" , account:"", dollars :0, tokens:0 ,inputDollars:0,offers:[]};
    this.signIn = this.signIn.bind(this)
    this.getInfo = this.getInfo.bind(this)
    this.addDollars = this.addDollars.bind(this)
    this.sell = this.sell.bind(this)
    this.getAll = this.getAll.bind(this)
    this.buy = this.buy.bind(this)
  }
  /*
  async loadWeb3() {
    if (window.ethereum) {
      window.web3 = new Web3(window.ethereum)
      await window.ethereum.enable()
    }
    else if (window.web3) {
      window.web3 = new Web3(window.web3.currentProvider)
    }
    else {
      window.alert('Non-Ethereum browser detected. You should consider trying MetaMask!')
    }
  }

  async loadBlockchainData() {
    const web3 = window.web3
    // Load account
    
    const accounts = await web3.eth.getAccounts()
    this.setState({ account: accounts[0] })
    const networkId = await web3.eth.net.getId()
    const networkData = Token.networks[networkId]
    if(networkData) {
      const t = web3.eth.Contract(Token.abi, networkData.address)
      console.log(t)
    } else {
      window.alert('Token contract not deployed to detected network.')
    }
  }
  */
  callAPI() {
    fetch("http://localhost:9000/api")
        .then(res => res.text())
        .then(res => this.setState({ apiResponse: res }));
  }

  signIn() {
    if(this.state.account === ""){
      fetch("http://localhost:9000/api/sign-in",{method: 'post'})
      .then(res => res.text())
      .then(res => this.setState({ account: res } , () =>{this.getInfo()}))
    }else{
      this.getInfo()
    }
  }

  getInfo() {
    fetch("http://localhost:9000/api/info",{
      method: 'post',
      headers : {'Content-Type' : 'application/x-www-form-urlencoded'},
      body : "account=" + this.state.account.toString()
    })
      .then(res => res.text())
      .then(res => this.setState({dollars : Number(res.split(" ")[0]) } , () => {this.setState({tokens : Number(res.split(" ")[1]) })}))
  }
  
  addDollars() {
    console.log(this.state.inputDollars.toString())
    fetch("http://localhost:9000/api/addDollars",{
      method: 'post',
      headers : {'Content-Type' : 'application/x-www-form-urlencoded'},
      body : "dollars=" + this.state.inputDollars.toString() + "&account=" + this.state.account.toString()
    })
  }

  getAll(){
    fetch("http://localhost:9000/api/getAll",{
      method: 'post',
      headers : {'Content-Type' : 'application/x-www-form-urlencoded'}
    })
      .then(res => {
        res = res.json().then(solve =>{
          console.log(solve);
          this.setState({offers : solve});
        });
      })
  }

  sell(tokens,price){
    console.log("ok")
    fetch("http://localhost:9000/api/sell",{
      method: 'post',
      headers : {'Content-Type' : 'application/x-www-form-urlencoded'},
      body : "tokens=" + tokens.toString() + "&price=" + price.toString() + "&account=" + this.state.account.toString()
    })
  }

  buy(id){
    fetch("http://localhost:9000/api/buy",{
      method: 'post',
      headers : {'Content-Type' : 'application/x-www-form-urlencoded'},
      body : "id=" + id.toString() + "&account=" + this.state.account.toString()
    })
  }

  componentDidMount() {
      this.callAPI();
  }/*
  async componentWillMount() {
    await this.loadWeb3()
    await this.loadBlockchainData()
  }*/

  render() {
    return (
      <div>
        <Navbar account={this.state.account} />
        <div className="container-fluid mt-5">
          <div className="row">
            <main role="main" className="col-lg-12 d-flex text-center">
              <div className="content mr-auto ml-auto">
                <a
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <img src={logo} className="App-logo" alt="logo" />
                </a>
                <h1>T-Coin ICO</h1>
                <p>{"Dollars : " + this.state.dollars.toString()}
                  /{"Tokens : " + this.state.tokens.toString()}</p>
                <button className = "btn-info" onClick={this.signIn}>SIGN-IN</button>
                <p></p>
                <input className = "input-sm" type = "text" onChange={event => this.setState({inputDollars:event.target.value})}></input>
                <button className = "btn-success" onClick={this.addDollars}>Add</button>
                <button className = "btn-success" onClick={this.getAll}>Get</button>
              </div>
            </main>
            <Main offers = {this.state.offers}
                  sell = {this.sell}
                  buy = {this.buy}/>
          </div>
        </div>
        
      </div>
    );
  }
}

export default App;
