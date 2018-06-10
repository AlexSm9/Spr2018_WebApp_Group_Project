//@@@QR Test Code@@@

TEST_QR_VALUE = "http://www.example.com"

var QRCODE_WIDTH_AS_PERCENTAGE_OF_WINDOW = 0.4;
var qrcode = new QRCode("room_QR", {
    text: TEST_QR_VALUE,
    width: QRCODE_WIDTH_AS_PERCENTAGE_OF_WINDOW*window.outerWidth,
    height: QRCODE_WIDTH_AS_PERCENTAGE_OF_WINDOW*window.outerWidth
});



//-//-//-//-//-//-//-//-//-//-//-//-//-//-//-//-//-//-//-//-//
//Vue Code and page handling.
//-//-//-//-//-//-//-//-//-//-//-//-//-//-//-//-//-//-//-//-//


//&&&
//Poll Creation Answer Object: For creating poll otpions only.
function PollCreationAnswerObject(text){
    this.text = text;
}
PollCreationAnswerObject.prototype.constructor = PollCreationAnswerObject;
PollCreationAnswerObject.prototype.to_JSON = function(optional_index=null){
    if(optional_index !== null){
        return {
            text: this.text,
            sort_index: optional_index,
        }
    }
    return {
        text: this.text
    };
};
PollCreationAnswerObject.prototype.to_JSON_string = function(optional_index=null){
    return JSON.stringify(this.to_JSON(optional_index))
};

//&&&


