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

function userFormPost(form, user, data) {
  new Slide.Conversation({
    type: 'form', upstream: form.id
  }, {
    type: 'user', downstream: user.number,
    key: user.publicKey
  }, function(conversation) {
    // Respond?
    conversation.submit(user.uuid, data);
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
  Slide.presentFormsModal(forms, user, function(vendorForm, form, profile, patch) {
    form.remove();
    /*user.patchProfile(Slide.User.serializeProfile(data), function(patch) {
      console.log("patch", patch);
    });*/
    var data = Slide.User.serializeProfile(profile);
    console.log(data);
    userFormPost(vendorForm, user, data);
  });
}

function configurePage(isVendor) {
  loadVendor(function(vendor) {
    if( !isVendor ) {
      loadUser(function(user) {
        user.getProfile(function(profile) {
          user.profile = Slide.User.deserializeProfile(profile);
          console.log("profile", profile);
          // TODO: vendor user should be persisted
          Slide.VendorUser.load(function(next) {
            Slide.VendorUser.createRelationship(user, vendor, function(vendorUser) {
              next(vendorUser);
            });
          }, function(vendorUser) {
            vendorUser.loadVendorForms(function(forms) {
              forms = Object.keys(forms).map(function(name) {
                var form = forms[name];
                form.name = name;
                return form;
              });
              user.uuid = vendorUser.uuid;
              console.log("sym", user.symmetricKey);
              showForms(forms, user);
              // userFormPost(form, user);
            });
          });
        });
      });
    } else {
      function formSelection(form) {
        Slide.VendorForm.get(vendor, form.id, function(fields) {
          for( var uuid in fields.responses ) {
            new Slide.VendorUser(uuid).load(function(vendorUser) {
              var key = vendorUser.getVendorKey(vendor.privateKey);
              var data = Slide.crypto.AES.decryptData(fields.responses[uuid], key);
              console.log(data);
            });
          }
        });
      }
      function createForm() {
        createVendorForm("New"+Math.floor(Math.random()*1000), vendor, function(form) {
          Slide.insertVendorForm(form, vendor, formSelection)
        }, formSelection);
      }
      vendor.loadForms(function(forms) {
        Slide.presentVendorForms(forms, vendor, createForm, formSelection);
      });
    }
  });
}

