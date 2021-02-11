var express = require('express')
var parseurl = require('parseurl')
var session = require('express-session')
var FileStore = require('session-file-store')(session)

var app = express()

app.use(session({
  secret: 'asdfasdf',       //꼭 들어가야하는 옵션, 노출되면 안되는 코드, 버전관리를 이용해 따로 빼놔야한다(변수처리 등을 해서)
  resave: false,            // false (session 데이터라는것이 바뀌기 전까지는 세션저장소의 값을 저장하지 않는다) / true (값이 바뀌었건 바뀌지 않았건 계속 저장소에 저장을 한다)
  saveUninitialized: true,  // true (session이 필요하기 전까지는 session을 구동시키지 않는다.) / false (session이 필요하건 필요하지않건 무조건 실행 {서버에 큰 무리})
  store: new FileStore()
}))                         // 코드를 주석처리하고 실행하면 {session = undefined}

                            //session미들웨어는 req객체의 프로퍼티로 session 객체를 추가해주는구나

app.get('/', function (req, res, next) {
    console.log(req.session); 
    if(req.session.num === undefined) {
        req.session.num = 1;
    } else {
        req.session.num = req.session.num + 1;
    }
  res.send(`Views count : ${req.session.num}`); 
  //서버를 껐다가 켜면 1부터 다시시작 (메모리에 저장되어있기때문) {서버를 끄면 메모리의 값이 사라진다.} [만약 서버가 꺼졌다가 켜지면 사용자가 다 로그아웃되는 현상이 일어난다] *그래서 이걸 막기위해 사용하는것이 sessionStore
})

app.listen(3000, function() {
    console.log('3000 port start!')
});

