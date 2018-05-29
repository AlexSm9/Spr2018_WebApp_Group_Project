//-----ADJUSTABLE VALUES-----

var COLOR_PALLATE_URL_STRING = "https://coolors.co/a23b72-67bc8b-f18f01-4f86c6-744fc6"

var MAX_CHART_HEIGHT = 300;
var MIN_CHART_HEIGHT = 100;
var MAX_CHART_WIDTH = 700;
var MIN_CHART_WIDTH = 100;

var CHART_WIDTH_AS_PERCENTAGE_OF_WINDOW = 0.7;
var CHART_HEIGHT_AS_PERCENTAGE_OF_WINDOW = 0.4;


//Testing purposes only
var JSON_TEST_STRING = '{"Question":"What movie night theme should we have?","UUID":"956e9692-5d5f-4cbc-a9a9-0d4ec7cbd4f7","Choices":[{"text":"Vampires","option_id":1,"results":{"count":16}},{"text":"Zombies_956e9692-5d5f-4cbc-a9a9-0d4ec7cbd4f7","option_id":2,"results":{"count":15}},{"text":"Werewolves","option_id":3,"results":{"count":1}},{"text":"Cowboys","option_id":4,"results":{"count":26}}],"Settings":{"randomize_choice_order":true,"time_to_answer_seconds":80},"Meta":{"creation_UNIX_timestamp":1527028876,"reponse_count":27}}';

//---------------------------

//&&&JSON Object Wrapping&&&
function OptionDataWrapper(json_option){
    this.text = json_option["text"];
    this.count = json_option["results"]["count"];
    this.option_id = json_option["option_id"];
    this._stored_bar_height_in_pixels = null;
}
OptionDataWrapper.prototype.constructor = OptionDataWrapper;

function ChartDataWrapper(string_data){
    var dataobject = JSON.parse(string_data);
    this.question = dataobject["Question"];
    this.options = [];
    for(var i = 0; i<dataobject["Choices"].length; i++)
        this.options.push(new OptionDataWrapper(dataobject["Choices"][i]));
    this.settings = dataobject["Settings"];
    this.metadata = dataobject["Meta"];
}
ChartDataWrapper.prototype.constructor = ChartDataWrapper;
ChartDataWrapper.prototype.get_option_result_count_array = function(){
    var result_count_array = [];
    for(var i = 0; i<this.options.length; i++){
        result_count_array.push(this.options[i].count);
    }
    return result_count_array;
};
ChartDataWrapper.prototype.get_option_text_array = function(){
    var result_text_array = [];
    for(var i = 0; i<this.options.length; i++){
        result_text_array.push(this.options[i].text);
    }
    return result_text_array;
};

//&&&&&&&&&&&&&&&&&&&&&&&&&&&

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

//+++++++++++++++++++++++++++

window.onload = function(){
    console.log("Page Reloaded");
    d3.select('p').text("Hello d3 selectors!");
    
    draw_bargraph(JSON_TEST_STRING);
        
};


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
    
    var data_bars = chart_main.selectAll("rect")
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
        
    var onbar_values = chart_main.selectAll("text")
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
    //https://bl.ocks.org/mbostock/7555321
    
    var x_axis_scale_band = d3.scaleBand()
        .domain(CDW.get_option_text_array()).range([0, chart_main_width]);
    
    var x_axis_bottom_object = d3.axisBottom(x_axis_scale_band)
    
    var x_axis = chart_main.append("g")
        .attr("class", "x-axis")
        .attr("transform", function(option, index){
            return "translate(0, " + chart_main_height + ")";
        })
        .call(x_axis_bottom_object)
        .selectAll("text")
            .attr("class", "chart_x-axis_labels")
            .style("text-anchor", "end")
            .attr("dx", "-.8em")
            .attr("dy", ".15em")
            .attr("transform", "rotate(-65)")
        
}