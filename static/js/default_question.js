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

    //     self.delete_poll = function(question_id) {
    //     $.post(del_question_url,
    //     {
    //         question_id: question_id
    //     },
    //     function () {
    //         var index = null;
    //         for (var i = 0; i < self.vue.question.length; i++) {
    //             if (self.vue.posts[i].id === post_id) {
    //                 // If I set this to i, it won't work, as the if below will
    //                 // return false for items in first position.
    //                 index = i + 1; //just in case it's the zero'th element
    //                 break;
    //             }
    //         }
    //         if (index) {
    //             // delete the element associated with the id
    //             self.vue.posts.splice(index - 1, 1);
    //             //if posts length is less that 11 has_more is false
    //             if (self.vue.posts.length < 11) {
    //                 self.vue.has_more = false;
    //             }
    //         }
    //     }
    //     )
    // };

    // Complete as needed.
    self.vue = new Vue({
        el: "#vue-div",
        delimiters: ['${', '}'],
        unsafeDelimiters: ['!{', '}'],
        data: {
            question: null,
            answers: [],
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
