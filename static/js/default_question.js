// This is the js for the default/question.html view.
// Write separate js for different html pages as needed. -AM

var app = function() {

    var self = {};

    Vue.config.silent = false; // show all warnings

    // Extends an array
    self.extend = function(a, b) {
        for (var i = 0; i < b.length; i++) {
            a.push(b[i]);
        }
    };

    // Enumerates an array.  Credit to Luca de Alfaro for code.
    //var enumerate = function(v) { var k=0; return v.map(function(e) {e._idx = k++;});};

//    self.get_question = function() {
//        $.getJSON(get_question_url, function(data) {
//            self.vue.question = data.question;
//            self.vue.answers = data.answers;
//        })
//    };
    
    self.get_user_polls = function(){
        
    }
    
            //(%)(%)(%)(%) COOKIE FUNCTIONS (%)(%)(%)(%)
    
    //similar to get_cookie, but only returns the associated value from the JSON object, given a key
    //key must be in the form of a string
    self.from_cookie = function (key) {
        var result = self.find_cookie();
        if (result != "") {
            console.log("cookie result:", result)
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
    
    self.delete_cookie_key = function(key){
        self.add_to_cookie(key, null);
        return;
    }
    
    self.delete_cookie = function () { self.vue.is_cookie = false; };
    
    
        //(%)(%)(%)(%)(%)(%)(%)(%)(%)(%)(%)(%)(%)(%)

    // Complete as needed.
    self.vue = new Vue({
        el: "#vue-div",
        delimiters: ['${', '}'],
        unsafeDelimiters: ['!{', '}'],
        data: {
            is_cookie: false,
            question: null,
            answers: []
        },
        methods: {
            get_user_polls: self.get_user_polls,
            
            from_cookie: self.from_cookie,
            add_to_cookie: self.add_to_cookie,
            delete_cookie: self.delete_cookie
        }
    });

//    self.get_question();
    $("#vue-div").show();

    return self;
};

var APP = null;

// This will make everything accessible from the js console;
// for instance, self.x above would be accessible as APP.x
jQuery(function(){APP = app();});
