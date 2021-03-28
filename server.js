const express = require('express');
const cors = require("cors");
var fs = require('fs');
const bodyParser = require("body-parser");
var cookieParser = require('cookie-parser');
const logger = require("morgan");
const { Console } = require('console');
const app = express();

//the json files that store our data for each board

//Todos board
var todos = fs.readFileSync('Todos.json');
var jsonTodos = JSON.parse(todos);

//progress board
var progress = fs.readFileSync('InProgress.json');
var jsonProgress = JSON.parse(progress);

//done board
var done = fs.readFileSync('Done.json');
var jsonDone = JSON.parse(done);


app.use(logger('dev'));
app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.json());
app.use(cookieParser());
app.use(express.static('/public'))

//'get' routes to get the data for each board
app.get('/api/listtodos', function(req, res)  {
   res.json(jsonTodos)
});
app.get('/api/listinprogress', function (req, res) {
  res.json(jsonProgress);
});
app.get('/api/listdone', function (req, res) {
  res.send(jsonDone);
});

//post and delete routes to respectively add and delete tasks from a board
app.post('/api/addToDo/', addToDo);
app.delete('/api/deleteTask/', deleteTask);


//delete function, called by the deleteTask route, which deletes a given task
function deleteTask(req, res) {
  var data = req.body;
  var b = data.board;
  var jsonfile = jsonTodos;
  if (b === 'Done') {
    jsonfile = jsonDone;
  } else if (b === 'In Progress') {
    jsonfile = jsonProgress;
  }
  var index = jsonfile.findIndex(a=> a.title === data.title);
  jsonfile.splice(index, 1);
  
  let jsonData = JSON.stringify(jsonfile, null, 2);
  
  if (b == 'Done') {
    fs.writeFile('Done.json', jsonData, finish);
  } else if (b == 'In Progress') {
    fs.writeFile('InProgress.json', jsonData, finish);
  } else {
    fs.writeFile('Todos.json', jsonData, finish);
  }

  function finish(err) {
    console.log('deleted task from to-do');
  }
  res.send(jsonTodos);
  
}

//add function, called by the addToDo route, which adds a task
function addToDo(req, res) {
  console.log('adding to do', req.body.board);
  var data = req.body;
  var t = data.title;
  var d = data.description;
  var p = data.points;
  var u = data.user;
  var b = data.board;
  var jsonfile = jsonTodos;
  if (b === 'Done') {
    jsonfile = jsonDone;
  } else if (b === 'In Progress') {
    jsonfile = jsonProgress;
  }

  jsonfile.push({
    title: t,
    description: d,
    points: p,
    user: u,
    board: b
  });
  let jsonData = JSON.stringify(jsonfile, null, 2);

  if (b == 'Done') {
    fs.writeFile('Done.json', jsonData, finish);
  } else if (b == 'In Progress') {
    fs.writeFile('InProgress.json', jsonData, finish);
  } else {
    fs.writeFile('Todos.json', jsonData, finish);
  }

  function finish(err) {
    console.log('added new task to to-do', b);
  }

  res.send(jsonfile);
}

//port and server
const port = process.env.PORT || '8080';

const server = app.listen(port, () => {
  console.log(
    'Server running on port ' + port);
});

module.exports = app;
