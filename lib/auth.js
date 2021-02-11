module.exports = {
    isOwner:function(request, response) {
        if(request.session.is_logined) {
          return true;
        } else {
          return false;
        }
      },
      statusUI:function(request, response) {
        var authStatusUI = '<a href="/auth/login">Login</a>'
        if(this.isOwner(request, response)) {
          authStatusUI = `${request.session.nickname} | <a href="/auth/logout">Logout</a>`
        }
        return authStatusUI; //HTML코드를 리턴해줌
      }
}