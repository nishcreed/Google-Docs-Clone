# Google-Docs-Clone

## Technologies
- ReactJs
- MongoDB
- NodeJs

## Key Features
- Authentication with the usage of JWT
- Real-time collaboration with the help of operational transformation algorithm
- Presence of authorization

## Implementation of collaboration
- For every change in editor, old content and new content are compared, the changes and operation done are found and sent to server
- In server, transformation (OT algorithm) is done with the info received from client and updated in database
- The new content is sent to all clients

## How to run locally
- Install NodeJs, MongoDB
- Download the zip of this repo
- Start mongo server by running ```mongod``` in a terminal
- In the development folder, open a terminal, run ```cd server``` and then ```npm install```.
- In the development folder, open a terminal, run ```cd client/doc``` and then ```npm install```.
- In the development folder, open a terminal, run ```cd server``` and then ```node app.js``` to start the server.
- Similarily, run ```cd client/doc``` and then ```npm start``` to start the client.

Link to website: [https://docsync-60db.onrender.com](https://docsync-60db.onrender.com)
