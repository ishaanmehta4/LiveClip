var express = require('express');
var app = express();
var http = require('http').createServer(app);
var io = require('socket.io')(http);
var db = {};
var roomdb = {};
app.use(express.static('static'));

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', (socket) => {

  socket.on('joinroom', function(roomid)//CLIENT'S REQ TO JOIN A ROOM
  {
    socket.join(roomid);
    roomdb[socket.id] = roomid;
    if(db[roomid] === undefined)//NEW ROOM DB init
    {
      db[roomid] = { 'owner':'', 'text':'', 'users': {}, 'versiondb': {} }
    }
    socket.emit('updatetext', db[roomid].text);
    socket.emit('updateowner', db[roomid].owner);
    socket.emit('updateversions', db[roomid].versiondb);
  })

  socket.on('joinusers', function(msg)//CLIENT'S REQ TO JOIN USERLIST
  {
    db[msg.roomid].users[socket.id] = msg.username;
    socket.to(msg.roomid).emit('updateusers', db[msg.roomid].users);
    socket.to(msg.roomid).emit('setTempStatus', `${msg.username} just joined this LiveClip.`);
  })

  socket.on('tellowner', function(msg)//UPDATES ROOM OWNER
  {
    db[msg.roomid].owner = msg.username;
    socket.to(msg.roomid).emit('updateowner', msg.username);
    socket.emit('updateowner', msg.username);
  })

  socket.on('getusers', function(text)//CLIENT'S REQ TO GET USERLIST OF HIS ROOM
  {
    socket.emit('updateusers', db[ roomdb[socket.id] ].users);
  })

  socket.on('changedtext', function(msg)//CLIENT'S REQ TO UPDATE TEXT 
  {
    db[msg.roomid].text = msg.text;
    socket.to(msg.roomid).emit('updatetext', msg.text);
    let d = new Date();
    let time = '';
  })

  socket.on('newsave', function(msg)//CLIENT ADDS A NEW VERSION
  {
    let room = roomdb[socket.id];
    db[room].versiondb[ msg.versionname ] = msg.text;
    socket.to(room).emit('updateversions', db[room].versiondb);
    socket.emit('updateversions', db[room].versiondb);
  })

  socket.on('sendPermStatus', function(text)
  {
    socket.to(roomdb[socket.id]).emit('setPermStatus', text);
    socket.emit('setPermStatus', text);
  })

  socket.on('sendTempStatus', function(text)
  {
    socket.to(roomdb[socket.id]).emit('setTempStatus', text);
    socket.emit('setTempStatus', text);
  })

  socket.on('disconnect', function(reason)//IF ANY USER DISCONNECTS
  {
    let room = roomdb[socket.id];
    for (socketid in db[room].users)
    {
      if(socketid === socket.id) 
      {
        socket.to(room).emit('setTempStatus', `${db[room].users[socketid]} has left this LiveClip.`);
        db[room].users[socketid] = '';
      }
    }
    socket.to(room).emit('updateusers', db[room].users);
    roomdb[socket.id] = '';
  })

});//END OF IO CONNECTION EVENT

http.listen(process.env.PORT || 5000, () => {
  console.log('SERVER STARTED');
});