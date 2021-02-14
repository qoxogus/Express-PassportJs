var express = require('express')
var app = express()
var fs = require('fs');
var bodyParser = require('body-parser');
var compression = require('compression');
var helmet = require('helmet') //보안관련
app.use(helmet());
var session = require('express-session')
var FileStore = require('session-file-store')(session)// 실제론 데이터베이스나 캐싱데이터베이스에 저장하는게 바람직하다.
var flash = require('connect-flash');


app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(compression()); //압축
app.use(session({ //세션을 활성화 시키는 코드
  secure: true,
  secret: 'asdfasdf',
  resave: false,
  saveUninitialized: true,
  // store: new FileStore(),
}))
app.use(flash());

// app.get('/flash', function(req, res){
//   // Set a flash message by passing the key, followed by the value, to req.flash().
//   req.flash('msg', 'Flash is back!!'); //세션스토어에 추가됨 (1회용 메세지이므로 1회 사용하면 지워짐)
//   res.send('flash');
// });

// app.get('/flash-display', function(req, res){
//   // Get an array of flash messages by passing the key to req.flash()
//   var fmsg = req.flash();
//   console.log(fmsg);
//   res.send(fmsg);
// });

//passport는 세션을 내부적으로 사용하기 때문에 세션을 활성화 시키는 코드 다음에 passport가 등장해야한다



var passport = require('./lib/passport')(app);



app.get('*', function(request, response, next){ //next에 middleware가 담겨있다고 생각    불필요한 불러오기를 방지하기 위해 get을 사용(post방식 등에서 방지)   '*' = 들어오는 모든 요청    (들어오는 모든요청이 아닌 get방식으로 들어오는 요청에 대해서만 파일리스트를 가져오는 코드)
  fs.readdir('./data', function(error, filelist) {
    request.list = filelist;
    next();
  });
});

var indexRouter = require('./routes/index');
var topicRouter = require('./routes/topic');
var authRouter = require('./routes/auth')(passport);

app.use('/', indexRouter);
app.use('/topic', topicRouter); // /topic 이므로 topic.js에서는 /topic을 빼야한다
app.use('/auth', authRouter);


//미들웨어는 순차적으로 실행이 된다 그러므로 404에러처리 미들웨어는 가장 마지막에 위치한다.
app.use(function(req, res, next) {
  res.status(404).send('Sorry cant find that!');
});

app.use(function (err, req, res, next) {
  console.error(err.stack)
  res.status(500).send('Something broke!')
});

// app.listen(3000, () => console.log('Example app listening on port 3000!'))
app.listen(3000, function() { //3000포트에서
  console.log('Example app listening on port 3000!')
});