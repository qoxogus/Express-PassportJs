// '/auth'의 하위 부분

var express = require('express');
var router = express.Router();
var path = require('path');
var fs = require('fs');
var sanitizeHtml = require('sanitize-html');
var template = require('../lib/template.js');

//session에는 사용자가 로그인을 했는지를 알려줄수있는 정보, 페이지에 접근할때마다 사용자에 필요한 정보 ex)닉네임, 세션에 담아두면 DB나 파일에 다시 접근 할 필요가 없어서 효율적이다


module.exports = function(passport){
  router.get('/login', function(request, response){ // /topic/:pageId보다 먼저 실행함으로써 topic을 예약어로 쓰일수있음 (실행순서 중요해짐)
    var fmsg = request.flash();
    var feedback = '';
    if(fmsg.error) {
      feedback = fmsg.error[0];
    }
    var title = 'WEB - Login';
    var list = template.list(request.list);
    var html = template.HTML(title, list, `
    <div style="color:red;">${feedback}</div>
      <form action="/auth/login_process" method="post">
        <p><input type="text" name="email" placeholder="email"></p>
        <p><input type="password" name="pwd" placeholder="password"></p>
        <p>
          <input type="submit" value="login">
        </p>
      </form>
    `, '');
    response.send(html);
  });
  
  router.post('/login_process', //사용자가 전송한 데이터를 받았을때 우리가 어떻게 처리할 것인지.
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
  
  /* 
    router.post('/login_process', function(request, response) {
    var post = request.body; // /login의 form부분이 body이다.
    var email = post.email;
    var password = post.pwd;
    if(email === authData.email && password === authData.password) {
      //success!
      request.session.is_logined = true;            //인증에 성공한다면 로그인 확인정보와 이름정보를 세션에 저장
      request.session.nickname = authData.nickname;
      request.session.save(function() {
        response.redirect(`/`);
      }); //session store에 저장하는 작업을 바로 시작함 (느려졌을때 바로 리다이렉션하여 무한로그인 방지)
      
    } else {
      response.send('Who?');
    }
      
  });
  */
  
  router.get('/logout', function(request, response){ 
    request.logout();
    // request.session.destroy(function(err) { //세션 삭제를 위해 destroy를 사용한다. / destroy는 콜백을 받는다. 세션삭제가 완료된 후 호출되도록 약속되어있다 / err를 인자로 받는다
    //   response.redirect('/');  
    // });
    request.session.save(function() {
      response.redirect('/');
    })
   }); //원래 세션은 지워지고 새로운 세션울 발급하며 완전히 새로운 사람으로 인식한다
  return router;
}
