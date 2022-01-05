import React, {Component} from 'react'

class UserRequestCard extends Component{
  constructor(props){
    super(props)
    this.state = {status: "unclicked"}   //status can either be "unclicked", "rejected" or "confirmed"
    this.handleReject = this.handleReject.bind(this)
    this.handleConfirm = this.handleConfirm.bind(this)
  }

  componentDidMount(){
    fetch(`http://localhost:3000/check/request/${this.props.userId}/${this.props.username}`)
      .then(response => response.json())
      .then(data => {
        if(!data.status){
          this.setState({status: "confirmed"})
        }
      })
  }

  handleReject(event){
    this.setState({status: "rejected"})
    fetch(`http://localhost:3000/friend-request/reject/${this.props.userId}/${this.props.username}`)
      .then(response => response.json())
      .then(data => console.log(data))
  }

  handleConfirm(event){
    this.setState({status: "confirmed"})
    fetch(`http://localhost:3000/friend-request/accept/${this.props.userId}/${this.props.username}`)
      .then(response => response.json())
      .then(data => console.log(data))
  }

  render(){
    let gender = ""
    gender  = this.props.gender === "male"? "fa fa-male" : "fa fa-female"
    if(this.state.status === "rejected"){
      return  <div style={{display: "none"}}></div>
    }
    else if(this.state.status === "confirmed"){
      return  <div className="user-card bg-dark row" id={this.props.username}>
              <div className="col-8 form-text">
                <h5 className="text-info"><span className={gender}></span> {this.props.name}</h5>
              </div>
              <div className="">
                <p className="text-info">Friend request accepted.</p>
              </div>
            </div>
    }
    else{
      return  <div className="user-card row" id={this.props.username}>
              <div className={`col-10 form-text`}>
                <h5><span className={gender}></span> {this.props.name}</h5>
              </div>
              <div className="">
                <abbreviation title="Accept friend request."><button className={"btn btn-danger burgundy"} onClick={this.handleConfirm}><span className="fa fa-user-plus"></span></button></abbreviation>
                &nbsp; &nbsp; &nbsp;
                <abbreviation title="Reject friend request."><button className={"btn btn-danger burgundy"} onClick={this.handleReject}><span className="fa fa-user-times"></span></button></abbreviation>
              </div>
            </div>
    }
  }
}

export default UserRequestCard