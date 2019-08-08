var Utilities = require('../utilities');
var utils = new Utilities();

describe("Cookie Utilities", function () {

  it("should set a cookie", function () {
      // console.log(document.cookie);
      var url = "https://www.crossroads.net?coolparam=testit";
      document = {
          cookie: `redirectUrl=${url};anotherstring=string`
      };
      const result = utils.getCookie("redirectUrl");
      expect(result).toEqual(url);
  });

  it("should delete a cookie", function () {

      // var spy = spyOn(oktaSignInWidget, functionCall);

      // expect(spy).not.toHaveBeenCalled()
  });
});
