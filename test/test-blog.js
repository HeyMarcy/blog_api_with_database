const chai = require('chai');
const chaiHttp = require('chai-http');

const {app, runServer, closeServer} = require('../server');

const should = chai.should();

chai.use(chaiHttp);

describe('Blog Endpoint Tests', function() {

  before(function() {
    return runServer();
  });

  after(function() {
    return closeServer();
  });

  it('should list users blog posts on GET request', function() {
    return chai.request(app)
      .get('/blog-post')
      .then(function(res) {
        res.should.have.status(200);
        res.should.be.json;
        res.body[0].should.include.keys('author');
      });
  });

// 'title', 'content', 'author', 'publishDate'

  it('should post a blog post', function() {
    const newPost = {title: 'Harry Potter', content: 'text', author: 'JK Rowling', publishDate: 1997}
    return chai.request(app)
      .post('/blog-post')
      .send(newPost)
      .then(function(res) {
        res.should.have.status(201);
        res.should.be.json;
        res.body.should.include.keys('id', 'title', 'content', 'author', 'publishDate');
    });
  });

  

});
