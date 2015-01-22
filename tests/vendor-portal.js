var registerVendor = function(next) {
  // TODO: show invitation form view
  Slide.Vendor.invite("Admin", function(vendor) {
    vendor.register(function(vendor) {
      console.log(vendor);
      vendor.getProfile(function(profile) {
        console.log(profile);
      });
      vendor.persist();
      next(vendor);
    });
  });
};

Slide.Vendor.load(registerVendor, function(vendor) {

  function formSelection(form) {
    Slide.VendorForm.get(vendor, form.id, function(form) {
      for( var uuid in form.responses ) {
        if( form.responses[uuid] ) {
          new Slide.VendorUser(uuid).load(function(user) {
            var key = Slide.crypto.decryptStringWithPackedKey(user.vendor_key,
              vendor.privateKey);
            var fields = Slide.crypto.AES.decryptData(form.responses[uuid], key);
            // use decrypted fields...
          });
        }
      }
    });
  }

  function createForm() {
    // TODO: show editor
    vendor.createForm("Test", ['bank.card'], function(form) {
      // TODO: rerender table view
    });
  }

  function showForms() {
    vendor.loadForms(function(forms) {
      Slide.presentVendorForms(forms, vendor, createForm, formSelection);
    });
  }

  function getFormResponses(id) {
    Slide.VendorForm.get(vendor, id, function(form) {
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


  showForms();
});