var app = function() {

    var self = {};

    Vue.config.silent = false; // show all warnings

    //############## HELPER FUNCTIONS ###############
    
    // Extends an array
    self.extend = function(a, b) {
        for (var i = 0; i < b.length; i++) {
            a.push(b[i]);
        }
    };

    // Enumerates an array.
    var enumerate = function(v) {
        var k=0;
        return v.map(function(e) {e._idx = k++;});
    };
    
    function determine_starting_page(){
        var r_id = get_room_id_parameter(window.location.href)
        if(r_id==null){
            var existing_id = get_active_poll_administration_id_from_cookie();
//            if(existing_id != null){
//                if(verify_admin_key_and_retrieve_data(existing_id)){
//                    return "poll_admin";
//                }
//            }
//            return "poll_create";
            if(existing_id == null){
                return "poll_create";
            }else{
                //this is done on a callback, so return null as page target
                verify_admin_key_and_retrieve_data(existing_id);
                return null;
            }
        }else{
            self.vue.room_id = r_id;
//            if(is_answered_poll_id_from_localstorage(r_id)){
//                return "poll_answer_confirmed";
//            }else{
//                return "poll_answer";
//            }
            handle_answer_cookie_to_determine_start_page(r_id);
            return null;
        }
    }
    
    function get_room_id_parameter(url_string){
        var pattern = /(?:\?id=)(\d*)/g;
        var match = pattern.exec(url_string);
        return match == null? null: match[1];
    }
    
    function get_active_poll_administration_id_from_cookie(){
        //retrieve active administration id from cookie
        console.log("Retrieved room admin id:", self.from_cookie("current_room_admin_id"));
        return self.from_cookie("current_room_admin_id");
    }
    
//    function save_active_poll_administration_id_to_cookie(){
//        //retrieve active administration id from cookie
//    }
    
    function verify_admin_key_and_retrieve_data(existing_id){
        //send a post request to server asking if ID exists.
        //TODO: IMPLEMENT
        console.log("existing_id", existing_id);
        parameters = {
            admin_id: existing_id
        }
        $.post(get_poll_admin_api_url,
            parameters,
            function(data){
                console.log("IN verify_admin_key_and_retrieve_data, DATA:", data);
                //callback
                if(data.poll_json){
                    var CDW = new ChartDataWrapper(data.poll_json);
                    self.vue.poll_data_admin_data_object = CDW;
                    self.vue.admin_id = CDW.UID;
                    self.vue.room_id = data.room_id;
                    self.handle_page_change("poll_admin");
                }else{
                    self.handle_page_change("poll_create");
                }
            }
        )
        
       // self.vue.admin_id = existing_id;
        return false;
    }
    
    function handle_answer_cookie_to_determine_start_page(r_id){
        //TODO: IMPLEMENT
        var option_data = self.from_cookie(r_id);
        console.log("getting choice from cookie:", r_id, option_data)
        if(option_data == null){
            self.handle_page_change("poll_answer");
        }else{
            self.vue.chosen_poll_choice = JSON.parse(option_data);
            self.handle_page_change("poll_answer_confirmed");
        }
    }
    
    self.handle_page_change = function(page_string){
//        $("#visualization_div").hide()
        self.vue.page = page_string;
        if(page_string == "poll_create"){
            //do stuff
        } 
        else if(page_string == "poll_admin"){
            qrcode.clear();
            var str_url = window.location.href + "?id=" + self.vue.room_id;
            qrcode.makeCode(str_url);
            $("#visualization_div").show()
            callbackfunction = function(){
                console.log("retrievedjsondata", self.vue.poll_data_admin_data_object)
                draw_bargraph(self.vue.poll_data_admin_data_object.to_JSON_string()); 
            }
            self.get_poll(callbackfunction);

        }
        else if(page_string == "poll_answer"){
            self.get_poll_choices();
        }
        else if(page_string == "poll_answer_confirmed"){
        
        }
        else if(page_string == "admin_key_invalid"){
                  
        }
        else if(page_string == "poll_closed"){
                  
        }
        else if(page_string == "view_results"){
            
        }
        else if(page_string == "view_results_admin"){
            
        }
        else{
            throw EvalError("Unknown page string:", page_string)
            self.vue.page = "error_page"
        }
    };
    
    
    function process_error(data){
        if(data.error != null){
            console.log("Encountered API Error:", data.error);
            return true;
        }
        return false;
    }
    
    //############ END HELPER FUNCTIONS #############

    
    //****************** API CALLS ******************
            
    self.get_poll_choices = function(){
        var parameters = {
            poll_id: self.vue.room_id
        };
        $.post(get_poll_choices_api_url,
            parameters,
            function(data){
                //callback
                console.log("IN get_poll_choices_api_url, DATA:", data);
                if(process_error(data)){return;}
                self.vue.poll_answer_choices = data.choices;
            }
        );
    };
    
    self.send_choice = function(choice){
        var parameters = {
            option_id: choice.option_id,
            poll_id: self.vue.room_id
        };
        $.post(send_choice_api_url,
            parameters,
            function(data){
                //callback
                console.log("IN send_choice, DATA:", data);
                self.handle_page_change("poll_answer_confirmed");
                self.vue.chosen_poll_choice = choice;
                self.add_to_cookie(self.vue.room_id, JSON.stringify(choice))
            }
        );
    };
    
    self.undo_choice = function(choice){
        var parameters = {
            option_id: choice.option_id,
            poll_id: self.vue.room_id
        };
        $.post(undo_choice_api_url,
            parameters,
            function(data){
                //callback
                console.log("IN undo_choice, DATA:", data);
                self.handle_page_change("poll_answer");
                self.vue.chosen_poll_choice = null;
                self.delete_cookie_key(self.vue.room_id);
            }
        );
    };
    
    
    //poll creator function
    
    self.create_new_poll = function(){
        choices = [];
        for(var i = 0; i<self.vue.poll_create_choices.length; i++){
            choices.push(self.vue.poll_create_choices[i].to_JSON(i));
        }
        var parameters = {
            question: self.vue.poll_create_question,
            choices: JSON.stringify(choices)
        };
        console.log(parameters);
        $.post(create_poll_admin_api_url,
            parameters,
            function(data){
                console.log("IN create_new_poll, DATA:", data);
                //callback
            
                self.vue.admin_id = data.admin_id;
                self.vue.room_id = data.poll_id;
                self.handle_page_change("poll_admin");
                self.add_to_cookie("current_room_admin_id", JSON.stringify(data.admin_id));
            }
        );
    };
    
    self.delete_poll_by_current_admin_id = function(){
        var parameters = {
            admin_id: self.vue.admin_id
        };
        console.log("Parameters in delete poll:", parameters);
        $.post(delete_poll_admin_api_url,
            parameters,
            function(data){
                console.log("IN delete_poll, DATA:", data);
                //callback
                self.vue.admin_id = null;
                self.vue.room_id = null;
                self.delete_cookie_key("current_room_admin_id");
                self.handle_page_change("poll_create");
            }
        );
    };
    
    self.get_poll = function(callbackfunction=null){
        var parameters = {
            admin_id: self.vue.admin_id
        };
        $.post(get_poll_admin_api_url,
            parameters,
            function(data){
                console.log("IN get_poll, DATA:", data);
                //callback
                self.vue.poll_data_admin_data_object = new ChartDataWrapper(data.poll_json);
                console.log("RESULT OF GET_POLL", self.vue.poll_data_admin_data_object);
                if(callbackfunction){
                    callbackfunction();
                }
            }
        );
    };

    self.edit_poll = function(){
        var parameters = {
            //TODO: Some edits
            admin_id: self.vue.admin_id,
            json_poll_string: self.vue.poll_data_admin_data_object.to_JSON_string()
        };
        $.post(edit_poll_admin_api_url,
            parameters,
            function(data){
                console.log("IN edit_poll, DATA:", data);
            }
        );
    };
    
    self.toggle_accepting_answers = function(toggle_to=null){
        var parameters = {
            admin_id: self.vue.admin_id,
            toggle_to: toggle_to
        };
        $.post(toggle_answer_accept_admin_api_url,
            parameters,
            function(data){
                console.log("IN toggle_accepting_answers, DATA:", data);
            }
        );  
    };
    
    //**************** END API CALLS ****************
    
    //%%%%%%%%%%%%%%% OTHER FUNCTIONS %%%%%%%%%%%%%%%
    
    self.add_answer_choice = function(){
        var choice = new PollCreationAnswerObject(self.vue.choice_create_text);
        self.vue.poll_create_choices.push(choice);
        self.vue.choice_create_text = "";
    }
    
    self.remove_choice_from_choice_array = function(index_to_remove){
        self.vue.poll_create_choices.splice(index_to_remove, 1);
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
    
    
    
    //%%%%%%%%%%%%% END OTHER FUNCTIONS %%%%%%%%%%%%%
    
    self.vue = new Vue({
        el: "#vue-div",
        delimiters: ['${', '}'],
        unsafeDelimiters: ['!{', '}'],
        data: {
            room_id: null,
            admin_id: null,
            page: null,
            poll_create_choices: [],
            poll_create_question: "",
            choice_create_text: "",
            poll_answer_choices: [],
            poll_data_admin_data_object: null,
            chosen_poll_choice: null,
            
            is_cookie: false
        },
        methods: {
            some_method: self.somemethod,
            create_add_choice: self.add_answer_choice,
            create_remove_choice: self.remove_choice_from_choice_array,
            create_poll: self.create_new_poll,
            delete_poll: self.delete_poll_by_current_admin_id,
            poll_send_choice: self.send_choice,
            poll_undo_choice: self.undo_choice,
            poll_toggle_open_status: self.toggle_accepting_answers,
            
            from_cookie: self.from_cookie,
            add_to_cookie: self.add_to_cookie,
            delete_cookie: self.delete_cookie
        }

    });
    
    var start_page = determine_starting_page()
    if(start_page!==null){
        self.handle_page_change(start_page);
    }
    console.log("STARTING PAGE", self.vue.page);

    $("#vue-div").show();
    

    return self;
};

var APP = null;

// This will make everything accessible from the js console;
// for instance, self.x above would be accessible as APP.x
jQuery(function(){APP = app();});











//-//-//-//-//-//-//-//-//-//-//-//-//-//-//-//-//-//-//-//-//
//D3 Code and other functions.
//-//-//-//-//-//-//-//-//-//-//-//-//-//-//-//-//-//-//-//-//

//@@@Toggle Button Code
$("#toggle_chart_viz").click(function(){
    //http://api.jquery.com/animate/
    $("#chart_container").animate({
        height: "toggle"
    }, 500, "swing" , function(){
        //animation complete callback
    });
});

$("#toggle_QR_viz").click(function(){
    //http://api.jquery.com/animate/
    $("#room_QR").animate({
        height: "toggle"
    }, 500, "swing" , function(){
        //animation complete callback
    });
});





//@@@Barchart Code@@@

//-----ADJUSTABLE VALUES-----

var COLOR_PALLATE_URL_STRING = "https://coolors.co/a23b72-67bc8b-f18f01-4f86c6-744fc6"

var MAX_CHART_HEIGHT = 300;
var MIN_CHART_HEIGHT = 100;
var MAX_CHART_WIDTH = 700;
var MIN_CHART_WIDTH = 100;

var CHART_WIDTH_AS_PERCENTAGE_OF_WINDOW = 0.7;
var CHART_HEIGHT_AS_PERCENTAGE_OF_WINDOW = 0.4;

var OPTION_LABEL_TEXT_LENGTH_LIMIT = 20;

//Testing purposes only
var JSON_TEST_STRING = '{"Question":"What movie night theme should we have?","UUID":"956e9692-5d5f-4cbc-a9a9-0d4ec7cbd4f7","Choices":[{"text":"Vampires","option_id":1,"results":{"count":16}},{"text":"Zombies and other Undead","option_id":2,"results":{"count":15}},{"text":"Werewolves","option_id":3,"results":{"count":1}},{"text":"Cowboys","option_id":4,"results":{"count":26}}],"Settings":{"randomize_choice_order":true,"time_to_answer_seconds":80},"Meta":{"creation_UNIX_timestamp":1527028876,"reponse_count":27}}';

//---------------------------



//^JS Use Only, Don't Change^

var PALLATE_COLORS = null

//^^^^^^^^^^^^^^^^^^^^^^^^^^^

//++++++Helper Function++++++

function color_array_from_url_string(coolers_url_string){
    //https://www.w3schools.com/jsref/jsref_lastindexof.asp
    coolers_url_string = coolers_url_string.substring(coolers_url_string.lastIndexOf("/"));
    //https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions
    var pattern = /(\w{3,})/g;
    c_array = coolers_url_string.match(pattern);
    for(var i = 0; i<c_array.length; i++){
        c_array[i] = "#"+c_array[i];
    }
    return c_array;
}

function get_bar_color_from_array_index(index){
    //https://coolors.co/a23b72-67bc8b-f18f01-4f86c6-744fc6
    if (!PALLATE_COLORS){
        //PALLATE_COLORS = ["#A23B72", "#67BC8B", "#F18F01", "#4F86C6", "744FC6"]
        PALLATE_COLORS = color_array_from_url_string(COLOR_PALLATE_URL_STRING);
        console.log("PALLATE_COLORS", PALLATE_COLORS)
    }
    return PALLATE_COLORS[index%PALLATE_COLORS.length]
}

function clamp(value, max, min=0){
    return Math.max(min, Math.min(max, value));
}

function limit_text_length(string, max_length, ellipsis_limit=true){
    if(string.length > max_length){
        if(ellipsis_limit){
            return string.substring(0, max_length-3) + "...";
        }else{
            return string.substring(0, max_length);
        }
    }
    return string;
}

//+++++++++++++++++++++++++++

//window.onload = function(){
//    console.log("Page Reloaded");
//    d3.select('p').text("Hello d3 selectors!");
//    
//    draw_bargraph(JSON_TEST_STRING);
//        
//};


function draw_bargraph(json_datastring_test){
    
    CDW = new ChartDataWrapper(json_datastring_test);
    
    d3.select('h2').text(CDW.question);
    
    var chart_main_width = clamp((CHART_WIDTH_AS_PERCENTAGE_OF_WINDOW*window.outerWidth), MAX_CHART_WIDTH, MIN_CHART_WIDTH);
    var chart_main_height = clamp((CHART_HEIGHT_AS_PERCENTAGE_OF_WINDOW*window.outerWidth), MAX_CHART_HEIGHT, MIN_CHART_HEIGHT);
    
    console.log("DIMENSIONS:", chart_main_width, chart_main_height)
    
    var chart_main_bar_width = chart_main_width/CDW.options.length;
    var chart_main_bar_padding = Math.max(1, (0.1)*chart_main_bar_width);
    
    var chart_main_vertical_scale = d3.scaleLinear()
        .domain([0, d3.max(CDW.get_option_result_count_array())])
        .range([0, chart_main_height]);
    
    var chart_main = d3.select("#chart_main")
        .attr("width", chart_main_width)
        .attr("height", chart_main_height);
    
    var bar_pixel_heights = [];
    
    var data_bars = chart_main.selectAll("rect").remove().exit()
        .data(CDW.options)
        .enter()
        .append("rect")
        .attr("y", function(option){
            return chart_main_height-chart_main_vertical_scale(option.count);
        })
        .attr("width", chart_main_bar_width-chart_main_bar_padding)
        .attr("height", function(option){
            var bar_height = chart_main_vertical_scale(option.count)
            option._stored_bar_height_in_pixels = bar_height;
            return bar_height;
        })
        .attr("transform", function(option, index){
           var translate = [chart_main_bar_width*index, 0];
           return "translate(" + translate + ")"
        })
        .attr("fill", function(option, index){
              return get_bar_color_from_array_index(index);
        });
        
    var onbar_values = chart_main.selectAll("text").remove().exit()
        .data(CDW.options)
        .enter()
        .append("text").attr("class", "chart_onbar_value")
        .text(function(option){
            return option.count;
        })
        .attr("x", function(option, index){
            var step = chart_main_bar_width*index;
            var element_centering_adjustment = -1*(0.5*(this.getBBox().width));
            var bar_half_width = ((chart_main_bar_width-chart_main_bar_padding)*0.5);
            return step+bar_half_width+element_centering_adjustment;
        })
        .attr("y", function(option){
            var element_height = this.getBBox().height;
            if(option._stored_bar_height_in_pixels < element_height){
                //If the bar is too small to fit the entire label, push the label up instead.
                //0.5 factor is to push label up about the same amount the other labels are down (change to 1 to see what the difference is)
                return chart_main_height-chart_main_vertical_scale(option.count)-(0.5*element_height);
            }else{
                return chart_main_height-chart_main_vertical_scale(option.count)+element_height;
            }

        })
        .attr("fill", function(option){
            var element_height = this.getBBox().height;
            if(option._stored_bar_height_in_pixels < element_height){
                //the label is on the background
                return "#000000"
            }else{
                //the label is on the bars
                return "#FFFFFF"
            }
            
        });
    
    //****X-axis attempt***
    //https://bl.ocks.org/d3indepth/fabe4d1adbf658c0b73c74d3ea36d465
    //http://bl.ocks.org/d3noob/ccdcb7673cdb3a796e13
    
    var x_axis_scale_band = d3.scaleBand()
        .domain(CDW.get_option_text_array(OPTION_LABEL_TEXT_LENGTH_LIMIT)).range([0, chart_main_width]);
    
    var x_axis_bottom_object = d3.axisBottom(x_axis_scale_band)
    
    chart_main.selectAll("g").remove().exit();
    
    var x_axis = chart_main.append("g")
        .attr("class", "x-axis")
        .attr("transform", function(option, index){
            return "translate(" + -0.5*chart_main_bar_padding +", " + chart_main_height + ")";
        })
        .call(x_axis_bottom_object)
        .selectAll("text")
            .attr("class", "chart_x-axis_labels")
            .style("text-anchor", "end")
            .attr("dx", "-.8em")
            .attr("dy", ".15em")
            .attr("transform", "rotate(-65)")
    
    
    //we can do textwrapping like so:
    //https://bl.ocks.org/mbostock/7555321
}