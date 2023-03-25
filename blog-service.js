const Sequelize = require("sequelize");

// set up sequelize to point to our postgres database
var sequelize = new Sequelize("atuywpyz", "atuywpyz", "aN45kQErKzB77seTjtvSxn4eeKcfIpnT", {
  host: "babar.db.elephantsql.com",
  dialect: "postgres",
  port: 5432,
  dialectOptions: {
    ssl: { rejectUnauthorized: false },
  },
  query: { raw: true },
});

sequelize
  .authenticate()
  .then(function () {
    console.log("Connection has been established successfully.");
  })
  .catch(function (err) {
    console.log("Unable to connect to the database:", err);
  });

var Post = sequelize.define("Post", {
  body: Sequelize.TEXT,
  title: Sequelize.STRING,
  postDate: Sequelize.DATE,
  featureImage: Sequelize.STRING,
  published: Sequelize.BOOLEAN,
});

var Category = sequelize.define("Category", {
  category: Sequelize.STRING,
});

Post.belongsTo(Category, { foreignKey: "category" });

const initialize = () => {
  return new Promise((resolve, reject) => {
    sequelize
      .sync()
      .then(() => {
        // console.log("Successfully synced database.");
        resolve("Successfully synced database.");
      })
      .catch((err) => {
        // console.error("Error syncing database:", err);
        reject("Unable to sync the database.");
      });
  });
};

const getAllPosts = () => {
  return new Promise((resolve, reject) => {
    Post.findAll()
      .then((posts) => {
        if (posts.length > 0) {
          resolve(posts);
        } else {
          reject("No results returned.");
        }
      })
      .catch((err) => {
        reject("No results returned.");
      });
  });
};

const getPublishedPosts = () => {
  return new Promise((resolve, reject) => {
    Post.findAll({ where: { published: true } })
      .then((posts) => {
        if (posts.length > 0) {
          resolve(posts);
        } else {
          reject("No results returned.");
        }
      })
      .catch((err) => {
        reject("No results returned.");
      });
  });
};

const getPublishedPostsByCategory = (category) => {
  return new Promise((resolve, reject) => {
    Post.findAll({ where: {
        published: true,
        category: category,
      }})
      .then((posts) => {
        if (posts.length > 0) {
          resolve(posts);
        } else {
          reject("No results returned.");
        }
      })
      .catch((err) => {
        reject("No results returned.");
      });
  });
};

const getCategories = () => {
  return new Promise((resolve, reject) => {
    Category.findAll()
      .then((categories) => {
        if (categories.length > 0) {
          resolve(categories);
        } else {
          reject("No results returned.");
        }
      })
      .catch((err) => {
        reject("No results returned.");
      });
  });
};

const addPost = (postData) => {


  return new Promise((resolve, reject) => {
    postData.published = postData.published ? true : false;
    postData.category = parseInt(postData.category,10);

    for (let prop in postData) {
      if (postData[prop] === "") {
        postData[prop] = null;
      }
    }

    postData.postDate = new Date();

    Post.create(postData)
      .then(() => {
        resolve();
      })
      .catch((err) => {
        reject("Unable to create post.");
      });
  });
};

const getPostsByMinDate = (minDate) => {
  return new Promise((resolve, reject) => {
    const { gte } = Sequelize.Op;
    Post.findAll({ where: { postDate: { [gte]: new Date(minDate) } } })
      .then((posts) => {
        if (posts.length > 0) {
          resolve(posts);
        } else {
          reject("No results returned.");
        }
      })
      .catch((err) => {
        reject("No results returned.");
      });
  });
};

const getPostsByCategory = (category) => {
  return new Promise((resolve, reject) => {
    Post.findAll({ where: { category: category } })
      .then((posts) => {
        if (posts.length > 0) {
          resolve(posts);
        } else {
          reject("No results returned.");
        }
      })
      .catch((err) => {
        reject("no results returned");
      });
  });
};

const getPostById = (id) => {
  return new Promise((resolve, reject) => {
    Post.findAll({ where: { id: id } })
      .then((posts) => {
        if (posts.length > 0) {
          resolve(posts[0]);
        } else {
          reject("No results returned.");
        }
      })
      .catch((err) => {
        reject("no results returned");
      });
  });
};

const addCategory = (categoryData) => {
  for (let prop in categoryData) {
    if (categoryData[prop] === "") {
      categoryData[prop] = null;
    }
  }

  return new Promise((resolve, reject) => {
    Category.create(categoryData)
      .then(() => {
        resolve("Category added");
      })
      .catch((err) => {
        reject("Unable to create category.");
      });
  });
};

const deleteCategoryById = (id) => {
  return new Promise((resolve, reject) => {
    Category.destroy({ where: { id } })
      .then(() => {
        resolve("Category destroyed.");
      })
      .catch((err) => {
        reject(`Error deleting category: ${err.message}`);
      });
  });
};

const deletePostById = (id) => {
  return new Promise((resolve, reject) => {
    Post.destroy({ where: { id } })
      .then(() => {
        resolve("Post destroyed.");
      })
      .catch((err) => {
        reject(`Error deleting post: ${err.message}`);
      });
  });
};

module.exports = {
  initialize,
  getAllPosts,
  getCategories,
  getPublishedPosts,
  addPost,
  getPostsByCategory,
  getPostsByMinDate,
  getPostById,
  getPublishedPostsByCategory,
  addCategory,
  deleteCategoryById,
  deletePostById
};
