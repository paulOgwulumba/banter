import React, {Component} from 'react'

class UserCard extends Component{
  constructor(props){
    super(props)
    this.state = {status: "unclicked"}   //status can either be "unclicked", "clicked" or "confirmed"
    this.handleClick = this.handleClick.bind(this)
    this.handleSubmit = this.handleSubmit.bind(this)
    this.cancelRequest = this.cancelRequest.bind(this)
  }

  componentDidMount(){
    if(this.props.action === "add"){
      fetch(`http://localhost:3000/check-add/${this.props.userId}/${this.props.username}`)
        .then(response => response.json())
        .then(data => {
          if(data.status){
            this.setState({status: "confirmed"})
          }
        })
    }
    else{
      fetch(`http://localhost:3000/check-remove/${this.props.userId}/${this.props.username}`)
        .then(response => response.json())
        .then(data => {
          if(data.status){
            this.setState({status: "confirmed"})
          }
        })
    }
  }

  cancelRequest(event){
    fetch(`http://localhost:3000/cancel-request/${this.props.userId}/${this.props.username}`)
    this.setState({status: "unclicked"})
  }

  handleClick(event){
    this.setState({status: "clicked"})
  }

  handleSubmit(event){
    if(event.target.name === "no"){
      this.setState({status: "unclicked"})
    }
    else{
      this.setState({status: "confirmed"})
      if(this.props.action !== "add"){
        const options = {
          method: "DELETE",
          headers: {
            "Content-type": "application/json"
          },
          body: ""
        }
        fetch(`http://localhost:3000/friend/${this.props.userId}/${this.props.username}`, options)
      }
      else{
        fetch(`http://localhost:3000/friend-request/${this.props.userId}/${this.props.username}`)
          .then(response => response.json())
          .then(data => console.log(data))
      }
    }
  }

  render(){
    let action = ""
    let gender = ""
    action  = this.props.action === "add"? "fa-chain" : "fa-chain-broken"
    let className = this.props.action === "add"? "col-10" : "col-9"
    gender  = this.props.gender === "male"? "fa fa-male" : "fa fa-female"
    if(this.state.status === "clicked"){
      return  <div className="user-card row" id={this.props.username}>
                <div className="col-7 form-text">
                  <h5><span className={gender}></span> {this.props.name}</h5>
                </div>
                <div className="confirmation-box burgundy" id={`${this.props.username}-confirm`}>
                  <div className="row">
                    <p>Are you sure you want to {this.props.action} this friend?</p>
                  </div>
                  <div className="row">
                    <button name="yes" onClick={this.handleSubmit} className="offset-2 btn-sm burgundy btn-success">Yes</button>  
                    <button name="no" onClick={this.handleSubmit} className="offset-5 btn-sm burgundy btn-danger">No</button>
                  </div>
                </div>
            </div>
    }
    else if(this.state.status === "confirmed"){
      let message = this.props.action === "add"? "Friend request sent." : "Friend deleted."
      let button = this.props.action === "add"? <abbreviation title="Cancel request">
                                                  <button className="btn btn-sm btn-info burgundy" onClick={this.cancelRequest}>
                                                    Cancel<span className="fa fa-chain-broken">
                                                    </span>
                                                  </button>
                                                </abbreviation> :
                                                ""
      return  <div className="user-card bg-dark row" id={this.props.username}>
              <div className="col-8 form-text">
                <h5 className="text-info"><span className={gender}></span> {this.props.name}</h5>
              </div>
              <div className="">
                <p className="text-info">{message}&nbsp;&nbsp;{button}</p>
                
              </div>
            </div>
    }
    else{
      return  <div className="user-card row" id={this.props.username}>
              <div className={`${className} form-text`}>
                <h5><span className={gender}></span> {this.props.name}</h5>
              </div>
              <div className="">
                <button 
                  className="btn btn-sm btn-danger burgundy" 
                  onClick={this.handleClick}
                  >
                  {this.props.action.toUpperCase()} FRIEND <span className={`fa ${action}`}></span></button>
              </div>
            </div>
    }
  }
}

export default UserCard