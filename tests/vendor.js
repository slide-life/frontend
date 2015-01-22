var registerUser = function(next) {
  Slide.User.register("16144408217", function(user) {
    user.persist();
    next(user);
  });
};
var registerVendor = function(next) {
  Slide.Vendor.invite("Admin", function(vendor) {
    vendor.register(function(vendor) {
      vendor.persist();
      next(vendor);
    });
  });
};
Slide.Vendor.load(registerVendor, function(vendor) {
Slide.User.load(registerUser, function(user) {
Slide.VendorUser.load(function(next) {
  Slide.VendorUser.createRelationship(user, vendor, function(vendorUser) {
    var vendorDerivedKey = Slide.crypto.decryptStringWithPackedKey(
      vendorUser.vendor_key, vendor.privateKey);
    var key = vendorUser.generatedKey;
    console.log("assert", key, vendorDerivedKey);

    vendor.createForm("Test", ['bank.card'], function(form) {
      new Slide.Conversation(
        {type: 'form', upstream: form.id },
        {type: 'user', downstream: user.number, key: user.publicKey},
        function(conv) {
          conv.submit(vendorUser.uuid, {'slide/life:bank/card': 'hello'});

          vendor.loadForms(function(forms) {
            if( forms.length ) {
              Slide.VendorForm.get(vendor, forms[0].id, function(form) {
                for( var uuid in form.responses ) {
                  if( form.responses[uuid] ) {
                    console.log("uuid", uuid);
                    new Slide.VendorUser(uuid).load(function(user) {
                      var key = Slide.crypto.decryptStringWithPackedKey(user.vendor_key,
                        vendor.privateKey);

                      var fields = Slide.crypto.AES.decryptData(form.responses[uuid], key);
                      console.log(fields);
                    });
                  }
                }
              });
            }
          });
        }, key);
    });
  });
})
})
})

