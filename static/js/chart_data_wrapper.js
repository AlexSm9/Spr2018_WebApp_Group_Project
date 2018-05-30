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
ChartDataWrapper.prototype.get_option_text_array = function(size_limit=-1){
    var result_text_array = [];
    for(var i = 0; i<this.options.length; i++){
        if(size_limit>=0){
            result_text_array.push(limit_text_length(this.options[i].text, size_limit));

        }else{
            result_text_array.push(this.options[i].text);
        }
    }
    return result_text_array;
};

//&&&&&&&&&&&&&&&&&&&&&&&&&&&