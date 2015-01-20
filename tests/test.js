// Load a user or create a new one
function loadUser(cb) {
  Slide.User.load(function(next) {
    Slide.User.register("16144408217", function(user) {
      user.persist();
      next(user);
    });
  }, cb);
}

// Test loadUser
loadUser(function(user) {
  console.log(user);
  user.getProfile(function(profile) {
    console.log(profile);
  });
});

function actorUserRequest(fields, user) {
  new Slide.Actor(location.origin).openRequest(['first-name'], {
    downstream: user.number,
    key: user.publicKey,
    type: 'user'
  }, function(submission) {
    console.log("submission", submission);
  });
}

// Receive notifications for users
function listenUser(msg, cb) {
  loadUser(function(user) {
    user.listen(function(msg) {
      console.log("user notif");
      cb(msg);
    });
    actorUserRequest(msg, user);
  });
}

// Run tests
listenUser(['first-name'], function(msg) {
  console.log(msg);
});

