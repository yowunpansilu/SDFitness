const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/sdfitness')
.then(async () => {
    console.log('Connected');
    const messages = await mongoose.connection.db.collection('messages').find().sort({createdAt:-1}).limit(5).toArray();
    console.log(JSON.stringify(messages, null, 2));
    process.exit(0);
})
.catch(console.error);
