import React, { Component } from 'react';
import List from './List.js'
import axios from 'axios'
import './App.css';

class App extends Component {
  constructor () {
    super()
    this.state = {
      value: '',
      activeBtn: 'all',
      todoNumbers: 0,
      listData: ''
    }
    this.sendReq = this.sendReq.bind(this)
    this.handleValueChange = this.handleValueChange.bind(this)
    this.clearCompleted = this.clearCompleted.bind(this)
    this.handleSearch = this.handleSearch.bind(this)
    this.handleAdd = this.handleAdd.bind(this)
    this.btnClick = this.btnClick.bind(this)
    this.handleChange = this.handleChange.bind(this)
  }

  sendReq (o, i, d, s) {
    let url = 'http://127.0.0.1:3001', _this = this
    let p = {
      operation: o,
      id: i,
      description: d,
      status: s
    }
    console.log(p, 'p')
    axios({
      method: 'post',
      url: url,
      type: 'json',
      data: JSON.stringify(p)
    }).then(function (response) {
      let tmp = response.data
      switch (o) {
        case 'search':
          _this.setState({
            todoNumbers: tmp.count,
            listData: JSON.stringify(tmp.data)
          })
          break;
        case 'add':
          _this.setState({
            todoNumbers: tmp.count,
            listData: '添加成功！',
            activeBtn: ''
          })
          break;
        case 'delete':
          if(_this.state.activeBtn === '') {
            _this.setState({listData: '删除成功！'})
          } else {
            _this.sendReq('search', _this.state.activeBtn, '', '')
          }
          break;
        case'change':
          _this.sendReq('search', _this.state.activeBtn, '', '')
          break;
        default:
          break;
      }
    })
  }

  handleValueChange (event) {
    this.setState({value: event.target.value})
  }

  clearCompleted () {
    this.sendReq('delete', 'all', '', '')
  }

  handleSearch () {
    this.setState({activeBtn: ''})
    this.sendReq('search', '', this.state.value, '')
  }

  handleAdd () {
    this.sendReq('add', '', this.state.value, '')
  }

  btnClick (event) {
    let active = event.target.innerHTML
    this.setState({activeBtn: active})
    this.sendReq('search', active, '', '')
  }

  handleChange(operate, id, s) {
    this.sendReq(operate, id, '', s)
  }

  render() {
    let buttons = null, numberSpan = null
    let text = ['all', 'active', 'completed']
    buttons = text.map((item, index) => {
      if(item === this.state.activeBtn) {
        return <span className="highLight" key={index}>{item}</span>
      } else {
        return <span className="tabBtn" key={index}>{item}</span>
      }
    })
    if(this.state.todoNumbers > 1) {
      numberSpan = <span>{this.state.todoNumbers} items left</span>
    } else {
      numberSpan = <span>{this.state.todoNumbers} item left</span>
    }
    return (
      <div className="container">
        <h1>Todo List</h1>
        <input type="text" onChange={this.handleValueChange} className="inputBox"/>
        <button onClick={this.handleSearch}>Search</button>
        <button onClick={this.handleAdd}>Add</button>
        <div className="tabs">
          <span onClick={this.clearCompleted} className="clearBtn">Clear Completed</span>
          <div className="btns" onClick={this.btnClick}>{buttons}</div>
          {numberSpan}
        </div>
        <List data={this.state.listData} handleChange={this.handleChange}/>
      </div>
    );
  }

  componentWillMount () {
    this.sendReq('search', 'all', '', '')
  }
}

export default App;
