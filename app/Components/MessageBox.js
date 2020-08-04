import React, {Component} from 'react'
import Message from './Message'
import InputField from './InputField'
import MessageBlock from './MessageBlock'
import MessageHeadHolder from './MessageHeadHolder'

class MessageBox extends Component{
  constructor(props){
    super(props)
    this.state = {
      messages: [],
      friendsData: {},
      input: "",
      headers: [],
      activeHeader: "",
      shouldScrollDown: true,
      timer: null
    }
    this.convertTime = this.convertTime.bind(this)
    this.handleSend = this.handleSend.bind(this)
    this.handleChange = this.handleChange.bind(this)
    this.copyArray = this.copyArray.bind(this)
    this.getMessages = this.getMessages.bind(this)
    this.setTimerListener = this.setTimerListener.bind(this)
    this.adjustScrollBar = this.adjustScrollBar.bind(this)
    this.handleClick = this.handleClick.bind(this)
    this.convertDate = this.convertDate.bind(this)
    this.retrieveMonth = this.retrieveMonth.bind(this)
    this.getRelativeDay = this.getRelativeDay.bind(this)
    this.retrieveMonthIndex = this.retrieveMonthIndex.bind(this)
    this.copyObjectExcept = this.copyObjectExcept.bind(this)
  }

  componentDidMount(){
    fetch(`http://localhost:3000/messages/${this.props.userId}`)
      .then(response => response.json())
      .then(data => {
        //console.log(data)
        let names = Object.keys(data.friend)
        let heads = []
        let activeHeader = ""
        names.forEach(element => {
          let active = names.indexOf(element) === 0? true : false
          if(active){
            activeHeader = element
            this.setState({activeHeader: element})
          }
          heads.push({username: element, isActive: active})
        })
        // console.log(data)
        let newMessageArray = []
        newMessageArray.push(this.getMessages(data.friend[activeHeader].messages))
        this.setState({
          messages: newMessageArray,
          headers: heads,
          friendsData: data
        })
      })
    this.setTimerListener()
  }

  componentWillUnmount(){
    clearInterval(this.state.timer)
  }

  shouldComponentUpdate(nextProps, nextState){
    if(JSON.stringify(this.copyObjectExcept(this.state, "input")) === JSON.stringify(this.copyObjectExcept(nextState, "input"))){
      if(this.state.input === nextState.input){
        return false
      }
      else{
        this.setState({
          shouldScrollDown: false
        })
        return true
      }
    }
    else{
      return true
    }
  }

  copyObjectExcept(obj, key) {
    let array = Object.keys(obj)
    let newObj = {}
    array.forEach(element => {
      if(element !== key){
        newObj[element] = obj[element]
      }
    })
    return newObj
  }

  handleClick(event){
    let names = Object.keys(this.state.friendsData.friend)
    let heads = []
    names.forEach(element => {
      let active = element === event.target.textContent? true : false
      heads.push({username: element, isActive: active})
      })
    let newMessageArray = []
    newMessageArray.push(this.getMessages(this.state.friendsData.friend[event.target.textContent].messages))
    this.setState({
      activeHeader: event.target.textContent,
      headers: heads,
      messages: newMessageArray,
      shouldScrollDown: true
    })
    fetch(`http://localhost:3000/seen/${this.props.userId}/${event.target.textContent}`)
  }

  handleChange(event){
    this.setState({
      input: event.target.value
    })
  }

  setTimerListener(){
    const timerListener = setInterval((time)=> {
      try{
        fetch(`http://localhost:3000/messages/${this.props.userId}`)
          .then(response => response.json())
          .then(data => {
            let names = Object.keys(data.friend)
            let heads = []
            let activeHeader = ""
            names.forEach(element => {
              let active
              if(names.indexOf(element) !== -1){
                active = element === this.state.activeHeader? true : false
              }
              else{
                active = names.indexOf(element) === 0? true : false
              }
              if(active){
                activeHeader = element
                this.setState({activeHeader: element})
              }
              heads.push({username: element, isActive: active})
            })
            let newMessageArray = []
            newMessageArray.push(this.getMessages(data.friend[this.state.activeHeader].messages))
            this.setState({
              friendsData: data,
              messages: newMessageArray,
              shouldScrollDown: true,
              headers: heads
            })
          })
          fetch(`http://localhost:3000/seen/${this.props.userId}/${this.state.activeHeader}`)
          this.render()
      }
      catch(e){}
    },2000)
    this.setState({timer: timerListener})
  }

  handleSend(event){
    let newInput = this.state.input
    if(newInput===""){return}
    let newMessage =  <Message
                        message={newInput}
                        time={this.convertTime()}
                        isSentByUser={true}
                        date={this.convertDate()}
                        status={0}
                      >
                      </Message>
    let newMessageArray = this.copyArray()
    newMessageArray.push(newMessage)
    this.setState({
      input: "",
      messages: newMessageArray,
      shouldScrollDown: true
    })
    let date = new Date()
    let toBeSent = {message: newInput, time: date}
    //console.log(toBeSent)
    const options = {
      method: "POST",
      headers: {
        "Content-type": "application/json"
      },
      body: JSON.stringify(toBeSent)
    }
    fetch(`http://localhost:3000/message/${this.props.userId},${this.state.activeHeader}`, options)
      .then(response => response.json())
      .then(data => {})
  }

