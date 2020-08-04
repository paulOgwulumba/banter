import React, {Component} from 'react'

function Message(props){
  const messageFloat = props.isSentByUser? "sent" : "received"
  const timeStyle = props.isSentByUser? "text-danger" : "text-info"
  const inactive = !props.isFirstToday? "inactive" : ""
  const oneTick = <span className="fa fa-check check text-muted"></span>
  const twoTickUnseen = <span className="fa fa-check-circle check text-muted"></span>
  const twoTickSeen = <span className="fa fa-check-circle check text-danger"></span>
  let seen = props.status || 1
  let toDisplay
  if(props.isSentByUser){
    if(seen === 0){
      toDisplay = oneTick
    }
    else if(seen === 1){
      toDisplay = twoTickUnseen
    }
    else if(seen === 2){
      toDisplay = twoTickSeen
    }
    else{
      toDisplay = null
    }
  }
  else{
    toDisplay = null
  }
  return <div className="trial" >
            <div className={"date-bubble "+inactive}>
              <p>{props.date}</p>
            </div>
            <div className={"message " + messageFloat}>
              <br/>{props.message}<br/><br/><span className={"time " + timeStyle}>{props.time}</span>
              &nbsp;{toDisplay}
            </div>
            
        </div>

}

export default Message