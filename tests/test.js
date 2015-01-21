// Load a user or create a new one
function loadUser(cb) {
  Slide.User.load(function(next) {
    Slide.User.register("16144408217", function(user) {
      user.persist();
      next(user);
    });
  }, cb);
}

function loadVendor(cb) {
  Slide.Vendor.load(function(next) {
    Slide.Vendor.invite("Admin", function(vendor) {
      vendor.register(function(vendor) {
        vendor.persist();
        next(vendor);
      });
    });
  }, cb);
}

function createVendorForm(vendor, cb) {
  vendor.createForm("Form " + Math.floor(Math.random()*1000), ['first-name'], function(form) {
    console.log("form", form);
  });
}

loadVendor(function(vendor) {
  createVendorForm(vendor, function(form) {
    console.log(form);
  });
});

// Test loadUser
loadUser(function(user) {
  user.getProfile(function(profile) {
    user.patchProfile(profile, function(patch) {
      console.log("patched", patch);
    });
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
      cb(msg);
    });
    actorUserRequest(msg, user);
  });
}

// Run tests
listenUser(['first-name'], function(msg) {
  console.log(msg);
});

