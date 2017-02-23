const bodyParser = require('body-parser');
const express = require('express');
const mongoose = require('mongoose');

mongoose.Promise = global.Promise;

const {
    PORT,
    DATABASE_URL
} = require('./config');
const {
    BlogPost
} = require('./models')

const app = express();
app.use(bodyParser.json());

// const blogRouter = require('./blog-postsRouter');
//
// app.use(express.static('public'));
//
// app.use('/blog-post', blogRouter);


app.get('/posts', (req, res) => {
    BlogPost
        .find()
        .limit(10)
        .exec() // returns a Promise
        .then(blogposts => {
            res.json({
                blogposts: blogposts.map(
                    (blogpost) => blogpost.apiRepr())
            });
        })
        .catch(
            err => {
                console.error(err);
                res.status(500).json({
                    message: 'Internal server error'
                });
            });
});

app.get('/hello', (req, res) => {
    res.json({
        hello: "world"
    });
})

app.get('/posts/:id', (req, res) => {
    BlogPost
        .findById(req.params.id)
        .exec()
        .then(blogpost => res.json(blogpost.apiRepr()))
        .catch(err => {
            console.log(err);
            res.status(500).json({
                message: 'Internal server error'
            })
        });
});


app.post('/posts', (req, res) => {
    const requiredFields = ['author', 'title', 'publishDate']
    for (let i = 0; i < requiredFields.length; i++) {
        const field = requiredFields[i];
        if (!(field in req.body)) {
            const message = `Missing \`${field}\` in request body`
            console.error(message);
            return res.status(400).send(message);
        }
    }

    BlogPost
        .create({
            title: req.body.title,
            content: req.body.content,
            author: req.body.author,
            publishDate: req.body.publishDate
        })
        .then(
            blogpost => res.status(201).json(blogpost.apiRepr()))
        .catch(err => {
            console.error(err);
            res.status(500).json({
                message: 'Internal server error'
            });
        });
});

app.put ('/posts/:id', (req, res) => {
  if (!(req.params.id && req.body.id && req.params.id === req.body.id)) {
    const message = (
      `Request path id (${req.params.id}) and request body id ` +
      `(${req.body.id}) must match`);
    console.error(message);
    res.status(400).json({message: message});
  }
  const toUpdate = {};
  const updatedateableFields = ['author', 'title', 'publishDate', 'content'];

  updatedateableFields.forEach(field => {
    if(field in req.body){
      toUpdate[field] = req.body[field];
    }
  });
  BlogPost
  .findByIdAndUpdate(req.params.id, {$set: toUpdate})
  .exec()
  .then(blogpost => res.status(204).end())
  .catch(err => res.status(500).json({
    message: 'Internal server error'
  }))
})


app.delete('/posts/:id', (req, res) => {
  BlogPost
  .findByIdAndRemove(req.params.id)
  .exec()
  .then(blogpost => res.status(204).end())
  .catch(err => res.status(500).json({
    message: 'Internal server error'
  }))
})

// app.listen(process.env.PORT || 8080, () => {
//   console.log(`Your app is listening on port ${process.env.PORT || 8080}`);
// });

let server;

function runServer(databaseUrl = DATABASE_URL, port = PORT) {

    return new Promise((resolve, reject) => {
        mongoose.connect(databaseUrl, err => {
            if (err) {
                return reject(err);
            }
            server = app.listen(port, () => {
                    console.log(`Your app is listening on port ${port}`);
                    resolve();
                })
                .on('error', err => {
                    mongoose.disconnect();
                    reject(err);
                });
        });
    });
}

function closeServer() {
    return mongoose.disconnect().then(() => {
        return new Promise((resolve, reject) => {
            console.log('Closing server');
            server.close(err => {
                if (err) {
                    return reject(err);
                }
                resolve();
            });
        });
    });
}

if (require.main === module) {
    runServer().catch(err => console.error(err));
};

module.exports = {
    app,
    runServer,
    closeServer
};
