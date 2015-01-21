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
  vendor.createForm(name, ['bank.card'], function(form) {
    cb(form);
  });
}

function actorUserRequest(fields, user) {
  new Slide.Actor(location.origin).openRequest(['bank.card'], {
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
    // Respond?
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

listenUser(['bank.card'], function(msg) {
  console.log("assert", ['bank.card'], msg);
});

function showModal(userData) {
  Slide.presentModalFormFromIdentifiers(['bank.card', 'name','drivers-license'], userData);
}

/*
loadUser(function(user) {
  user.getProfile(function(profile) {
    // showModal(profile);
    user.patchProfile(serializePatch(profile), function(patch) {
      console.log("assert", profile, patch);
    });
  });
});
*/

function showForms(forms, user) {
  Slide.presentFormsModal(forms, user, function(form, data) {
    form.remove();
    user.patchProfile(Slide.User.serializeProfile(data), function(patch) {
      console.log("patch", patch);
    });
  });
}

loadVendor(function(vendor) {
  var name = "Form" + Math.floor(Math.random()*1e8);
  createVendorForm(name, vendor, function(form) {
    console.log("assert", name, form.name);
  });
  loadUser(function(user) {
    user.getProfile(function(profile) {
      user.profile = Slide.User.deserializeProfile(profile);
      console.log("profile", profile);
      // TODO: vendor user should be persisted
      Slide.VendorUser.createRelationship(user, vendor, function(vendorUser) {
        vendorUser.loadVendorForms(function(forms) {
          var form = forms[name];
          forms = Object.keys(forms).map(function(name) {
            var form = forms[name];
            form.name = name;
            return form;
          });
          console.log("assert", form.fields, ['bank.card']);
          showForms(forms, user);
          user.uuid = vendorUser.uuid;
          userFormPost(form, user);
        });
      });
    });
  });
});

