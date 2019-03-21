import React, { Component } from 'react'
import './List.css'

class List extends Component {
  constructor (props) {
    super(props)
    this.handleDelete = this.handleDelete.bind(this)
    this.handleCheckbox = this.handleCheckbox.bind(this)
  }

  handleDelete (event) {
    this.props.handleChange('delete', event.target.parentNode.id, '')
  }

  handleCheckbox (event) {
    event.preventDefault()
    this.props.handleChange('change',
    event.target.parentNode.parentNode.id,
    event.target.checked ? 'N' : 'Y')
  }

  render () {
    let content = null
    switch (this.props.data) {
      case '':
        content = <div>没有结果！</div>
        break;
      case '删除成功！':
        content = <div>删除成功！</div>
        break;
      case '添加成功！':
        content = <div>添加成功！</div>
        break;
      default:
        let arr = JSON.parse(this.props.data)
        if(arr.length === 0) {
          content = <div>没有结果！</div>
        } else {
          content = arr.map(item => {
           return (
             <li id={item.number} key={item.number} data-status={item.status}>
              <div className="checkbox">
                <input type="checkbox" className="hiddenCheck" name="selection"
                       onChange={this.handleCheckbox} checked={item.status === 'Y'}/>
                <span className="trueMark"></span>
              </div>
              <span className={item.status === 'Y' ? 'done' : ''}>
                {item.decp}
              </span>
              <span className="deleteIcon" onClick={this.handleDelete}>&times;</span>
             </li>
           )
          })
        }
        break;
    }
    return (
      <ul id="list" onClick={this.handleClick}>{content}</ul>
    )
  }
}

export default List