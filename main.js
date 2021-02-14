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

var authData = { //실제론 이렇게 사용하시면 안됩니다. 연습용코드입니다.
  email:'qoxogus0809@gmail.com',
  password:'111111',  
  nickname:'baetaehyeon'
}

var passport = require('passport') , 
  LocalStrategy = require('passport-local').Strategy;

  app.use(passport.initialize()); //passport를 사용하겠다 (미들웨어)
  app.use(passport.session());    //passport는 내부적으로 세션에 쓰겠다

  passport.serializeUser(function(user, done) { //로그인에 성공했을때 로그인성공여부를 세션스토어에 저장하는 기능을 하는게 serializeUser
    console.log('serializeUser', user);  //serializeUser {email: 'qoxogus0809@gmail.com',password: '111111',nickname: 'baetaehyeon'}
    done(null, user.email);
  });

  passport.deserializeUser(function(id, done) { //페이지에 갈때마다 로그인이 되어있는 사용자인지 아닌지 체크 (페이지를 리로드하거나 이동할때마다 console.log가 계속 호출되었다.)  {저장된 데이터를 기준으로해서 우리가 필요한 정보를 조회할때 사용하는것이 이것}
    console.log('deserializeUser', id); //deserializeUser qoxogus0809@gmail.com  (session passport에 있는 id)
    done(null, authData); //authData가 index.js에 있는 "request.user" 라고하는 객체로 전달되게하도록 약속되어있다.
  });

  passport.use(new LocalStrategy(  //로그인에 성공했는지 실패했는지 판별하는 코드
    {
      usernameField: 'email',
      passwordField: 'pwd'
    },
    function(username, password, done) {
      console.log('LocalStrategy', username, password);
      if(username === authData.email) {
        console.log(1);
        if(password === authData.password) {
          //로그인 성공
          console.log(2);
          return done(null, authData);  // authData = user정보    여기서 보낸 데이터를 serializeUser의 콜백함수에 첫번째 인자로 주입해주도록 약속되어있다.
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

app.post('/auth/login_process', //사용자가 전송한 데이터를 받았을때 우리가 어떻게 처리할 것인지.
  passport.authenticate('local', { //local이 아닌건 페이스북이나 구글을 이용한 로그인 방식.
    successRedirect: '/',          // 성공시 홈으로 보내고(리다이렉트)
    failureRedirect: '/auth/login', // 실패시 다시 로그인요청을 하게
    // function(request, response) {
    //   request.session.save(function(){
    //     response.redirect('/');
    //   })
    // },
    failureFlash:true
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
const { Cookie } = require('express-session');

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