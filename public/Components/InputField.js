import React, {Component} from 'react'

function InputField(props){
  return  <div className="input-field-box">
            <div className="form-horizontal" role="form">
              <div className="form-group row form control">
                <div className="col-10">
                  <input 
                    className="form-control" 
                    type="text" 
                    placeholder="Type message here" 
                    value={props.value} 
                    onChange={event => {props.handleChange(event)}}
                  />
                </div>
                <button 
                  type="button" 
                  className="btn btn-danger"
                  onClick={props.handleSend}
                >
                    Send <span className="fa fa-play"></span>
                </button>
              </div>
            </div>
          </div>
}

export default InputField