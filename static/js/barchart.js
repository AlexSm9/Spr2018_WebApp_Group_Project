//+++++++++++++++++++++++++++


function draw_bargraph(CDW){
        
    d3.select('h2').text(CDW.question);
    
    var chart_main_width = clamp((CHART_WIDTH_AS_PERCENTAGE_OF_WINDOW*window.outerWidth), MAX_CHART_WIDTH, MIN_CHART_WIDTH);
    var chart_main_height = clamp((CHART_HEIGHT_AS_PERCENTAGE_OF_WINDOW*window.outerWidth), MAX_CHART_HEIGHT, MIN_CHART_HEIGHT);
        
    var chart_main_bar_width = chart_main_width/CDW.options.length;
    var chart_main_bar_padding = Math.max(1, (0.1)*chart_main_bar_width);
    
    var chart_main_vertical_scale = d3.scaleLinear()
        .domain([0, d3.max(CDW.get_option_result_count_array())])
        .range([0, chart_main_height]);
    
    var chart_main = d3.select("#chart_main")
        .attr("width", chart_main_width)
        .attr("height", chart_main_height)
        .style("overflow", "visible");

    
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