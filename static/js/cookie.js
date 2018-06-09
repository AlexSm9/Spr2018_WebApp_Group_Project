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
    //not final UUID method
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
            //interchangeable with local variables for whatever fields you want to display in the webpage
            self.vue.question = obj.question;
            self.vue.UID = obj.UID;
            self.vue.answer = obj.answer;
            //this one is somewhat more important, it determines whether or not an answer has been saved for the browser in use
            //false by default
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

    //base code from https://www.w3schools.com/js/js_cookies.asp
    //str should be a JSON string
    self.write_string = function (str) {
        var d = new Date();
        //7 = number of days until cookie expires (can be changed as necessary)
        d.setTime(d.getTime() + ((7)*24*60*60*1000));
        expires = 'expires=' + d.toUTCString();
        document.cookie = "data=" + str + ";" + expires + ";path=/";
        console.log("Wrote cookie with content: " + str);
    };

    //adds a field to the object with "key" as the key and "value" as the content
    //key is a string and value can be anything
    self.add_to_cookie = function (key, value) {
        var result = self.find_cookie();
        if (result == "") {
            var my_JSON = '{"' + key + '":' + value + '}';
            console.log("Writing new cookie.");
            console.log("key: '" + key + "', value: " + value);
            self.write_string(my_JSON);
        } else {
            var obj = JSON.parse(result);
            console.log("Adding to existing cookie: " + result);
            console.log("key: '" + key + "', value: " + value);
            obj[key] = value;
            var my_JSON = JSON.stringify(obj);
            self.write_string(my_JSON);
        }
    };

    //assembles a cookie using any number of add_to_cookie functions
    //modify this according to what you want to store
    self.store_cookie = function (ans) {
        //set local variables
        self.vue.question = "Do you prefer A or B?";
        //again, not final UUID
        self.vue.UID = self.uuidv4();
        self.vue.answer = ans;
        //call add_to_cookie for every field that is being written to the object stored in the cookie
        self.add_to_cookie("question", self.vue.question);
        self.add_to_cookie("UID", self.vue.UID);
        self.add_to_cookie("answer", self.vue.answer);
        /*
        //alternate method
        //put all your important fields into a JS object (my_obj)
        var my_obj = {
            question: "Do you prefer A or B?",
            //currently UID is only static (hard-coded)
            UID: uid,
            answer: ans
        };
        //turn my_obj into a JSON string (my_JSON)
        var my_JSON = JSON.stringify(my_obj);
        //write JSON string to cookie
        self.write_string(my_JSON);
        */
        self.vue.is_cookie = true;
    };

    //this doesn't actually delete the cookie, but it displays the page so that another answer can be made
    //when that new answer is made, the cookie will be overwritten
    self.delete_cookie = function () { self.vue.is_cookie = false; };

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
            add_to_cookie: self.add_to_cookie,
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

