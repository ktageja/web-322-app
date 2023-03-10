/*********************************************************************************
*  WEB322 – Assignment 04
*  I declare that this assignment is my own work in accordance with Seneca  Academic Policy.  No part * 
*  of this assignment has been copied manually or electronically from any other source 
*  (including 3rd party web sites) or distributed to other students.
* 
*  Name: Kalki Tageja 
*  Student ID: 163983216
*  Date: 2023-03-10
*
*  Online (Cyclic) Link: 
*
********************************************************************************/ 



var HTTP_PORT = process.env.PORT || 8080;
var express = require("express");
var blogService = require("./blog-service.js");
const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const streamifier = require("streamifier");
const exphbs = require("express-handlebars");
const stripJs = require('strip-js');

var app = express();
app.use(express.static("public"));
app.engine(
  "hbs",
  exphbs.engine({
    extname: ".hbs",
    helpers: {
      navLink: function (url, options) {
        return (
          "<li" +
          (url == app.locals.activeRoute ? ' class="active" ' : "") +
          '><a href="' +
          url +
          '">' +
          options.fn(this) +
          "</a></li>"
        );
      },
      equal: function (lvalue, rvalue, options) {
        if (arguments.length < 3)
          throw new Error("Handlebars Helper equal needs 2 parameters");
        if (lvalue != rvalue) {
          return options.inverse(this);
        } else {
          return options.fn(this);
        }
      },
      safeHTML: function(context){
        return stripJs(context);
      }
    
    },
  })
);
app.set('view engine', 'hbs');

cloudinary.config({
    cloud_name: 'dof5wvptk',
    api_key: '669218948891845',
    api_secret: 'unsaXGzxe6meJUjQFEaFLl-B4lY',
    secure: true
});

const fileUpload = multer();

app.use(function(req,res,next){
  let route = req.path.substring(1);
  app.locals.activeRoute = "/" + (isNaN(route.split('/')[1]) ? route.replace(/\/(?!.*)/, "") : route.replace(/\/(.*)/, ""));
  app.locals.viewingCategory = req.query.category;
  next();
});


app.get("/", (req, res) => {
  res.redirect("/blog");
});
app.get("/about", (req, res) => {
  res.render("about");
});

app.get("/posts/add", (req, res) => {
  res.render("addPost");
});

app.post("/posts/add", fileUpload.single("featureImage"), (req, res) => {
  if (req.file) {
    let streamUpload = (req) => {
      return new Promise((resolve, reject) => {
        let stream = cloudinary.uploader.upload_stream((error, result) => {
          if (result) {
            resolve(result);
          } else {
            reject(error);
          }
        });

        streamifier.createReadStream(req.file.buffer).pipe(stream);
      });
    };

    async function upload(req) {
      let result = await streamUpload(req);
      return result;
    }

    upload(req).then((uploaded) => {
      processPost(uploaded.url);
    });
  } else {
    processPost("");
  }

  function processPost(imageUrl) {
    req.body.featureImage = imageUrl;
    blogService.addPost(req.body);
    res.redirect("/posts");
  }
});

app.get("/posts", (req, res) => {
  const category = req.query.category;
  const minDate = req.query.minDate;

  if (category) {
    blogService
      .getPostsByCategory(category)
      .then((data) => {
        res.render("posts", {posts: data})
      })
      .catch((err) => {
        res.render("posts", {message: "no results"});
      });
  } else if (minDate) {
    blogService
      .getPostsByMinDate(minDate)
      .then((data) => {
        res.render("posts", {posts: data})
      })
      .catch((err) => {
        res.render("posts", {message: "no results"});
      });
  } else {
    blogService
      .getAllPosts()
      .then((data) => {
        res.render("posts", {posts: data})
      })
      .catch((err) => {
        res.render("posts", {message: "no results"});
      });
  }
});

app.get("/post/:id", (req, res) => {
  const id = req.params.id;
  blogService
    .getPostById(id)
    .then((post) => {
      res.json(post);
    })
    .catch((err) => {
      res.json({ message: err });
    });
});

app.get("/categories", (req, res) => {
  blogService
    .getCategories()
    .then((categories) => {
      res.render("categories", { categories: categories });
    })
    .catch((err) => {
      res.render("categories", { message: "no results" });
    });
});

app.get('/blog', async (req, res) => {

  let viewData = {};
  try{
      let posts = [];


      if(req.query.category){
          posts = await blogService.getPublishedPostsByCategory(req.query.category);
      }else{
          posts = await blogService.getPublishedPosts();
      }
      posts.sort((a,b) => new Date(b.postDate) - new Date(a.postDate));
      let post = posts[0]; 
      viewData.posts = posts;
      viewData.post = post;

  }catch(err){
      viewData.message = "no results";
  }

  try{
      let categories = await blogService.getCategories();
      viewData.categories = categories;
  }catch(err){
      viewData.categoriesMessage = "no results"
  }
  res.render("blog", {data: viewData})

});

app.get('/blog/:id', async (req, res) => {
  let viewData = {};

  try{
      let posts = [];
      if(req.query.category){
          posts = await blogService.getPublishedPostsByCategory(req.query.category);
      }else{
          posts = await blogService.getPublishedPosts();
      }

      posts.sort((a,b) => new Date(b.postDate) - new Date(a.postDate));
      viewData.posts = posts;

  }catch(err){
      viewData.message = "no results";
  }

  try{
      viewData.post = await blogService.getPostById(req.params.id);
  }catch(err){
      viewData.message = "no results"; 
  }

  try{
     let categories = await blogService.getCategories();
      viewData.categories = categories;
  }catch(err){
      viewData.categoriesMessage = "no results"
  }

  res.render("blog", {data: viewData})
});

app.use((req, res) => {
    res.status(404).end('404 PAGE NOT FOUND');
});

blogService
  .initialize()
  .then(() => {
    app.listen(HTTP_PORT, () => {
      console.log("Express http server listening on " + HTTP_PORT);
    });
  })
  .catch((err) => {
    console.log(err);
  });
