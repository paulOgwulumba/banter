import React, { Component } from 'react';
import MessageBox from './Components/MessageBox'
class App extends Component{
    render(){
        return  <div style={{height: "100%"}} className="col-10">
                    <MessageBox userId={this.props.userId}></MessageBox>
                </div>
    }
}
export default App;