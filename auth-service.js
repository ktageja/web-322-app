const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const Schema = mongoose.Schema;
const userSchema = new Schema({
  userName: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  email: { type: String, required: true },
  loginHistory: [
    {
      dateTime: { type: Date },
      userAgent: { type: String },
    },
  ],
});

let User; // to be defined on new connection
const initialize = function () {
  return new Promise(function (resolve, reject) {
    let db = mongoose.createConnection(
      "mongodb+srv://tageja1kalki:4wMqSy9pbNXlZBMc@seneca.jtbj52x.mongodb.net/?retryWrites=true&w=majority"
    );

    db.on("error", (err) => {
      console.log("error in creating connection");
      reject(err);
    });
    db.once("open", () => {
      User = db.model("users", userSchema);
      resolve();
    });
  });
};

function registerUser(userData) {
  return new Promise((resolve, reject) => {
    if (userData.password !== userData.password2) {
      reject("Passwords do not match");
    }

    bcrypt
      .hash(userData.password, 10)
      .then((hash) => {
        userData.password = hash;
        const newUser = new User(userData);
        newUser
          .save()
          .then(() => resolve())
          .catch((err) => {
            if (err.code === 11000) {
              reject("User Name already taken");
            } else {
              reject("There was an error creating the user: " + err);
            }
          });
      })
      .catch((err) => {
        reject("There was an error encrypting the password: " + err);
      });
  });
}

function checkUser(userData) {
  return new Promise((resolve, reject) => {
    User.find({ userName: userData.userName }).then((users) => {
      if (users.length === 0) {
        reject(`Unable to find user: ${userData.userName}`);
      } else (
        bcrypt
          .compare(userData.password, users[0].password)
          .then((result) => {
            if (result === false)
              reject(`Incorrect Password for user: ${userData.userName}`);
            else {
              const loginData = {
                dateTime: new Date().toString(),
                userAgent: userData.userAgent,
              };
              users[0].loginHistory.push(loginData);
              User.updateOne(
                { userName: users[0].userName },
                { $set: { loginHistory: users[0].loginHistory } }
              )
                .then(() => resolve(users[0]))
                .catch((err) =>
                  reject(`There was an error verifying the user: ${err}`)
                );
            }
          })
          .catch(() => reject(`Unable to find user: ${userData.userName}`))
      );
    });
  });
}

module.exports = {
  User,
  userSchema,
  registerUser,
  initialize,
  checkUser,
};
