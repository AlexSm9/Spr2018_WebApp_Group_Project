import json, uuid, datetime

OPTION_COUNT_HARD_LIMIT = 100

class ChartJsonStringObject:

    def __init__(self, barchart_json_string=None):
        if barchart_json_string is None:
            #new object
            self.question = None
            self.uid = str(uuid.uuid4())
            self.settings = {}
            self.meta = {
                'creation_UNIX_timestamp': datetime.datetime.utcnow().strftime('%s'),
                'response_count': 0
            }
            self.choices = {}
        else:
            #initialize from string
            json_chart = json.loads(barchart_json_string)
            self.question = json_chart["Question"]
            self.uid = json_chart["UID"]
            self.settings = json_chart["Settings"]
            self.meta = json_chart["Meta"]
            self.set_choices(json_chart["Choices"])

    def set_question(self, question_string):
        self.question = question_string

    def set_settings(self, settings_dictionary):
        self.settings = settings_dictionary

    def add_choice(self, option, change_count_by_value=None):
        if len(self.choices.keys())>OPTION_COUNT_HARD_LIMIT: return None #limit to not have unreasonably many options, if we want to increase this significantly, we should also correspondingly increase the length of the option_ids since there will be more collisions as the number of avaliable options grow
        if type(option) == str: #code to handle a literal question string passed as argument
            option = self.QuestionOption(option)
        option._generate_option_id()
        while option.option_id in self.choices.keys(): #ensures uniqueness and not overwriting existing options
            option._generate_option_id()
        self.choices[option.option_id] = option
        if change_count_by_value is not None: self._change_option_count(option.option_id, change_count_by_value)
        return option.option_id

    def remove_choice(self, option_id, also_change_response_count=True):
        if option_id in self.choices.keys():
            if also_change_response_count: self._change_response_count(self.choices[option_id].count)
            del(self.choices[option_id])
            return True
        return False

    def remove_all_choices(self):
        self.choices = {}
        self._set_response_count(0)

    def reset_choice_counts(self, option_id, also_change_response_count=True):
        try:
            if also_change_response_count: self._change_response_count(-1 * self.choices[option_id].count)
            self.choices[option_id]._set_count(0)
        except(KeyError):
            print("Attempted to reset choice counts for option with id {0}. No option with specified id was found.".format(option_id))

    def reset_all_choice_counts(self, also_change_response_count=True):
        for key in self.choices.keys():
            self.choices[key]._set_count(0)
        if also_change_response_count: self._set_response_count(0)

    def set_choices(self, choice_json):
        self.choices = {}
        for choice in choice_json:
            self.choices[choice["option_id"]] = self.QuestionOption(choice)

    def __str__(self):
        return json.dumps(self._wrap_self_as_json_object())

    def __deepcopy__(self, memodict={}):
        cjso_copy = ChartJsonStringObject(self.get_json_string())
        memodict[id(cjso_copy)] = cjso_copy
        return cjso_copy

    def get_json_string(self):
        return json.dumps(self._wrap_self_as_json_object())

    def get_json(self):
        return self._wrap_self_as_json_object()

    def get_choices_list_with_results(self):
        return list(self.choices[key]._wrap_self_as_json_object() for key in self.choices.keys())

    def get_choices_list(self):
        return list(self.choices[key]._wrap_self_as_simplified_json_object() for key in self.choices.keys())
    
    def increment_option_count(self, option_id, increment_amount=1, also_change_response_count=True):
        self._change_option_count(option_id, increment_amount, also_change_response_count)

    def decrement_option_count(self, option_id, decrement_amount=1, also_change_response_count=True):
        self._change_option_count(option_id, (-1 * decrement_amount), also_change_response_count)

    def get_response_count(self):
        return self.meta["response_count"]

    def _wrap_self_as_json_object(self):
        return {
            "Question": self.question,
            "UID": self.uid,
            "Settings": self.settings,
            "Meta": self.meta,
            "Choices": self.get_choices_list()
        }

    def _change_option_count(self, option_id, count_change, also_change_response_count=True):
        try:
            self.choices[option_id].change_count(count_change)
            if also_change_response_count: self._change_response_count(count_change)
        except(KeyError):
            print("Attempted to change option with id {0} by count {1}. No option with specified id was found.".format(option_id, count_change))

    def _set_option_count(self, option_id, new_count):
        try:
            self.choices[option_id]._set_count(new_count)
        except(KeyError):
            print("Attempted to set option with id {0} to count {1}. No option with specified id was found.".format(option_id, new_count))

    def _change_response_count(self, count_change):
        self.meta["response_count"] += count_change

    def _set_response_count(self, new_count):
        self.meta["response_count"] = new_count



    class QuestionOption:

        def __init__(self, option=None):
            if option is None:
                #new object
                self.text = None
                self.option_id = None
                self.count = 0
            elif type(option) is str:
                # new object with text included
                self.text = option
                self.option_id = None
                self.count = 0
            else:
                # initialize from json object
                self.text = option["text"]
                self.option_id = option["option_id"]
                self.count = option["results"]["count"]

        def change_count(self, count_change):
            self.count += count_change

        def set_text(self, new_text):
            self.text = new_text

        # https://stackoverflow.com/questions/13484726/safe-enough-8-character-short-unique-random-string
        def _generate_option_id(self, id_length=7):
            self.option_id = str(uuid.uuid4())[:id_length] #normally truncating uuids is a bad idea, but since we chack for collisions, should be ok

        def _set_count(self, new_count):
            self.count = new_count

        def _wrap_self_as_json_object(self):
            results = {
                "count": self.count
            }
            return {
                "text": self.text,
                "results": results,
                "option_id": self.option_id
            }
        
        def _wrap_self_as_simplified_json_object(self):
            return {
                "text": self.text,
                "option_id": self.option_id
            }


