window.onload = function(){
    console.log("hello world");
    d3.select('p').text("Hello d3 selectors!");
    
    //Test code mostly following tutorials here: https://scrimba.com/g/gd3js
    
    testdata = [40, 52, 63, 54, 35];
    
    d3.select("#chart_test1")
        .selectAll("p")
        .data(testdata)
        .enter()
        .append("p")
        .text(function(d){return d;});
    
    var svg_width = 500, svg_height = 300;
    var bar_width = (svg_width/testdata.length), bar_padding = 5;
    
    var svg = d3.select("#chart_main")
        .attr("width", svg_width)
        .attr("height", svg_height);
    
    var barchart_test = svg.selectAll("rect")
        .data(testdata)
        .enter()
        .append("rect")
        .attr("y", function(d){return svg_height-d;})
        .attr("width", bar_width-bar_padding)
        .attr("height", function(d){return d;})
        .attr("transform", function(d, i){
            //Translation [x, y]
            var translate = [bar_width*i, 0];
            return "translate(" +translate+")";
        });
    
    var labels = svg.selectAll("text")
        .data(testdata)
        .enter()
        .append("text")
        .text(function(d){return d;})
        .attr("x", function(d, i){return (i*bar_width-bar_padding)+((bar_width-bar_padding)/2);})
        .attr("y", function(d){return svg_height-d-5;})
        .attr("fill", "#161ca8");
    
    
};