module.exports = function(app) {

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
          if(password === authData.password) {
            //로그인 성공
            return done(null, authData);  // authData = user정보    여기서 보낸 데이터를 serializeUser의 콜백함수에 첫번째 인자로 주입해주도록 약속되어있다.
          } else {
            return done(null, false, { message: 'Incorrect password.' });
          }
        } else {
          return done(null, false, { message: 'Incorrect username.' });
        }
      }
    ));
    return passport;
}
