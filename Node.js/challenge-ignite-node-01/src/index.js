const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

// Checking if user exists
function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;

  const user = users.find((user) => user.username === username);

  if(!user) {
    return response.status(404).json({ error: "User not found"})
  }

  request.user = user;

  return next();
}

// Creating a new user
app.post('/users', (request, response) => {
  const { name , username } = request.body;

  const userAlreadyExists = users.some( user => user.username === username);

  if (userAlreadyExists) {
    return response.status(400).json({ error: 'User already exists' });
  };

  const newUser = {
    name,
    username,
    id: uuidv4(),
    todos: []
  }

  users.push(newUser);

  return response.status(201).json(newUser);
});

// Listing user's to-dos
app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request;

  return response.json(user.todos);
});

// Creating a new to-do
app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { title , deadline } = request.body;
  const { user } = request;

  const newTodo = {
    id: uuidv4(),
    title,
    done: false, 
    deadline: new Date(deadline),
    created_at: new Date()
  };

  user.todos.push(newTodo);

  return response.status(201).json(newTodo);
});

// Updating a existing to-do
app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body;
  const { user } = request;
  const { id } = request.params;

  const updatedTodo = user.todos.find( userTodo => userTodo.id === id);

  if(!updatedTodo) {
    return response.status(404).json({ error: 'To-do not found' });
  };

  updatedTodo.title = title;
  updatedTodo.deadline = new Date(deadline);

  return response.json(updatedTodo);
});

// Marking a to-do as done
app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;

  const doneTodo = user.todos.find( userTodo => userTodo.id === id);

  if(!doneTodo) {
    return response.status(404).json({ error: 'To-do not found' });
  }

  doneTodo.done = true;

  return response.json(doneTodo);
});

// Deleting a to-do
app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;

  const deletedTodoIndex = user.todos.findIndex( userTodo => userTodo.id === id);

  if (deletedTodoIndex === -1) {
    return response.status(404).json({error: "To-do not found"});
  }

  user.todos.splice(deletedTodoIndex, 1);

  return response.status(204).send();
});

module.exports = app;