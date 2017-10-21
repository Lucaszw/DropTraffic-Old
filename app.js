var express = require('express');
var app = express();

var _ = require('underscore');
var server = require('http').Server(app);
var io = require('socket.io')(server);
var client = null;

server.listen(5000);

io.on('connection', function(socket){
  client = socket;
  client.on('disconnect', function(){});
});

app.post('/sendPixelSequence', function(req, res){
  var pixels = req.query.pixels.split(",");
  client.emit('receivePixelSequence', {pixels: pixels});
  res.send("message emitted");
});

app.get('/getPixelsFromCoordinates', function(req, res){
  const pixelStr = req.query.pixels.split(',');
  let pixels = new Array(pixelStr.length);

  _.each(pixelStr, (p,i)=>{
    const yIndex = p.indexOf("y");
    const x = parseInt(p.slice(1,yIndex));
    const y = parseInt(p.slice(yIndex+1,Infinity));
    pixels[i] = {x: x, y:y};
  });

  client.emit('retrievePixelsFromCoordinates', pixels);

  client.on('retrievedLabels', function(data){
    const labels = data.labels;
    client.removeAllListeners('retrievedLabels');
    res.send(labels);
  });

});

app.get('/getBoardDimensions', function(req,res){
  client.emit('getBoardDimensions', {});
  client.on('retrievedBoardDimensions', function(data){
    client.removeAllListeners('retrievedBoardDimensions');
    res.send(data);
  });
});

app.get('/getAllStandardPixels', function(req,res){
  client.emit('getAllStandardPixels', {});
  client.on('retrievedStandardPixels', function(data){
    client.removeAllListeners('retrievedStandardPixels');
    res.send(data);
  });
});

app.get('/turnOnPixelInDirection', function(req,res){
  let data = req.query;

  client.emit('turnOnPixelInDirection', data);
  client.on('retrievedPixelInDirection', function (data) {
    client.removeAllListeners('retrievedPixelInDirection');
    res.send(data.labels);
  });
});

app.post('/turnOffAllPixels', function(req,res){
  let data = req.query;
  client.emit('turnOffAllPixels', data);
  res.send("turned off all pixels");
});

app.use('/', express.static(__dirname + '/dist'));
