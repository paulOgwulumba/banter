import React from 'react'

class MessageBlock extends React.Component{
  constructor(props){
    super(props)
  }
  componentDidMount(){}
  componentDidUpdate(){
    if(this.props.shouldScrollDown){
      let chatBox = document.getElementsByClassName("conversation-container")[0]
      chatBox.scrollTop = chatBox.scrollHeight;
    }
  }
  render(){
    return <div className={"conversation-container"} id={this.props.name} onLoad={this.props.onLoad} >
          {this.props.messages}
        </div>
  }
}

export default MessageBlock