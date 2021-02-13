var express = require('express')
var app = express()
var fs = require('fs');
var bodyParser = require('body-parser');
var compression = require('compression');
var helmet = require('helmet') //보안관련
app.use(helmet());
var session = require('express-session')
var FileStore = require('session-file-store')(session)// 실제론 데이터베이스나 캐싱데이터베이스에 저장하는게 바람직하다.


app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(compression()); //압축
app.use(session({ //세션을 활성화 시키는 코드
  secret: 'asdfasdf',
  resave: false,
  saveUninitialized: true,
  store: new FileStore()
}))

//passport는 세션을 내부적으로 사용하기 때문에 세션을 활성화 시키는 코드 다음에 passport가 등장해야한다

var authData = { //실제론 이렇게 사용하시면 안됩니다. 연습용코드입니다.
  email:'qoxogus0809@gmail.com',
  password:'111111',  
  nickname:'baetaehyeon'
}

var passport = require('passport') 
  , LocalStrategy = require('passport-local').Strategy;

  passport.use(new LocalStrategy(
    {
      usernameField: 'email',
      passwordField: 'pwd'
    },
    function(username, password, done) {
      console.log('LocalStrategy', username, password);
      if(username === authData.email) {
        console.log(1);
        if(password === authData.password) {
          console.log(2);
          return done(null, authData);  // authData = user정보
        } else {
          console.log(3);
          return done(null, false, { message: 'Incorrect password.' });
        }
      } else {
        console.log(4);
        return done(null, false, { message: 'Incorrect username.' });
      }
    }
  ));

app.post('/auth/login_process',
  passport.authenticate('local', { //local이 아닌건 페이스북이나 구글을 이용한 로그인 방식.
    successRedirect: '/',          // 성공시 홈으로 보내고(리다이렉트)
    failureRedirect: '/auth/login' // 실패시 다시 로그인요청을 하게
  }));

app.get('*', function(request, response, next){ //next에 middleware가 담겨있다고 생각    불필요한 불러오기를 방지하기 위해 get을 사용(post방식 등에서 방지)   '*' = 들어오는 모든 요청    (들어오는 모든요청이 아닌 get방식으로 들어오는 요청에 대해서만 파일리스트를 가져오는 코드)
  fs.readdir('./data', function(error, filelist) {
    request.list = filelist;
    next();
  });
});

var indexRouter = require('./routes/index');
var topicRouter = require('./routes/topic');
var authRouter = require('./routes/auth');

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