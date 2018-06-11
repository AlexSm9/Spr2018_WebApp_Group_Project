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

    self.get_question = function() {
        $.getJSON(get_question_url, function(data) {
            self.vue.question = data.question;
            self.vue.answers = data.answers;
        })
    };

    // Complete as needed.
    self.vue = new Vue({
        el: "#vue-div",
        delimiters: ['${', '}'],
        unsafeDelimiters: ['!{', '}'],
        data: {
            question: null,
            answers: []
        },
        methods: {
            //none yet
        }
    });

    self.get_question();
    $("#vue-div").show();

    return self;
};

var APP = null;

// This will make everything accessible from the js console;
// for instance, self.x above would be accessible as APP.x
jQuery(function(){APP = app();});
