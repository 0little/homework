NEJ.define([
  'base/element', //element
  'base/event', //event
  'util/ajax/xdr' //ajax
],function(_e, _v, _j){
  let url = 'http://127.0.0.1:3001' //node服务器地址
  let activeBtn = 'all'
  //更新任务列表
  function updateUl(str) {
    let innerStr = '', arr = [], _ul = _e._$get('list')
    switch(str) {
      case '[]':
      case '':
        innerStr = '没有结果'
        break;
      default:
        //默认情况下传进来的字符串可解析为数组
        arr = JSON.parse(str)
        for(let i = 0; i < arr.length; i++) {
          let checked = arr[i].status === 'Y' ? true : false
          innerStr += `<li data-id=${arr[i].number} data-status=${arr[i].status}>
            <div>
            <div class="checkbox">`
          if(arr[i].status === 'Y') {
            innerStr += `<input type="checkbox" class="hiddenCheck" name="selection" checked>`
          } else {
            innerStr += `<input type="checkbox" class="hiddenCheck" name="selection">`
          }
          innerStr += `
            <span class="trueMark"></span>
            </div>
            </div>
            <div class=${arr[i].status === 'Y' ? 'done' : ''}>
            ${arr[i].decp}
            </div>
            <span class="deleteIcon">&times;</span>
          </li>`
        }
        break;
    }
    //替换列表内容
    _ul.innerHTML = innerStr
  }
  // 改变all、active、completed三个按钮的颜色
  function changeBg (id) {
    //更改状态和删除时，按钮颜色不变
    if(id === '' || id === 'clearBtn') return
    //点击search和add时三个按钮均不是高亮，否则点击哪个按钮哪个按钮高亮
    _e._$getByClassName('btns', 'tabBtn').map(function (item) {
      if(item.id === id) {
        item.className = 'tabBtn highLight'
      } else {
        item.className = 'tabBtn'
      }
    })
  }
  //向服务端发送请求,参数分别是用户操作，传给服务端的id，描述，状态，触发操作的元素
  function sendReq(o, i, d, s, e) {
    let p = {
      operation: o,
      id: i,
      description: d,
      status: s
    }
    if(sessionStorage.getItem(JSON.stringify(p))) {
      changeBg(activeBtn)
      updateUl(sessionStorage.getItem(JSON.stringify(p)))
      return
    }
    _j._$request(url, {
      method: 'post',
      data: JSON.stringify(p),
      onerror: function (err) {
        console.log(err, 'err')
      },
      onload: function (res) {
        let data = JSON.parse(res).data, count = JSON.parse(res).count
        //更新未完成任务的数量
        _e._$get('countSpan').innerHTML = count > 1 ? count + ' items left' : count + ' item left'
        //当用户的操作未查询时，直接根据返回的数据更新列表，
        // 若不是，根据情况判断是否需要再进行查询请求
        switch (o) {
          case 'search':
            changeBg(activeBtn)
            sessionStorage.setItem(JSON.stringify(p), JSON.stringify(data))
            updateUl(JSON.stringify(data))
            break;
          case 'add':
            sessionStorage.clear()
            sendReq('search', activeBtn, '', '', '')
            _e._$get('inputBox').value = ''
            break;
          case 'delete':
          case 'change':
            sessionStorage.clear()
            sendReq('search', activeBtn, _e._$get('inputBox').value, '', '')
            break;
          default:
            break;
        }
      }
    })
    return
  }
  //采用事件委托，规定不同元素的点击事件应得到什么样的响应
  _v._$addEvent('body', 'click', function(_event){
    let _element = _v._$getElement(_event)
    let inputValue =  _e._$get('inputBox').value
    switch (_element.id) {
      case 'addBtn':
        if (inputValue === '') {
          alert('输入不能为空！')
        } else {
          sendReq('add', '', inputValue, '', _element)
        }
        break;
      case 'searchBtn':
      case 'all':
      case 'active':
      case 'completed':
        if(_element.id !== 'searchBtn') activeBtn = _element.id
        sendReq('search', activeBtn, inputValue, '', _element)
        break;
      case 'clearBtn':
        sendReq('delete', 'all', '', '', _element)
        break;
      default:
        if(_element.className.indexOf('deleteIcon') >= 0) {
          let id = +_element.parentNode.dataset.id
          sendReq('delete', id, '', '', _element)
        } else if(_element.className.indexOf('hiddenCheck') >= 0) {
          let id = +_element.parentNode.parentNode.parentNode.dataset.id
          let status = _element.parentNode.parentNode.parentNode.dataset.status
          sendReq('change', id, '', status, _element)
        }
        break;
    }
  },false)
  //刚打开页面时，查询数据库中所有任务
  sendReq('search', activeBtn, '', '', _e._$get('all'))
})