def main():
    print("Testing 'chart_json_string_editor'")
    test_json_string = '{"Question": "What movie night theme should we have?", "UID": "956e9692-5d5f-4cbc-a9a9-0d4ec7cbd4f7", "Settings": {"randomize_choice_order": true, "time_to_answer_seconds": 80}, "Meta": {"creation_UNIX_timestamp": 1527028876, "reponse_count": 27}, "Choices": [{"text": "Vampires", "results": {"count": 16}, "option_id": 1}, {"text": "Zombies and other Undead", "results": {"count": 15}, "option_id": 2}, {"text": "Werewolves", "results": {"count": 1}, "option_id": 3}, {"text": "Cowboys", "results": {"count": 26}, "option_id": 4}]}'
    cjso = ChartJsonStringObject(test_json_string)
    print("Question:", cjso.question)
    print("UID:", cjso.uid)
    print("Settings:", cjso.settings)
    print("Meta:", cjso.meta)
    print("Choices:", cjso.get_choices_list())
    print("String representation:", cjso)
    print("INPUT == OUTPUT?:", test_json_string == cjso.get_json_string())
    print("-"*40)
    print("EDITING EXISTING")
    cjso2 = cjso.__deepcopy__()
    cjso2.set_question("What movie night theme for next week?")
    cjso2.reset_all_choice_counts() #reset all counts to 0
    cjso2.increment_option_count(1, 5) #set Vampires to 5
    print("After editing:", cjso2)
    print("-"*40)
    print("CREATING NEW")
    cjso3 = ChartJsonStringObject()
    cjso3.set_question("Is there life in the solar system outside of Earth?")
    no_option_id = cjso3.add_choice("No.", 5)
    cjso3.add_choice("Yes, on one of the planets.")
    cjso3.add_choice("Yes, on one of the moons or another celestial body.", 3)
    print("After creation:", cjso3)
    cjso3.remove_choice(no_option_id)
    print("After removing 'no' option:", cjso3)
    print("-"*40)
    print("Testing complete")

if __name__ == "__main__":
    main()