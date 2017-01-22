var express = require("express");
var bodyParser = require('body-parser');
var crypto = require('crypto');
var multer = require('multer');
var app = express();

var storage = multer.diskStorage({
    destination: function (req, file, callback) {
        callback(null, './uploads');
    },
    filename: function (req, file, callback) {

        var fileModel = new fileManagerModel({
            original_name: file.originalname,
            isBlocked: false
        });

        fileModel.save(function (err) {
            if (err) {

            } else {
                storage.file_Id = fileModel.fileId;
                callback(null, file.originalname);

            }
        })


    }
});
var upload = multer({storage: storage}).single('userPhoto');
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
var mongoose = require('mongoose');
var autoIncrement = require('mongoose-auto-increment');

mongoose.connect("mongodb://localhost/final_project");
var db = mongoose.connection;
autoIncrement.initialize(db);

var martyrSchema = new mongoose.Schema({
    name: String,
    age: Number,
    id: Number,
    birthday: Number,
    martyrdomDate: Number,
    avatarId: Number,
    testament: String,
    operationId: Number,
    bio: String,
    isReleased: Boolean

})
var activitySchema = new mongoose.Schema({

    body: String,
    actId: Number,
    userId: Number,
    photoId: Number,
    likeCount: Number,
    commentCount: Number,
    releaseDate: Number,
    isBlocked: Boolean,
    martyrId: Number


})
var commentSchema = new mongoose.Schema({

    body: String,
    actId: Number,
    userId: Number,
    releaseDate: Number,
    isBlocked: Boolean,
    commentId: Number


})
var userSchema = new mongoose.Schema({
    username: String,
    password: String,
    token: String,
    userId: Number,
    avatarId: Number,
    email: String,
    isBlocked: Boolean

})
var fileManagerSchema = new mongoose.Schema({
    original_name: String,
    fileId: Number,
    isBlocked: Boolean

})

var martyrModel = mongoose.model("martyrs", martyrSchema);
var activityModel = mongoose.model("acivities", activitySchema);
var commentModel = mongoose.model("comments", commentSchema);
var userModel = mongoose.model("users", userSchema);
var fileManagerModel = mongoose.model("files", fileManagerSchema);

martyrSchema.plugin(autoIncrement.plugin, {model: 'martyrs', field: 'id'})
activitySchema.plugin(autoIncrement.plugin, {model: 'activities', field: 'actId'})
commentSchema.plugin(autoIncrement.plugin, {model: 'comments', field: 'commentId'})
userSchema.plugin(autoIncrement.plugin, {model: 'users', field: 'userId'})
fileManagerSchema.plugin(autoIncrement.plugin, {model: 'files', field: 'fileId'})

var hemmat = new martyrModel({
    name: "hemmati3",
    age: 33,
    birthday: 0,
    martyrdomDate: 1255325555,
    avatarId: 1,
    testament: "سلام .توصیه میکنم بچه ی خوبی باشین",
    operationId: 1,
    bio: "همت شهرضایی",
    isReleased: false
})
var errorList = {

    10001: "userIsExist",
    10002: "passwordWrong!!!",
    10003: "username or password are invalid!!!",
    10004: "user not found!!"


}

app.use("/", function (req, res, next) {
    //  res.send(resultMsg(errorList[10001]));

    next();
});
db.on('error', function () {
    console.log("oh oh .. :( ")
});
db.once("connected", function () {
    console.log("MongoDb Umad ! :D");

});


app.post("/martyr/add", function (req, res, next) {

    var martyr = new martyrModel(req.body);
    martyr.isReleased = false;

    martyr.save(function (error) {
        if (error)

            console.log("errorrr :| ");
        else
            res.send(resultMsg(martyr));
    });


})

app.post("/martyr/edit/:id", function (req, res, next) {

    var martyr = new martyrModel(req.body);
    martyr.isReleased = false;

    martyrModel.findOne({id: req.params.id}, function (err, doc) {
        if (!doc) {
            res.status(404).send(resultMsg("error khodri"));
        }
        else {
            doc.update(req.body, function (erro, newDoc) {
                res.send(resultMsg(newDoc));
            })
        }
    });


})

