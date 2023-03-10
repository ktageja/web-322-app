const fs = require("fs");

let posts = [];
let categories = [];
const initialize = () => {
  return new Promise((resolve, reject) => {
    fs.readFile("./data/posts.json", (err, data) => {
      if (err) reject("unable to read file");
      posts = JSON.parse(data);
    });
    fs.readFile("./data/categories.json", (err, data) => {
      if (err) reject("unable to read file");
      categories = JSON.parse(data);
    });
    resolve("Initialized successfuly");
  });
};

const getAllPosts = () => {
  return new Promise((resolve, reject) => {
      if (posts.length === 0) {
        reject("No results returned");
      } else {
        resolve(posts);
      }
    });
};

const getPublishedPosts = () => {
  return new Promise((resolve, reject) => {

      const publishedPosts = posts.filter((post) => post.published === true);
      if (publishedPosts.length === 0) {
        reject("No results returned");
      } else {
        resolve(publishedPosts);
      }
    });
};

const getPublishedPostsByCategory = (category) => {
  return new Promise((resolve, reject) => {

      const publishedPosts = posts.filter(
        (post) =>
          post.published === true &&
          parseInt(post.category, 10) === parseInt(category, 10)
      );
      if (publishedPosts.length === 0) {
        reject("No results returned");
      } else {
        resolve(publishedPosts);
      }
    });
};

const getCategories = () => {
  return new Promise((resolve, reject) => {
      if (categories.length === 0) {
        reject("No results returned");
      } else {
        resolve(categories);
      }
    });
};

const addPost = (postData) => {
  return new Promise((resolve, reject) => {
    postData.id = posts.length + 1;
    postData.category = parseInt(postData.category,10);
    if (postData.published === undefined) {
      postData.published = false;
    } else {
      postData.published = true;
    }
    postData.postDate = new Date().toISOString().slice(0, 10);
    posts.push(postData);
    resolve(postData);
  });
};

const getPostsByMinDate = (minDate) => {
  return new Promise((resolve, reject) => {
    const filteredPosts = posts.filter((post) => {
      return new Date(post.postDate) >= new Date(minDate);
    });

    if (filteredPosts.length === 0) {
      reject("no results returned");
    } else {
      resolve(filteredPosts);
    }
  });
};

const getPostsByCategory = (category) => {
  return new Promise((resolve, reject) => {
    const filteredPosts = posts.filter((post) => parseInt(post.category, 10) === parseInt(category, 10));

    if (filteredPosts.length === 0) {
      reject("no results returned");
    } else {
      resolve(filteredPosts);
    }
  });
};

const getPostById = (id) => {
  return new Promise((resolve, reject) => {
    const post = posts.find((post) => post.id === parseInt(id,10));
    if (post) {
      resolve(post);
    } else {
      reject("no result returned");
    }
  });
};

module.exports = {
  posts,
  categories,
  initialize,
  getAllPosts,
  getCategories,
  getPublishedPosts,
  addPost,
  getPostsByCategory,
  getPostsByMinDate,
  getPostById,
  getPublishedPostsByCategory
};
