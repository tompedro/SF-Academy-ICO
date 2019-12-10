//import all
import React, {Component} from 'react';
import logoT from '../logoT.svg';
import './App.css';
import Navbar from './Navbar'
import Main from './Main';

//define App
class App extends Component{
  constructor(props) {
    super(props);
    //set initial variables to state
    this.state = { address:"",privateKey:"",hash :"", dollars :0, tokens:0 ,
                  offers:[],
                  init : true, signin : true,loading:false}; // init is the variable that define the state of the page
    //bind all functions
    this.signIn = this.signIn.bind(this)
    this.getInfo = this.getInfo.bind(this)
    this.addDollars = this.addDollars.bind(this)
    this.sell = this.sell.bind(this)
    this.getAll = this.getAll.bind(this)
    this.buy = this.buy.bind(this)
    this.logIn = this.logIn.bind(this)
    this.switch = this.switch.bind(this)
  }

  signIn() {
    if(this.state.address === ""){ //check if not have an address yet
      fetch("http://localhost:9000/api/sign-in",{
        method: 'post',
        headers : {'Content-Type' : 'application/x-www-form-urlencoded'},
        //set all body varibles to make a json
        body : "name=" + this.refs.uname.value + 
               "&surname=" + this.refs.surname.value +
               "&mail=" + this.refs.mail.value + 
               "&password=" + this.refs.psw.value
      })
      .then(res => res.text())
      .then(res => alert(res))
    }
  }

  logIn(){
    if(this.state.address === ""){//check if not have an address yet
      fetch("http://localhost:9000/api/login",{
        method: 'post',
        headers : {'Content-Type' : 'application/x-www-form-urlencoded'},
        body : "name=" + this.refs.logName.value +
                "&password=" + this.refs.logPsw.value
      })
      .then(res => res.text())
      .then((res) => {
        //get info
        let a = res.split(" ")[0]
        let key = res.split(" ")[1]
        //set account
        if(a.includes("0x") === false){
          alert(res);
        }else{
          this.setState({ address: a , privateKey : key} , () =>{
            this.getInfo();
            this.setState({init : false});
          });
        }
      })
    }
  }
  //get info of account
  getInfo() {
    fetch("http://localhost:9000/api/info",{
      method: 'post',
      headers : {'Content-Type' : 'application/x-www-form-urlencoded'},
      body : "address=" + this.state.address.toString()
    })
      .then(res => res.text())
      .then(res => this.setState({dollars : Number(res.split(" ")[0]) } , () => {
        this.setState({tokens : Number(res.split(" ")[1]) //set dollars and tokens
      })}))
  }
  //add dollars to account
  addDollars() {
    this.setState({loading:true})

    fetch("http://localhost:9000/api/addDollars",{
      method: 'post',
      headers : {'Content-Type' : 'application/x-www-form-urlencoded'},
      body : "hash="+ this.state.hash+  "&dollars=" + this.refs.dollars.value + "&address=" + this.state.address.toString() + "&key=" + this.state.privateKey.toString()
    })
    .then(res => res.text())
    .then((res) =>{

      if(res === undefined){
        alert("OPS SOMETHING GONE WRONG");

      }else if(res === "err" || res ===""){
        alert("YOUR LAST TRANSACTION ISN'T MINED");

      }else{
        //set state hash to previous transaction hash
        this.setState({hash:res});
        this.getInfo();
      }

      this.setState({loading:false});
    })
  }
  //get all other informations
  getAll(){
    fetch("http://localhost:9000/api/getAll",{
      method: 'post',
      headers : {'Content-Type' : 'application/x-www-form-urlencoded'}
    })
      .then(res => {
        res = res.json()
        .then(solve =>{
          //set state offers to json sent
          this.setState({offers : solve});
          this.getInfo();

        });
      })
  }
  //sell x tokens to y price
  sell(tokens,price){
    this.setState({loading:true})

    fetch("http://localhost:9000/api/sell",{
      method: 'post',
      headers : {'Content-Type' : 'application/x-www-form-urlencoded'},
      body : "tokens=" + tokens.toString() + "&price=" + price.toString() + "&address=" + this.state.address.toString() + "&key=" + this.state.privateKey.toString()
    })
    .then(()=>{
      this.setState({loading:false})
    })
  }
  //buy offer
  buy(id){
    this.setState({loading:true})

    fetch("http://localhost:9000/api/buy",{
      method: 'post',
      headers : {'Content-Type' : 'application/x-www-form-urlencoded'},
      body : "id=" + id.toString() + "&address=" + this.state.address.toString() + "&key=" + this.state.privateKey.toString()
    })
    .then(()=>{
      this.setState({loading:false})
    })
  }
  //switch login to signin in initial state
  switch(_tag){
    this.setState({signin : _tag});
  }
  //html
  render() {
    return (
    <div>{/*navbar with information of user*/}
        <Navbar account={this.state.address} tokens={this.state.tokens} dollars={this.state.dollars}/>
        <div className="container-fluid mt-5">
          { //login / signin forms
            this.state.init ?(
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
                      <input style = {{width : "170%"}}className = "form-control" type="text" placeholder="Enter Username" ref="uname"/>

                      <label for="surname"><b>Surname</b></label>
                      <input style = {{width : "170%"}} className= "form-control" type="text" placeholder="Enter Surname" ref="surname"/>

                      <label for="mail"><b>Mail</b></label>
                      <input style = {{width : "170%"}}className = "form-control" type="text" placeholder="Enter Mail" ref="mail"/>

                      <label for="psw"><b>Password</b></label>
                      <input style = {{width : "170%"}}className = "form-control" type="password" placeholder="Enter Password" ref="psw"/>

                      <button type="submit" className="btn btn-primary" >Sign In</button>
                  </form>
                  :
                  <form onSubmit={(event) => {
                    event.preventDefault()
                    this.logIn()
                    }}>
                      <label for="uname"><b>Username</b></label>
                      <input style = {{width : "170%"}}className = "form-control" type="text" placeholder="Enter Username" ref="logName"/>

                      <label for="psw"><b>Password</b></label>
                      <input style = {{width : "170%"}}className = "form-control" type="password" placeholder="Enter Password" ref="logPsw"/>

                      <button type="submit" className="btn btn-primary" >Log In</button>

                  </form>
                }
              </div>
            </div>
            ):( // main state of the page
            this.getInfo &&
            <div className="row" id = "post">
              {!this.state.loading ?
                <div>
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
                        <button className = "btn btn-primary" onClick={this.getAll}>Refresh</button> {/*refresh button for get informations */}
                        <div style = {{paddingLeft : "860px"}} class="row">
                          <div class = "col">
                            <input className = "form-control" placeholder = "Add Dollars"style = {{marginLeft : "-25px",width : "150%"}} type = "text" ref="dollars"/>
                          </div>
                          <div class = "col">
                            <button className = "btn btn-primary" onClick={this.addDollars}>Add dollars</button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </main>{/*list of offers and buttons for making one */}
                  <Main offers = {this.state.offers}
                        sell = {this.sell}
                        buy = {this.buy}
                        account = {this.state.address}/>
                </div>
                ://loading... text
                <div id = "loader" className = "text-center"><a className = "text-center">Loading...</a></div>
              }
              
            </div>)
          } 
        </div>
      </div>
    );
  }
}

export default App;
