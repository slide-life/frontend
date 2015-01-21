$(document).ready(function () {
  var container = $('.slide-form');
  Slide.Form.createFromIdentifiers(container,
                                   ['slide.life:bank.card', 'slide.life:name'],
                                   function (form) {
                                     form.build({
                                       'slide.life:bank.card': [ {
                                         'slide.life:bank.card.start-date': '05/14',
                                         'slide.life:bank.card.expiry-date': '08/17',
                                         'slide.life:bank.card.number': '1111111111111111',
                                         'slide.life:bank.card.security-code': '111'
                                       } ],
                                       'slide.life:name': [ {
                                         'slide.life:name.first': 'Test',
                                         'slide.life:name.last': 'Test'
                                       }, {
                                         'slide.life:name.first': 'Test2',
                                         'slide.life:name.last': 'Test2'
                                       } ]
                                     }, { onSubmit: function () {
                                       console.log(form.serialize());
                                     } });

                                     $(window).trigger('resize');
                                   });
});
