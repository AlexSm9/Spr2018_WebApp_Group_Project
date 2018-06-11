//&&&JSON Object Wrapping&&&
function OptionDataWrapper(json_option){
    this.text = json_option["text"];
    this.count = json_option["results"]["count"];
    this.sort_index = json_option["results"]["sort_idx"];
    this.option_id = json_option["option_id"];
    this._stored_bar_height_in_pixels = null;
}
OptionDataWrapper.prototype.constructor = OptionDataWrapper;
OptionDataWrapper.prototype.to_JSON = function(){
    var this_json_results = {
        "count": this.count,
        "sort_idx": this.sort_index
    };
    var this_json_dict = {
        "text": this.text,
        "results": this_json_results,
        "option_id": this.option_id
    };
    return this_json_dict;
};
OptionDataWrapper.prototype.modify_count = function(modification_value){
    this.count += modification_value;
};

function ChartDataWrapper(string_data){
    var dataobject = JSON.parse(string_data);
    this.question = dataobject["Question"];
    //try-catch for public poll results after poll completes
    try{
        this.UID = dataobject["UID"];
    }
    catch(some_error){
        //might be better to change to empty string, we'll see how this works in practice
        this.UID = null;
    }
    this.options = [];
    for(var i = 0; i<dataobject["Choices"].length; i++){
        this.options.push(new OptionDataWrapper(dataobject["Choices"][i]));
    }
    this.settings = dataobject["Settings"];
    this.metadata = dataobject["Meta"];
}
ChartDataWrapper.prototype.constructor = ChartDataWrapper;
ChartDataWrapper.prototype.to_JSON = function(){
    var this_json_dict = {
        "Question": this.question,
        "UID": this.UID,
        "Settings": this.settings,
        "Meta": this.metadata
    };
    var option_array = [];
    for(var i = 0; i<this.options.length; i++){
        option_array.push(this.options[i].to_JSON());
    }
    this_json_dict.Choices = option_array;
    return this_json_dict;
};
ChartDataWrapper.prototype.to_JSON_string = function(){
    return JSON.stringify(this.to_JSON());
};
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
ChartDataWrapper.prototype.modify_option_count = function(option_id, modification_value){
    for(var i = 0; i<this.options.length; i++){
        if(this.options[i].option_id === option_id){
            this.options[i].modify_count(modification_value);
            break;
        }
    }
};

//&&&&&&&&&&&&&&&&&&&&&&&&&&&

////TESTING:
//
////Testing purposes only
//var JSON_TEST_STRING = '{"Question":"What movie night theme should we have?","UID":"956e9692-5d5f-4cbc-a9a9-0d4ec7cbd4f7","Settings":{"randomize_choice_order":true,"time_to_answer_seconds":80},"Meta":{"creation_UNIX_timestamp":1527028876,"reponse_count":27},"Choices":[{"text":"Vampires","results":{"count":16},"option_id":1},{"text":"Zombies and other Undead","results":{"count":15},"option_id":2},{"text":"Werewolves","results":{"count":1},"option_id":3},{"text":"Cowboys","results":{"count":26},"option_id":4}]}';
//console.log("INITIAL_TEST_STRING", JSON_TEST_STRING);
//var TEST_CDW = new ChartDataWrapper(JSON_TEST_STRING);
//console.log(TEST_CDW);
//var result = TEST_CDW.to_JSON_string();
//console.log(result);
//console.log("ARE EQUAL?:", JSON_TEST_STRING==result);
