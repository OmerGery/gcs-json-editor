const {  Storage } = require('@google-cloud/storage');

const KEY_FILE_NAME  = './google-auth.json';
const getBucket = ({gcpProjectId, bucketName}) => {
  const storage = new Storage({
    projectId: gcpProjectId,
    keyFilename: KEY_FILE_NAME,
  });
  return storage.bucket(bucketName);
}

   

  const gcsSaveFile = async ({bucketName, 
    gcpProjectId, 
    fileName, 
    content }
    ) => {
    const bucket = getBucket({gcpProjectId, bucketName});
    const file = bucket.file(fileName);
    return file.save(content);
  }

  const gcsGetFile = async({
    fileName,
    gcpProjectId,
    bucketName,

  }) => {
    return new Promise((resolve) => {
      try {
      const bucket = getBucket({gcpProjectId, bucketName});
      const fileStream = bucket.file(fileName).createReadStream();
      let jsonBuffer = '';
      fileStream.on('data', (data) => {
        jsonBuffer += data;
      })
      .on('end', () => {
        resolve(JSON.parse(jsonBuffer));
      })
      .on('error', (e) => {
          console.error(e);
        });
    } catch (e) {
      console.error(e);
    }
  })};      
    
    

  module.exports = {
    gcsGetFile,
    gcsSaveFile,
    KEY_FILE_NAME
  };
