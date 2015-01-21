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

function createVendorForm(name, vendor, cb) {
  vendor.createForm(name, ['first-name'], function(form) {
    cb(form);
  });
}

function actorUserRequest(fields, user) {
  new Slide.Actor(location.origin).openRequest(['first-name'], {
    downstream: user.number,
    key: user.publicKey,
    type: 'user'
  });
}

function userFormPost(form, user) {
  new Slide.Conversation({
    type: 'form', upstream: form.id
  }, {
    type: 'user', downstream: user.number,
    key: user.publicKey
  }, function(conversation) {
    conversation.submit(user.uuid, {
      'first-name': 'Matt'
    });
  }, user.symmetricKey);
}

function listenUser(msg, cb) {
  loadUser(function(user) {
    user.listen(function(msg) {
      cb(msg);
    });
    actorUserRequest(msg, user);
  });
}

listenUser(['first-name'], function(msg) {
  console.log("assert", ['first-name'], msg);
});

loadUser(function(user) {
  user.getProfile(function(profile) {
    user.patchProfile(profile, function(patch) {
      console.log("assert", profile, patch);
    });
  });
});

loadVendor(function(vendor) {
  var name = "Form" + Math.floor(Math.random()*1e8);
  createVendorForm(name, vendor, function(form) {
    console.log("assert", name, form.name);
  });
  loadUser(function(user) {
    Slide.VendorUser.createRelationship(user, vendor, function(vendorUser) {
      vendorUser.loadVendorForms(function(forms) {
        var form = forms[name];
        console.log("assert", form.fields, ['first-name']);
        user.uuid = vendorUser.uuid;
        userFormPost(form, user);
      });
    });
  });
});

var userData = {
  "slide.life:name": [
    {
      "slide.life:name.first": "John",
      "slide.life:name.middle": "",
      "slide.life:name.last": "Doe"
    }
  ],
  "slide.life:bank.card": [
    {
      "slide.life:bank.card.number": "4351435253459",
      "slide.life:bank.card.security-code": "439",
      "slide.life:bank.card.start-date": "01- 03",
      "slide.life:bank.card.expiry-date": "11-01"
    },
    {
      "slide.life:bank.card.number": "12312312123",
      "slide.life:bank.card.security-code": "151",
      "slide.life:bank.card.start-date": "05-11",
      "slide.life:bank.card.expiry-date": "12-15"
    }
  ],
  "slide.life:drivers-license.number": [
    "137583281",
    "452"
  ],
  "slide.life:drivers-license.start-date": [
    "01-13"
  ],
  "slide.life:drivers-license.expiry-date": [
    "12-15",
    "11-18"
  ]
};

Slide.presentModalFormFromIdentifiers(['bank.card', 'name','drivers-license'], userData);
