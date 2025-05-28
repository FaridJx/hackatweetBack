const mongoose = require('mongoose');

const connectionString = 'mongodb+srv://admin:2dd93a543180@atlascluster.czbu2pv.mongodb.net/hackatweet';

mongoose.connect(connectionString, { connectTimeoutMS: 2000 })
 .then(() => console.log('Database connected'))

  .catch(error => console.error(error));