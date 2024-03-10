const { WebSocket, WebSocketServer } = require('ws');
const http = require('http');
const uuidv4 = require('uuid').v4;
const { MongoClient } = require('mongodb');


const uri = 'mongodb://127.0.0.1:27017';
const client = new MongoClient(uri);

// Connect to the MongoDB server
async function connect() {
    try {
      await client.connect();
      console.log('Connected to MongoDB');
    } catch (error) {
      console.error('Error connecting to MongoDB:', error);
    }
}



// Spinning the http server and the WebSocket server.
const server = http.createServer();
const wsServer = new WebSocketServer({ server });
const port = 3400;


// Maintaining all active connections in this object
const clients = {};
// Maintaining all active users in this object
const users = {};
// The current editor content is maintained here.
let editorContent = null;
// User activity history.
let userActivity = [];

// Event types
const typesDef = {
  USER_EVENT: 'userevent',
  CONTENT_CHANGE: 'contentchange',
  REGISTER :'register'
}

function broadcastMessage(json) {
  // Sending the current data to all connected clients
  const data = JSON.stringify(json);
  for(let userId in clients) {
    let client = clients[userId];
    if(client.readyState === WebSocket.OPEN) {
      client.send(data);
    }
  };
}


async function findDocuments(db) {
  const cursor = db.collection('collection_name').find();
  const documents = await cursor.toArray();
  console.log('Found documents:', documents);
}

async function updateDocument(db, filter, update) {
  const result = await db.collection('collection_name').updateOne(filter, { $set: update });
  console.log(`${result.modifiedCount} document(s) updated.`);
}


async function handleRegister(username,email,password) {
  const db = client.db('google-docs');
  const existingUser = await db.collection('register').findOne({ $or: [{ username }, { email }] });
    if (existingUser) {
      console.log('Username or email already exists.');
      return false; // Exit the function without inserting a new document
    }

    // If username and email are unique, insert the new document
    const document = { username, email, password };
    const result = await db.collection('register').insertOne(document);
    console.log(`Document inserted with _id: ${result.insertedId}`);
    return true;
}

async function handleLogin(username,password) {
  const db = client.db('google-docs');
  const cursor = await db.collection('register').findOne({username,password});
  if(cursor) {
    console.log('User exists');
    return true
  }

  return false
}

async function handleMessage(message, userId) {
  const dataFromClient = JSON.parse(message.toString());
  const json = { type: dataFromClient.type };
  if (dataFromClient.type === typesDef.USER_EVENT) {
    users[userId] = dataFromClient;
    userActivity.push(`${dataFromClient.username} joined to edit the document`);
    if(handleLogin(dataFromClient.username,dataFromClient.password))
      json.data = { users, userActivity,'msg':''};
    else
      json.data = { users, userActivity,'msg':'Username or password is incorrect' };
  } else if (dataFromClient.type === typesDef.CONTENT_CHANGE) {
    editorContent = dataFromClient.content;
    json.data = { editorContent, userActivity };
  } else if (dataFromClient.type === typesDef.REGISTER) {
    result = await handleRegister(dataFromClient.username,dataFromClient.email,dataFromClient.password);
    if(result)
      json.data = {msg:'Registered'}
    else
      json.data = {msg:'Username or email already exists'}
  }
  broadcastMessage(json);
}

function handleDisconnect(userId) {
  console.log(`${userId} disconnected.`);
  const json = { type: typesDef.USER_EVENT };
  const username = users[userId]?.username || userId;
  userActivity.push(`${username} left the document`);
  json.data = { users, userActivity };
  delete clients[userId];
  delete users[userId];
  broadcastMessage(json);
}

server.listen(port, async () => {
  await connect();
  console.log(`WebSocket server is running on port ${port}`);
  // A new client connection request received
  wsServer.on('connection', function(connection) {
    // Generate a unique code for every user
    const userId = uuidv4();
    console.log('Received a new connection');

    // Store the new connection and handle messages
    clients[userId] = connection;
    console.log(`${userId} connected.`);
    connection.on('message', (message) => handleMessage(message, userId));
    // User disconnected
    connection.on('close', () => handleDisconnect(userId));
  });
});
