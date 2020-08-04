import React from 'react'
import MessageHead from './MessageHead'

function MessageHeadHolder(props){
  let headers = []
  props.headers.forEach(element => {
    let m = <MessageHead name={element.username} active={element.isActive} onClick={props.handleClick}></MessageHead>
    headers.push(m)
  })
  return <div className="chat-header">
          {headers}
        </div>
}

export default MessageHeadHolder