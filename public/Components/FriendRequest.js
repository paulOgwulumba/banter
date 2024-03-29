import React, {Component} from 'react'
import UserRequestCard from './UserRequestCard'

class FriendRequest extends Component{
  constructor(props){
    super(props)
    this.state = {friends: [], input: "", friendList: []}
    this.handleChange = this.handleChange.bind(this)
    this.getCards = this.getCards.bind(this)
    this.search = this.search.bind(this)
    this.handleClick = this.handleClick.bind(this)
  }

  componentDidMount(){
    fetch(`http://localhost:3000/friend-request/get/all/${this.props.userId}`)
      .then(response => response.json())
      .then(data => {
        let cards = []
        data.forEach(element => {
          let card = <UserRequestCard 
                      name={element.name}  
                      gender={element.gender}
                      username={element.username} 
                      userId={this.props.userId}>
                    </UserRequestCard>
          cards.push(card)
        })
        this.setState({friends: cards, friendList: data})
      })
  }

  handleChange(event){
    this.setState({input: event.target.value})
    this.search(event.target.value)
  }

  handleClick(event){
    this.search(this.state.input)
  }

  getCards(array){
    let cards = []
    array.forEach(element => {
      let card = <UserRequestCard 
                    name={element.name} 
                    username={element.username}
                    gender={element.gender}
                    userId={this.props.userId}>
                  </UserRequestCard>
      cards.push(card)
    })
    this.setState({friends: cards})
  }

  search(userInput){
    let newList = []
    let input = new RegExp(userInput, "i")
    if(!/^\s+$/.test(userInput)){
      this.state.friendList.forEach(friend =>{
        if(input.test(friend.name)){
          newList.push(friend)
        }
      })
      this.getCards(newList)
    }
    else{
      this.getCards(this.state.friendList)
    }
  }

  render(){
    // let toBeDisplayed = this.state.friends.length === 0? 
    //   <h3 className="text-center white-text">There are no friends on your friends list.</h3> : 
    //   this.state.friends
    return  <div className="col-10 la-box">
              <div className="form-row la-small-box">
                <input 
                  type="text" 
                  className="form-control-lg col-9" 
                  placeholder="Search friends"
                  value={this.state.input}
                  onChange={this.handleChange}
                />&nbsp;&nbsp;
                <button onClick={this.handleClick} className="btn btn-danger "><span className="fa fa-search"></span> Search</button>
              </div>
              <div className="la-box-box">
                {this.state.friends}
              </div>
            </div>
  }
}

export default FriendRequest