app.get("/martyr/list", function (req, res, next) {
    martyrModel.find({isReleased: false}, function (error, doc) {
        if (error) {

        } else {
            if (!doc) {

            }
            else {
                res.send(resultMsg(doc));
            }
        }
    })
})

app.get("/martyr/:id", function (req, res, next) {
    martyrModel.findOne({isReleased: false, id: req.params.id}, function (error, doc) {
        if (error) {

        } else {
            if (!doc) {

            }
            else {
                res.send(resultMsg(doc));
            }
        }
    })
})

app.post("/membership/user/register", function (req, res, next) {

    var user = new userModel(req.body);
    user.isBlocked = false;
    user.avatarId = 0;
    if (req.body.confirmPass == req.body.password)
        userModel.findOne({username: req.body.username}, function (error, doc) {
            if (error) {

            } else {
                if (!doc) {
                    crypto.randomBytes(16, function (err, buffer) {
                        var token = buffer.toString('hex');
                        user.token = token;

                        user.save(function (error) {
                            if (error)
                                console.log("errorrr :| ");
                            else
                                res.send(resultMsg(user.token, false, 1));
                        });
                    });
                }
                else {
                    res.send(resultMsg(errorList[10001], true, 10001));
                }
            }
        })
    else
        res.send(resultMsg(errorList[10002], true, 10002))


})

app.post("/membership/user/login", function (req, res, next) {

    userModel.findOne({username: req.body.username, password: req.body.password}, function (error, doc) {
        if (error) {

        } else {
            if (!doc) {
                res.send(resultMsg(errorList[10003], true, 10003));

            }
            else {
                crypto.randomBytes(16, function (err, buffer) {
                    var token = buffer.toString('hex');
                    doc.token = token;

                    doc.save(function (error) {
                        if (error)
                            console.log("errorrr :| ");
                        else
                            res.send(resultMsg(token, false, 1));
                    });
                });
            }
        }
    })


})

app.get("/membership/user/:userId", function (req, res, next) {

    userModel.findOne({token: req.headers['authorization']}, function (err, doc) {

        if (err) {
            res.send(resultMsg(err, false, 10004));

        } else {
            if (!doc) {

                res.status(401).send(req.headers['authorization']);

            }
            else {
                userModel.findOne({userId: req.params.userId}, function (error, doc) {
                    if (error) {

                    } else {
                        if (!doc) {
                            res.send(resultMsg(errorList[10004], false, 10004));
                        }
                        else {
                            var d = doc;
                            d.token = null;
                            res.send(resultMsg(d, false, 1));
                        }
                    }
                })
            }
        }

    })


})

app.post('/api/photo', function (req, res) {
    upload(req, res, function (err) {
        if (err) {
            return res.end(err.toString());
        }
        res.send(resultMsg(storage.file_Id));
    });
});


app.post("/activity/add", function (req, res, next) {

    var act = new activityModel(req.body);
    act.isBlocked = false;
    act.likeCount = 0;
    act.commentCount = 0;
    act.releaseDate = new Date().getTime();

    act.save(function (error) {
        if (error)

            console.log("errorrr :| ");
        else
            res.send(resultMsg(act));
    });


})
app.get("/activity/list/:off/:lim", function (req, res, next) {

    var query = activityModel.find({isBlocked: false});
    query.limit(req.params.lim);
    query.skip(req.params.off);
    query.sort({
        releaseDate: -1
    })

    query.exec(function (error, doc) {
        if (error) {

        } else {
            if (!doc) {

            }
            else {
                res.send(resultMsg(doc));
            }
        }
    });


})

app.post("/activity/comment/add/:postId", function (req, res, next) {

    var comment = new commentModel(req.body);
    comment.actId = req.params.postId;
    comment.releaseDate = new Date().getTime();
    comment.isBlocked = false;

    comment.save(function (error) {
        if (error)

            console.log("errorrr :| ");
        else
            res.send(resultMsg(comment));
    });


})
app.listen(8000);
console.log("app running on port 8000");

function resultMsg(input) {
    var msg = {
        message: input,
        error: false
    };
    return msg;
}

function resultMsg(input, error, resCode) {
    var msg = {
        message: input,
        error: error,
        result_number: resCode
    };
    return msg;
}