import React, {Component} from 'react';
import logoT from '../logoT.svg';
import './App.css';
import Web3 from 'web3'
import Token from '../abis/TokenMarketplace.json'
import Navbar from './Navbar'
import Main from './Main';
import { ESRCH } from 'constants';

class App extends Component{
  constructor(props) {
    super(props);
    this.state = { apiResponse: "" , account:"", dollars :0, tokens:0 ,
                  inputDollars:0,
                  offers:[],
                  inputName :"" , inputPassword :"" , inputSurname : "" , inputMail : "",
                  logName : "", logPassword : "",
                  init : false, signin : true};
    this.signIn = this.signIn.bind(this)
    this.getInfo = this.getInfo.bind(this)
    this.addDollars = this.addDollars.bind(this)
    this.sell = this.sell.bind(this)
    this.getAll = this.getAll.bind(this)
    this.buy = this.buy.bind(this)
    this.logIn = this.logIn.bind(this)
    this.switch = this.switch.bind(this)
  }

  callAPI() {
    fetch("http://localhost:9000/api")
        .then(res => res.text())
        .then(res => this.setState({ apiResponse: res }));
  }

  signIn() {
    if(this.state.account === ""){
      fetch("http://localhost:9000/api/sign-in",{
        method: 'post',
        headers : {'Content-Type' : 'application/x-www-form-urlencoded'},
        body : "name=" + this.state.inputName.toString() + "&surname=" + this.state.inputSurname.toString() +"&mail=" + this.state.inputMail.toString() + "&password=" + this.state.inputPassword.toString()
      })
      .then(res => res.text())
      .then(res => this.setState({ account: res } , () =>{this.getInfo()}))
    }
  }

  logIn(){
    if(this.state.account === ""){
      fetch("http://localhost:9000/api/login",{
        method: 'post',
        headers : {'Content-Type' : 'application/x-www-form-urlencoded'},
        body : "&name=" + this.state.logName.toString() +
                "&password=" + this.state.logPassword.toString()
      })
      .then(res => res.text())
      .then(res => this.setState({ account: res } , () =>{this.getInfo();this.setState({init : false})}))
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
    }).then(() =>{this.getInfo();})
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

  switch(_tag){
    this.setState({signin : _tag});
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
        <Navbar account={this.state.account} tokens={this.state.tokens} dollars={this.state.dollars}/>
        <div className="container-fluid mt-5">
          {
            this.state.init ?
            <div class ="container">
              <main role="main" className="col-lg-12 text-center">
                <h1 style = {{paddingTop : "70px"}}>WELCOME</h1>
              </main>
              <div style = {{paddingLeft : "400px" ,paddingTop : "70px"}}>
                <button className = "btn btn-outline-info" onClick={()=>{this.switch(true);}}>SIGN IN</button>
                <button style ={{marginLeft : "150px"}}className = "btn btn-outline-info" onClick={()=>{this.switch(false)}}>LOGIN</button>
              </div>
              <div style = {{paddingLeft : "400px",paddingTop : "20px"}}className = "row" id = "init">
                {
                  this.state.signin ?
                  <form onSubmit={(event) => {
                    event.preventDefault()
                    this.signIn()
                    }}>
                      <label for="uname"><b>Username</b></label>
                      <input style = {{width : "170%"}}className = "form-control" type="text" placeholder="Enter Username" id="uname" onChange={event => this.setState({inputName:event.target.value})}/>

                      <label for="surname"><b>Surname</b></label>
                      <input style = {{width : "170%"}} className= "form-control" type="text" placeholder="Enter Surname" id="surname" onChange={event => this.setState({inputSurname:event.target.value})}/>

                      <label for="mail"><b>Mail</b></label>
                      <input style = {{width : "170%"}}className = "form-control" type="text" placeholder="Enter Mail" id="mail" onChange={event => this.setState({inputName:event.target.value})}/>

                      <label for="psw"><b>Password</b></label>
                      <input style = {{width : "170%"}}className = "form-control" type="password" placeholder="Enter Password" id="psw" onChange={event => this.setState({inputPassword:event.target.value})}/>

                      <button type="submit" className="btn btn-primary" >Sign In</button>
                  </form>
                  :
                  <form onSubmit={(event) => {
                    event.preventDefault()
                    this.logIn()
                    }}>
                      <label for="uname"><b>Username</b></label>
                      <input style = {{width : "170%"}}className = "form-control" type="text" placeholder="Enter Username" id="uname" onChange={event => this.setState({logName:event.target.value})}/>

                      <label for="psw"><b>Password</b></label>
                      <input style = {{width : "170%"}}className = "form-control" type="password" placeholder="Enter Password" id="psw" onChange={event => this.setState({logPassword:event.target.value})}/>

                      <button type="submit" className="btn btn-primary" >Log In</button>

                  </form>
                }
              </div>
            </div>
              : 
            <div className="row" id = "post">
              <main role="main" className="col-lg-12 d-flex text-center">

                <div className="content mr-auto ml-auto">
                  <a
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <img src={logoT} className="App-logo" alt="logo" />
                  </a>

                  <h1>Marketplace</h1>
                  <div class="container">
                    <button className = "btn btn-primary" onClick={this.getAll}>Refresh</button>
                    <div style = {{paddingLeft : "860px"}} class="row">
                      <div class = "col">
                        <input className = "form-control" style = {{marginLeft : "-25px",width : "150%"}} type = "text" onChange={event => this.setState({inputDollars:event.target.value})}/>
                      </div>
                      <div class = "col">
                        <button className = "btn btn-primary" onClick={this.addDollars}>Add dollars</button>
                      </div>
                    </div>
                  </div>
                </div>
              </main>
              <Main offers = {this.state.offers}
                    sell = {this.sell}
                    buy = {this.buy}
                    getAll = {this.getAll}
                    getInfo = {this.getInfo}/>
            </div>
          } 
          </div>
      </div>
    );
  }
}

export default App;
