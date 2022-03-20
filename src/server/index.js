const fs = require('async-file');
const app = require('express')();
const server = require('http').createServer(app)
const io = require('socket.io')(server);
const { gcsGetFile, KEY_FILE_NAME, gcsSaveFile } = require('../bucket');
const PORT = process.env.PORT || 80;
server.listen(PORT, () => {
   console.log(`Server is running on port: ${PORT}`);
});
app.get('/', (req,res) => {
    res.sendFile('page.html', {root: './src/client'});
})
 
io.on('connection', (socket) => {
 
  socket.on('update json', async(socketId, {keyData, gcpProject, bucketName, filePath , content}) => {
    try {
    console.log('try write auth file');
    await fs.writeFile(KEY_FILE_NAME, keyData);
    console.log('try save file');
    await gcsSaveFile({
      fileName: filePath,
      bucketName,
      gcpProjectId : gcpProject,
      content
    });
    io.to(socketId).emit('update json from server', 'success update json');
  } catch (e) {
    io.to(socketId).emit('update json from server', 'fail update json');
  }

});
  
   socket.on('get json', async(socketId, {keyData, gcpProject, bucketName, filePath}) => {
     let messageToClient;
     try {
       console.log('try get json');
        await fs.writeFile(KEY_FILE_NAME, keyData);
        const settingsToUpdate = await gcsGetFile({
          fileName: filePath,
          bucketName,
          gcpProjectId : gcpProject,
        });
        messageToClient = settingsToUpdate;
        
      } catch (e){
        messageToClient = `Error getting json from gcs: \n ${e.toString()}`;
      }
      finally {
        io.to(socketId).emit('json from server', messageToClient);
      }
   });

   
});