  convertTime(date = new Date().toISOString()){
    let x = /\w\d\d:\d\d/.exec(date)
    let y = x[0].substring(1)
    let array = y.split(":")
    let meridian = array[0]>11? "PM" : "AM"
    array[0] = array[0] > 12? array[0] - 12 : array[0] 
    array[0] = array[0] == "00"? 12 : array[0]
    let finalString = array[0] + ":" + array[1] + " " + meridian
    return finalString
  }

  convertDate(date=new Date().toISOString()){
    let x = /^\d\d\d\d-\d\d-\d\d/.exec(date)
    let y = x[0].split("-")
    let year = y[0]
    let month = this.retrieveMonth(y[1] - 1)
    let day = y[2].charAt(0) === "0"? y[2].substring(1) : y[2]
    return `${day} ${month} ${year}`
  }

  retrieveMonth(value=0){
    value = Number(value)
    let month = ''
    if(value === 0){
      month = "January"
    }
    else if(value === 1){
      month = "February"
    }
    else if(value === 2){
      month = "March"
    }
    else if(value === 3){
      month = "April"
    }
    else if(value === 4){
      month = "May"
    }
    else if(value === 5){
      month = "June"
    }
    else if(value === 6){
      month = "July"
    }
    else if(value === 7){
      month = "August"
    }
    else if(value === 8){
      month = "September"
    }
    else if(value === 9){
      month = "October"
    }
    else if(value === 10){
      month = "November"
    }
    else if(value === 11){
      month = "December"
    }
    else{
      month = "Dimanche"
    }
    return month
  }

  copyArray(array=this.state.messages){
    let newArray = []
    array.forEach(element => {
      newArray.push(element)
    })
    return newArray
  }

  getMessages(array=[{message: "Empty", incoming: true, time: new Date().toString()}]){
    let messages = []
    let currentDate = ""
    array.forEach(element => {
      let date = this.convertDate(element.time)
      let isFirst = false
      let today = this.convertDate(element.time)
      if(currentDate !== today){
        currentDate = today
        date = this.getRelativeDay(currentDate)
        isFirst = true
      }
      let message = <Message
                      message={element.message}
                      time={this.convertTime(element.time)}
                      date={date}
                      isSentByUser={element.outgoing}
                      isFirstToday = {isFirst}
                      status={element.status}
                    >
                    </Message>
      messages.push(message)
    })
    return messages
  }

  getRelativeDay(date){
    let dateObj = {
      day: date.split(" ")[0],
      month: date.split(" ")[1],
      year: date.split(" ")[2]
    }
    let todayObj = {
      day: this.convertDate(new Date().toISOString()).split(" ")[0],
      month: this.convertDate(new Date().toISOString()).split(" ")[1],
      year: this.convertDate(new Date().toISOString()).split(" ")[2]
    }

    if(todayObj.year !== dateObj.year){
      if(todayObj.year - dateObj.year === 1){
        if(this.retrieveMonthIndex(todayObj.month) === 0 && this.retrieveMonthIndex(dateObj.month) === 11){
          if(todayObj.day === 1 && dateObj.day === 31){
            date = "Yesterday"
          }
        }
      }
    }
    else{
      if(this.retrieveMonthIndex(todayObj.month) === this.retrieveMonthIndex(dateObj.month)){
        if(todayObj.day === dateObj.day){
          date = "Today"
        }
        else if(todayObj.day - dateObj.day === 1){
          date = "Yesterday"
        }
        else{}
      }
      else{
        if(this.retrieveMonthIndex(todayObj.month) - this.retrieveMonthIndex(dateObj.month) === 1){
          if(todayObj.day === 1){
            let dateUTC = new Date(dateObj.year, this.retrieveMonthIndex(dateObj.month), dateObj.day).valueOf() / 1000
            let todayUTC = new Date(todayObj.year, this.retrieveMonthIndex(todayObj.month), todayObj.day).valueOf() / 1000
            if((todayUTC - dateUTC)/3600 === 24){
              date = "Yesterday"
            }
          }
        }
      }
    }
    return date
  }

  retrieveMonthIndex(month="April"){
    let index;
    if(/jan(uary)?/i.test(month)){
      index = 0
    }
    else if(/feb(ruary)?/i.test(month)){
      index = 1
    }
    else if(/mar(ch)?/i.test(month)){
      index = 2
    }
    else if(/apr(il)?/i.test(month)){
      index = 3
    }
    else if(/may/i.test(month)){
      index = 4
    }
    else if(/jun(e)?/i.test(month)){
      index = 5
    }
    else if(/jul(y)?/i.test(month)){
      index = 6
    }
    else if(/aug(ust)?/i.test(month)){
      index = 7
    }
    else if(/sep(tember)?/i.test(month)){
      index = 8
    }
    else if(/oct(ober)?/i.test(month)){
      index = 9
    }
    else if(/nov(ember)?/i.test(month)){
      index = 10
    }
    else if(/dec(ember)?/i.test(month)){
      index = 11
    }
    else{
      index = -1
    }
    return index
  }

  adjustScrollBar(event){}

  render(){
    return  <div className="conversation" onClick={this.adjustScrollBar} id="conversation">
                <MessageHeadHolder headers={this.state.headers} handleClick={this.handleClick}></MessageHeadHolder>
                <MessageBlock 
                  messages={this.state.messages} 
                  active={true} 
                  shouldScrollDown={this.state.shouldScrollDown}
                >
                </MessageBlock> 
                <InputField
                  value={this.state.input}
                  handleChange={this.handleChange}
                  handleSend={this.handleSend}
                >
                </InputField>
            </div>
      
  }

  
}

export default MessageBox