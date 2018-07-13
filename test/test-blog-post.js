'use strict';

const chai = require('chai');
const chaiHttp = require('chai-http');
const faker = require('faker');
const mongoose = require('mongoose');

// this makes the expect syntax available throughout
// this module
const expect = chai.expect;

const {BlogPost} = require('../models');
const {app, runServer, closeServer} = require('../server');
const {TEST_DATABASE_URL} = require('../config');

chai.use(chaiHttp);

function seedBlogData() {
  console.info('seeding blog post data');
  const seedData = [];
  for (let i = 1; i <= 10; i++) {
    seedData.push({
      author: {
        firstName: faker.name.firstName(),
        lastName: faker.name.lastName()
      },
      title: faker.lorem.sentence(),
      content: faker.lorem.text()
    });
  }

function tearDownDb() {
  console.warn('Deleting database');
  return mongoose.connection.dropDatabase();
}  

  // this will return a promise
  return BlogPost.insertMany(seedData);
}

  before(function () {
    return runServer(TEST_DATABASE_URL);
  });

  beforeEach(function () {
    return seedBlogPostData();
  });

  afterEach(function () {
    // tear down database so we ensure no state from this test
    // effects any coming after.
    return tearDownDb();
  });

  after(function () {
    return closeServer();
  });

  describe('GET endpoint', function() {

  	it('should return all existing blog post', function() {

  	 let res;
      return chai.request(app)
      	.get('/posts')
      	.then(function(_res) {
      		res = _res;
      		expect(res).to.have.status(200);
      		expect(res.body).to.have.lengthOf.at.least(1);
      		return BlogPost.count();
      	})	
      	.then(function(count) {
          expect(res.body).to.have.lengthOf(count);
        });
    });

    it('should return blog posts with the right fields', function() {
    	let resPosts;
    	return chai.request(app);
    		.get('/posts')
    		.then(function(res) {
    			expect(res).to.have.status(200);
    			expect(res).to.be.json;
    			expect(res.body).to.be.a('array');
          		expect(res.body).to.have.lengthOf.at.least(1);

          		res.body.forEach(function (post) {
            post.should.be.a('object');
            post.should.include.keys('id', 'title', 'content', 'author', 'created');
          });
    	resPosts = res.body[0];
          return BlogPost.findById(resPosts.id);
        })
        .then(post => {
        	expect(resPosts.title).to.equal(post.title); 
        	expect(resPosts.content).to.equal(post.content);
        	expect(resPosts.author).to.equal(post.authorName)

        });
    });
  });

  describe('POST endpoint', function() {
  	// strategy: make a POST request with data,
    // then prove that the restaurant we get back has
    // right keys, and that `id` is there (which means
    // the data was inserted into db)
    it('should add a new blog post', function() {
    	const newPost = {
        	title: faker.lorem.sentence(),
        	author: {
          	firstName: faker.name.firstName(),
          	lastName: faker.name.lastName(),
        },
        	content: faker.lorem.text()
      };
      return chai.request(app)
        .post('/posts')
        .send(newPost)
        .then(function(res) {
          expect(res).to.have.status(201);
          expect(res).to.be.json;
          expect(res.body).to.be.a('object');
          expect(res.body).to.include.keys(
          	'id', 'title', 'content', 'author', 'created');
          expect(res.body.title).to.equal(newPost.title);
          expect(res.body.id).to.not.be.null;
          expect(res.body.content).to.equal(newPost.content);
          expect(res.body.author).to.equal(`${newPost.author.firstName} ${newPost.author.lastName}`);
           return BlogPost.findById(res.body.id);
        })	
        .then(function(restaurant) {
          expect(restaurant.name).to.equal(newRestaurant.name);
          expect(restaurant.cuisine).to.equal(newRestaurant.cuisine);
          expect(restaurant.borough).to.equal(newRestaurant.borough);
          expect(restaurant.grade).to.equal(mostRecentGrade);
          expect(restaurant.address.building).to.equal(newRestaurant.address.building);
          expect(restaurant.address.street).to.equal(newRestaurant.address.street);
          expect(restaurant.address.zipcode).to.equal(newRestaurant.address.zipcode);	
        });
    });

  });

   describe('PUT endpoint', function () {
   	 // strategy:
     //  1. Get an existing post from db
     //  2. Make a PUT request to update that post
     //  4. Prove post in db is correctly updated
     it('should update fields you send over', function () {
     	const updateData = {
     		title: 'foo foo foo',
     		content: 'bar bart bar',
     		author: ''
     	};
     return BlogPost
     	.findOne();	
     	.then(function(post) {
     		updateData.id = post.id;

     	 return chai.request(app)
     	 	.put(`/post/${post.id}`)	
     	 	.send(updateData);
     	 })
     	.then(function(res) {
          expect(res).to.have.status(204);

          return BlogPost.findById(updateData.id);
         })
        .then(function(postst) {
         	expect(post.title).to.equal(updateData.title);
        	expect(post.content).to.equal(updateData.content);
        	expect(post.author.firstName).to.equal(updateData.author.firstName);
        	expect(post.author.lastName).to.equal(updateData.author.lastName);
        });
    });
  }); 
  describe('DELETE endpoint', function() {
    // strategy:
    //  1. get a blog post
    //  2. make a DELETE request for that post's id
    //  3. assert that response has right status code
    //  4. prove that blog post with the id doesn't exist in db anymore
    it('delete a blog post by id', function() {

      let post;

      return BlogPost
        .findOne()
        .then(function(post) {
           post = _post;
          return chai.request(app).delete(`/posts/${post.id}`);
        })
        .then(function(res) {
           res.should.have.status(204);
          return BlogPost.findById(post.id);
        })
        .then(function(_post) {
          expect(_post).to.be.null;
        });
    });
  });

