module.exports = {
    isOwner:function(request, response) {
        if(request.user) { //request.user가 있다면
          return true;
        } else {
          return false;
        }
      },
      statusUI:function(request, response) {
        var authStatusUI = '<a href="/auth/login">Login</a>'
        if(this.isOwner(request, response)) { //true || false
          authStatusUI = `${request.user.nickname} | <a href="/auth/logout">Logout</a>`
        }
        return authStatusUI; //HTML코드를 리턴해줌
      }
}