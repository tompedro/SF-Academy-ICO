import React, { Component } from 'react';

class Main extends Component {

  render() {
    return (
      <div class="container">
        <h2 >Add Offer</h2>
        <form onSubmit={(event) => {
          event.preventDefault()
          const tokens = this.offerTokens.value
          const price = this.offerPrice.value
          this.props.sell(tokens, price)
        }}>
          <div className="form-group ">
            <input
              id="productName"
              type="text"
              ref={(input) => { this.offerTokens = input }}
              className="form-control"
              placeholder="Number of Tokens"
              required />
          </div>
          <div className="form-group">
            <input
              id="productPrice"
              type="text"
              ref={(input) => { this.offerPrice = input }}
              className="form-control"
              placeholder="Offer Price"
              required />
          </div>
          <button type="submit" className="btn btn-primary">Add Offer</button>
        </form>
        <p>&nbsp;</p>
        <h2>Buy</h2>
        <table className="table">
          <thead>
            <tr>
              <th scope="col">Id</th>
              <th scope="col">Tokens</th>
              <th scope="col">Price</th>
              <th scope="col">Owner</th>
              <th scope="col"></th>
            </tr>
          </thead>
          <tbody id="offerList">
            { this.props.offers.map((offer, key) => {
              return(
                <tr key={key}>
                  <th scope="row">{offer.id.toString()}</th>
                  <td>{offer.tokens}</td>
                  <td>{offer.price.toString()} Eth</td>
                  <td>{offer.owner}</td>
                  <td>
                    { !offer.purchased
                      ? <button
                          name={offer.id}
                          value={offer.price}
                          onClick={(event) => {
                            this.props.buy(event.target.name, event.target.value)
                            this.props.getAll()
                            this.props.getInfo()
                          }}
                        >
                          Buy
                        </button>
                      : null
                    }
                    </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    );
  }
}

export default Main;
