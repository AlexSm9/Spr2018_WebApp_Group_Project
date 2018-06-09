// This is the js for the default/index.html view.

var app = function() {

    var self = {};

    Vue.config.silent = false; // show all warnings

    /*
    // Extends an array
    self.extend = function(a, b) {
        for (var i = 0; i < b.length; i++) {
            a.push(b[i]);
        }
    };

    // Enumerates an array
    var enumerate = function(v) { var k=0; return v.map(function(e) {e._idx = k++;});};
    */

    //uuid generation method (from https://stackoverflow.com/questions/105034/create-guid-uuid-in-javascript)
    //not final uuid method
    self.uuidv4 = function () {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    };

    //determines the content of a cookie, if one exists
    //displays on page refresh
    self.get_cookie = function () {
        var result = self.find_cookie();
        if (result != "") {
            var obj = JSON.parse(result);
            self.vue.question = obj.question;
            self.vue.UID = obj.UID;
            self.vue.answer = obj.answer;
            self.vue.is_cookie = true;
        }
    };

    //similar to get_cookie, but only returns the associated value from the JSON object, given a key
    //key must be in the form of a string
    self.from_cookie = function (key) {
        var result = self.find_cookie();
        if (result != "") {
            var obj = JSON.parse(result);
            return obj[key];
        }
        return null;
    };

    //returns content of stored cookie (JSON string)
    //from https://www.w3schools.com/js/js_cookies.asp
    self.find_cookie = function () {
        var name = "data=";
        var decodedCookie = decodeURIComponent(document.cookie);
        var ca = decodedCookie.split(';');
        for(var i = 0; i <ca.length; i++) {
            var c = ca[i];
            while (c.charAt(0) == ' ') {
                c = c.substring(1);
            }
            if (c.indexOf(name) == 0) {
                return c.substring(name.length, c.length);
            }
        }
        return "";
    };

    //once a question is answered, this stores the question's result
    //eventually may also store an AJAX function that sends the cookie's data to the database
    //base code from https://www.w3schools.com/js/js_cookies.asp
    //note: not all fields are included from the example of our actual project JSON
    self.store_cookie = function (ans) {
        //generate UID
        var uid = self.uuidv4();
        //put everything we need into a normal JS object
        var my_obj = {
            question: "Do you prefer A or B?",
            //currently UID is only static (hard-coded)
            UID: uid,
            answer: ans
        };
        //turn that object into a JSON string
        var my_JSON = JSON.stringify(my_obj);
        var d = new Date();
        //7 = number of days until cookie expires (can be changed as necessary)
        d.setTime(d.getTime() + ((7)*24*60*60*1000));
        expires = 'expires=' + d.toUTCString();
        document.cookie = "data=" + my_JSON + ";" + expires + ";path=/";
        self.vue.is_cookie = true;
        self.vue.question = "Do you prefer A or B?";
        self.vue.UID = uid;
        self.vue.answer = ans;
    };



    //this doesn't actually delete the cookie, but it displays the page so that another answer can be made
    //when that new answer is made, the cookie will be overwritten
    self.delete_cookie = function () {
        self.vue.is_cookie = false;
        self.vue.answer = null;
    };

    self.vue = new Vue({
        el: "#vue-div",
        delimiters: ['${', '}'],
        unsafeDelimiters: ['!{', '}'],
        data: {
            question: null,
            UID: null,
            answer: null,
            is_cookie: false
        },
        methods: {
            find_cookie: self.find_cookie,
            from_cookie: self.from_cookie,
            store_cookie: self.store_cookie,
            //add_to_cookie: self.add_to_cookie,
            delete_cookie: self.delete_cookie
        }
    });

    self.get_cookie();
    $("#vue-div").show();

    return self;
};

var APP = null;

// This will make everything accessible from the js console;
// for instance, self.x above would be accessible as APP.x
jQuery(function(){APP = app();});

