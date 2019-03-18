let http = require('http')
let mysql = require('mysql')

//创建连接
let db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  port: 3307,
  database: 'todo',
  multipleStatements: true
})

//建表
db.query(
  "CREATE TABLE IF NOT EXISTS list ("
  + "number INT(4) NOT NULL AUTO_INCREMENT, "
  + "decp char(100) not null default '', "
  + "status char(1) not null default 'N', "
  + "PRIMARY KEY(number))",
  function (err, result) {
    if(err) throw err
  })

//连接
db.connect();

//开启服务器
let server = http.createServer(function (req, res) {
  let resData = ''
  res.setHeader('Content-Type', 'json')
  //允许跨域
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,XFILENAME,XFILECATEGORY,XFILESIZE')
  req.on('data', function (data) {
    let sql = ''
    let param = JSON.parse(data)
    //增删改查四个对数据库的操作
    switch (param.operation) {
      case 'search':
        switch (param.id) {
          case 'all':
            sql = 'select * from list;'
            break;
          case 'completed':
            sql = 'select * from list where status="Y";'
            break;
          case 'active':
            sql = 'select * from list where status="N";'
            break;
          default:
            sql = "select * from list where decp like '%" + param.description + "%';"
            break;
        }
        break;
      case 'add':
        sql = 'insert list(decp, status) value("' + param.description + '", "N");'
        break;
      case 'change':
        let status = param.status === 'N' ? 'Y' : 'N'
        sql = 'update list set status="' + status + '" where number=' + param.id + ';'
        break;
      case 'delete':
        sql = param.id === 'all' ?
          'delete from list where status="Y";' :
          'delete from list where number=' + param.id + ';'
        break;
    }
    //查询未完成任务的数量
    sql += 'select count (*) as count from list where status = "N";'
    db.query(sql, function (err, result) {
      if(err) throw err
      let obj = {
        data: result[0],
        count: result[1][0].count
      }
      resData = JSON.stringify(obj)
      res.end(resData)
    })
  })
})

server.listen(3001, '127.0.0.1')