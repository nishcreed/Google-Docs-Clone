if(process.env.NODE_ENV !== "production"){
  require('dotenv').config();
}

const { WebSocket, WebSocketServer } = require('ws');
const http = require('http');
const uuidv4 = require('uuid').v4;
const { MongoClient, ObjectId } = require('mongodb');
const jwt = require('jsonwebtoken');
const secret_key = 'qwerty';

const uri = process.env.DB_URL || 'mongodb://127.0.0.1:27017';
// const uri = 'mongodb://127.0.0.1:27017';
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


// Maintaining all active connections in this object
const clients = {};

const documentStates = {};


// Event types
const typesDef = {
  CONTENT_CHANGE: 'contentchange',
  HOME:'homeevent',
  NEW_DOCUMENT:'newdocevent',
  DOCUMENT: 'docevent',
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


async function handleRegister (username,email,password) {
  const db = client.db('google-docs');
  const existingUser = await db.collection('register').findOne({ $or: [{ username }, { email }] });
    if (existingUser) {
      console.log('Username or email already exists.');
      return false;
    }

    // If username and email are unique, insert new document
    const document = { username, email, password };
    const result = await db.collection('register').insertOne(document);
    console.log(`Document inserted with _id: ${result.insertedId}`);
    return true;
}

async function handleLogin (username,password) {
  const db = client.db('google-docs');
  const cursor = await db.collection('register').findOne({username,password});
  if(cursor != null) {
    return true;
  }
  return false
}

async function handleNewDoc (docName,owner) {
  const db = client.db('google-docs');
  await db.collection('document').insertOne({docName,owner,content:''});
}

async function getDocs () {
  const db = client.db('google-docs');
  const docs = await db.collection('document').find({}, { projection: { docName: 1, owner: 1, _id: 1 } }).toArray();
  return docs;
} 

async function getDocument(id) {
  const db = client.db('google-docs');
  try {
    const doc = await db.collection('document').findOne(
      { _id: new ObjectId(id) }, 
      { projection: { docName: 1, owner: 1, content: 1, _id: 1 } }
    );
    return doc;
  } catch (error) {
    console.error("Error retrieving document:", error);
    throw error;
  }
}

// Function to perform OT transformation
function transform(content, ops) {
  let transformedContent = content;
  
  ops.forEach(op => {
    if (op.type === 'insert') {
      transformedContent = transformedContent.slice(0, op.position) + op.text + transformedContent.slice(op.position);
    } else if (op.type === 'delete') {
      transformedContent = transformedContent.slice(0, op.position) + transformedContent.slice(op.position + op.length);
    }
  });

  return transformedContent;
}


async function handleContentChange(editorContent, id, clientOps) {
  const db = client.db('google-docs');
  
  // Retrieve the current state of the document from the database
  let documentState = documentStates[id];
  if (!documentState) {
    const documentData = await db.collection('document').findOne({ _id: new ObjectId(id) });
    documentState = documentData;
    documentStates[id] = documentState;
  }
  
  // Transformed operations to the current content of the document
  const transformedContent = transform(documentState.content, clientOps);
  // Update the document state
  documentStates[id].content = transformedContent;

  // Update the document in the database
  const updatedDocument = await db.collection('document').findOneAndUpdate(
    { _id: new ObjectId(id) },
    { $set: { content: transformedContent } },
    { returnDocument: 'after' }
  );
  return updatedDocument.value;
}


async function handleMessage(message, userId) {
  const dataFromClient = JSON.parse(message.toString());
  const json = { type: dataFromClient.type };
  if (dataFromClient.type === typesDef.CONTENT_CHANGE) {
    const doc = await handleContentChange(dataFromClient.content, dataFromClient.id, dataFromClient.ops);
    json.data = {doc}
    broadcastMessage(json);
    return;
  } else if (dataFromClient.type === typesDef.NEW_DOCUMENT) {
    json.type = typesDef.HOME;
    await handleNewDoc(dataFromClient.docName,dataFromClient.username);
    json.data = {docs: await getDocs()};
  } else if (dataFromClient.type === typesDef.HOME) {
    json.data = {docs: await getDocs()};
  } else if (dataFromClient.type === typesDef.DOCUMENT) {
    json.data = {doc: await getDocument(dataFromClient.id)};
  }
  broadcastMessage(json);
}

function handleDisconnect(userId) {
  console.log(`${userId} disconnected.`);
  delete clients[userId];
}


const server = http.createServer((req,res) => {
  // Allow preflight requests
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.writeHead(200);
    res.end();
    return;
  }

  // For other types of requests, set the CORS headers as usual
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
  res.setHeader('Access-Control-Allow-Credentials', true);
  if (req.method === 'POST' && req.url === '/login') {
    let body = '';

    req.on('data',(chunk) => {
      body += chunk;
    })

    req.on('end', async () => {
      try {
        // Parse request body
        const requestData = JSON.parse(body);

        if (requestData.token) {
          jwt.verify(requestData.token,secret_key,(err,decodedToken) => {
            if (err) {
              // JWT verification failed
              console.error('JWT verification failed:', err.message);
            } else {
              
              // Check if the token has expired
              const isExpired = Date.now() >= decodedToken.exp * 1000;
              if (isExpired) {
                res.writeHead(401, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ message: 'Token has expired' }));
              } else {
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end();
              }
            }
          })
        } else {
          if (await handleLogin(requestData.username,requestData.password)) {
            // Send response
            const token = jwt.sign({ username: requestData.username }, secret_key, { expiresIn: '24h' });
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ token }));
          } else {
            res.writeHead(401, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ message: 'Incorrect username or password' }));
          }     
        }
      } catch (error) {
        // Handle parsing or processing errors
        console.error('Error:', error);
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Invalid request data' }));
      }
    })
  } else if (req.method === 'POST' && req.url === '/register') {
    let body = '';

    req.on('data',(chunk) => {
      body += chunk;
    })

    req.on('end', async () => {
      try {
        const requestData = JSON.parse(body);
        result = await handleRegister(requestData.username,requestData.email,requestData.password);
        if (result) {
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end();
        }
        else {
          res.writeHead(401, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ message: 'Username/Email already exists' }));
        }
      } catch (error) {
        // Handle parsing or processing errors
        console.error('Error:', error);
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Invalid request data' }));
      }
    })
  }
});
const wsServer = new WebSocketServer({ server });
const port = 3400;

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
