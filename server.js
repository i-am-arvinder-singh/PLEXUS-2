const express = require('express')
const logger = require('morgan')
const bodyParser = require('body-parser')
const firebase = require('firebase/app')
const alert = require('alert-node')

// Your web app's Firebase configuration
var firebaseConfig = {
    apiKey: "AIzaSyCxYNf9DxOMuVset5qGImWgdG6CLMdEJ40",
    authDomain: "cloud-trek.firebaseapp.com",
    databaseURL: "https://cloud-trek.firebaseio.com",
    projectId: "cloud-trek",
    storageBucket: "cloud-trek.appspot.com",
    messagingSenderId: "1003051514632",
    appId: "1:1003051514632:web:e81016218688226c8f8abd",
    measurementId: "G-YZH2YN6G02"
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);
require("firebase/auth");
require("firebase/firestore");
require("firebase/database");
// firebase.analytics();

// var db = firebase.database()

const app = express()

app.set('view engine', 'ejs')
app.set('views',__dirname+'/views')

//For static files such as CSS and images
app.use(express.static('views'))

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: false}))

app.use(logger('dev'))

app.get('/',(req,res)=>{

    firebase.auth().onAuthStateChanged(function(user) {
        if (user) {
            
            res.redirect('/dashboard')
          // User is signed in.
        } else {
            res.render('index.ejs')
          // No user is signed in.
        }
      });
      

    
})

app.get('/dashboard',(req,res)=>{

    var heroRef = firebase.database().ref().child("heros");

    heroRef.once('value',function(snapshot){
        // console.log(snapshot.val())
        var data = snapshot.val()
        if(!data){
            data = {}
        }
        res.render('dashboard.ejs',{heroFields:snapshot.val(), idCheck:currentUser.uid})
    })

})

app.post('/signIn',(req,res)=>{
    // console.log(req);
    var email = req.body.inputEmail
    var password = req.body.inputPassword
    signIn(email, password,res);
})

app.post('/createForm',(req,res)=>{
    // console.log(req);
    var email = req.body.inputEmail
    var password = req.body.inputPassword
    createNewUser(email, password,res);
})

app.post('/deleteHero',(req,res)=>{
    // console.log(req);
    var heroID = req.body.heroID
    console.log(heroID)
    console.log('------------')
    console.log(currentUser)
    // firebase.database().ref("heros/" + heroID).remove();
    // firebase.database().ref("users/" + currentUser.uid + "/heros/" + heroID).remove();
    res.redirect('/dashboard')
})

function addHeroToDatabase(h,res) {
    firebase.database().ref('heros/' + h.id).set(h)
    firebase.database().ref('users/' + currentUser.uid + '/heros/' + h.id).set(h)
    alert('Data Saved!')
    res.redirect('/dashboard')
}

app.post('/newHeroSubmitButton',(req,res)=>{
    var hero = {
        id: req.body.inputHeroName + Date.now(),
        owner: currentUser.uid,
        name: req.body.inputHeroName,
        feel: req.body.feel,
        age: req.body.age
    }

    console.log(hero)
    
    addHeroToDatabase(hero,res);

    
})


function createNewUser(email, password,res) {
    firebase.auth().createUserWithEmailAndPassword(email, password)
    .then(()=>{
        alert('Account Created!')
        res.redirect('/dashboard')
    })
    
    .catch(function (error) {
        // Handle Errors here.
        var errorCode = error.code;
        var errorMessage = error.message;
        console.log(errorMessage);

    });



}

app.post('/home',(req,res)=>{
        // console.log("We are here!");
        firebase.auth().signOut()
            .then(function () {
                // Sign-out successful.
                alert('SignOut Successful!')
                console.log("SignOut Successful!");
                res.redirect('/');
            })
            .catch(function (error) {
                // An error happened
                console.log(error);
            });
})

function writeUserData(user) {
    firebase.database().ref('users/' + user.uid).set({
        email: user.email
    });
}

firebase.auth().onAuthStateChanged(function (user) {
    if (user) {
        // User is signed in.
        var email = user.email;
        currentUser = user;
        writeUserData(user);
        console.log(currentUser.email + " has logged in");

    } else {
        // User is signed out.
        // ...
    }
});

function signIn(email, password,res) {
    firebase.auth().signInWithEmailAndPassword(email, password)
    .then(function(){
        res.redirect('/')
    })
    
    .catch(function (error) {
        // Handle Errors here.
        var errorCode = error.code;
        var errorMessage = error.message;
        console.log(errorMessage);
        alert('Please check your Username and Password')
        // res.send("<html><script>alert('Please check your Username and Password!')</script></html>")
        res.redirect('/');
    });
}

var port = process.env.PORT || 8080

app.listen(port,()=>{
    console.log('Server is running on port '+port)
})