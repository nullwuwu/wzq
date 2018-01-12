const app = require('express')();
const http = require('http').Server(app);
const io = require('socket.io')(http);

app.get('/', function(req, res){
  res.send('<h1>Hello world</h1>');
});

let gameStatus = {
  status: 0, // 0未开始 1已开始
  p1: false,
  p2: false
}


io.on('connection', (socket) => {
  console.log(socket)
  socket.emit('gameStatus', gameStatus)
  socket.on('ready', (p) => {
    console.log(p)
    if (p === 1) {
      gameStatus.p1 = true
    } else if (p === 2) {
      gameStatus.p2 = true
    }
    if (gameStatus.p1 && gameStatus.p2) {
      gameStatus.status = 1
      io.emit('gameStart', gameStatus)
    }
  })
  socket.on('chess', (data) => {
    io.emit('chessSuccess', data)
  })
})

http.listen(3300, function(){
  console.log('listening on *:3300');
});