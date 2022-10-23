const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');


const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;

  const account = users.find(
    (user) => user.username === username
  );

  if (!account) {
    return response.status(400).json({
      error: "Account not found!"
    });
  }

  request.account = account;

  return next();
}

app.post('/users', (request, response) => {
  const { name, username } = request.body;

  const userAlreadyExists = users.some(
    (user) => user.username === username
  );

  if (userAlreadyExists) {
    return response.status(400).json({
      error: "User already exists!"
    });
  }

  const user = {
    id: uuidv4(),
    name,
    username,
    todos: []
  };

  users.push(user);

  return response.status(201).json(user);
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { account } = request;

  return response.status(200).json(account.todos);
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body;
  const { account } = request;
  
  const todo = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date()
  };

  account.todos.push(todo);

  return response.status(201).json(todo);
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body;
  const { id } = request.params;
  const { account } = request;

  const todo = account.todos.find(
    (todo) => todo.id === id
  );

  if (!todo) {
    return response.status(404).json({
      error: "Todo not found!"
    });
  }

  if (title) {
    todo.title = title;
  }

  if (deadline) {
    todo.deadline = new Date(deadline);
  }

  return response.status(201).json(todo);
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { id } = request.params;
  const { account } = request;

  const todo = account.todos.find(
    (todo) => todo.id === id
  );

  if (!todo) {
    return response.status(404).json({
      error: "Todo not found!"
    });
  }

  if (todo.done === false) {
    todo.done = true;
  } else {
    todo.done = false;
  }

  return response.status(201).json(todo);
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { id } = request.params;
  const { account } = request;

  const todo = account.todos.find(
    (todo) => todo.id === id
  );

  if (!todo) {
    return response.status(404).json({
      error: "Todo not found!"
    });
  }

  account.todos.splice(todo, 1);

  return response.status(204).json(account.todos);
});

module.exports = app;