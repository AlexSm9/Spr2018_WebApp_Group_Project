//-----ADJUSTABLE VALUES-----

var COLOR_PALLATE_URL_STRING = "https://coolors.co/a23b72-67bc8b-f18f01-4f86c6-744fc6"

var MAX_CHART_HEIGHT = 300;
var MIN_CHART_HEIGHT = 100;
var MAX_CHART_WIDTH = 700;
var MIN_CHART_WIDTH = 100;

var CHART_WIDTH_AS_PERCENTAGE_OF_WINDOW = 0.7;
var CHART_HEIGHT_AS_PERCENTAGE_OF_WINDOW = 0.4;


//Testing purposes only
var JSON_TEST_STRING = '{"Question":"What movie night theme should we have?","UUID":"956e9692-5d5f-4cbc-a9a9-0d4ec7cbd4f7","Choices":[{"text":"Vampires","option_id":1,"results":{"count":6}},{"text":"Zombies","option_id":2,"results":{"count":5}},{"text":"Werewolves","option_id":3,"results":{"count":2}},{"text":"Cowboys","option_id":4,"results":{"count":14}}],"Settings":{"randomize_choice_order":true,"time_to_answer_seconds":80},"Meta":{"creation_UNIX_timestamp":1527028876,"reponse_count":27}}';

//---------------------------

//&&&JSON Object Wrapping&&&
function OptionDataWrapper(json_option){
    this.text = json_option["text"];
    this.count = json_option["results"]["count"];
    this.option_id = json_option["option_id"];
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
    
    //Test code mostly following tutorials here: https://scrimba.com/g/gd3js
    
//    testdata = [4, 5, 6, 5, 3];
    
//    d3.select("#chart_test1")
//        .selectAll("p")
//        .data(testdata)
//        .enter()
//        .append("p")
//        .text(function(d){return d;});
    
    /*
    var svg_width_test1 = 500, svg_height_test1 = 300;
    var bar_width_test1 = (svg_width_test1/testdata.length), bar_padding_test1 = 5;
    
    var svg_test1 = d3.select("#chart_test2")
        .attr("width", svg_width_test1)
        .attr("height", svg_height_test1);
    
    var barchart_verticalscale_test1 = d3.scaleLinear()
        .domain([0, d3.max(testdata)])
        .range([0, svg_height_test1]);
    
    var barchart_test_test1 = svg_test1.selectAll("rect")
        .data(testdata)
        .enter()
        .append("rect")
        .attr("y", function(d){return svg_height_test1-barchart_verticalscale_test1(d);})
        .attr("width", bar_width_test1-bar_padding_test1)
        .attr("height", function(d){return barchart_verticalscale_test1(d);})
        .attr("transform", function(d, i){
            //Translation [x, y]
            var translate = [bar_width_test1*i, 0];
            return "translate(" +translate+")";
        });
    
    var labels_test1 = svg_test1.selectAll("text")
        .data(testdata)
        .enter()
        .append("text")
        .text(function(d){return d;})
        .attr("x", function(d, i){return (i*bar_width_test1-bar_padding_test1)+((bar_width_test1-bar_padding_test1)/2);})
        .attr("y", function(d){return svg_height_test1-barchart_verticalscale_test1(d)+20;})
        .attr("fill", "#b7baeb");
    
    */
    
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
    
    var data_bars = chart_main.selectAll("rect")
        .data(CDW.options)
        .enter()
        .append("rect")
        .attr("y", function(option){
            return chart_main_height-chart_main_vertical_scale(option.count);
        })
        .attr("width", chart_main_bar_width-chart_main_bar_padding)
        .attr("height", function(option){
            return chart_main_vertical_scale(option.count);
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
            var bar_half_width = (chart_main_bar_width*0.5)-chart_main_bar_padding;
            return step+bar_half_width;
        })
        .attr("y", function(option, index){
            var element_height = this.getBBox().height;
            
            return chart_main_height-chart_main_vertical_scale(option.count)+element_height;
        })
        .attr("fill", "#000000");
        
    
    
//    var random_circle = chart_main.append("circle")
//        .attr("cx", chart_main_width/2)
//        .attr("cy", chart_main_height/2)
//        .attr("r", 80)
//        .attr("fill", "#7CE8D5");
}