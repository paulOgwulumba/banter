import React from 'react'

function MessageHead(props){
  let active = props.active? "active" : ""
  return <div className={"user-profile "+ active} data-up={props.name} onClick={props.onClick}>
          <h5>{props.name}</h5>
        </div>
}

export default MessageHead