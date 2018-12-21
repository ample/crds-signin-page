// import * as Utils from "../utils"

describe("Cookie Utilities", function() {
    
    it("should set a cookie", function() {
        // console.log(document.cookie);
        Utils = require('../utils.js');
        var url = "https://www.crossroads.net?coolparam=testit";
        document = {
            cookie: `redirect_url=${url};anotherstring=string`
        };
        Utils.getCookie("test");
        // const result = Utils.getCookie("redirect_url");

        var url = "https://www.crossroads.net?coolparam=testit&anotherparam=fake";
        expect(result).toEqual();
      });

    it("should delete a cookie", function() {
        
        // var spy = spyOn(oktaSignInWidget, functionCall);
        
        // expect(spy).not.toHaveBeenCalled()
    });
});