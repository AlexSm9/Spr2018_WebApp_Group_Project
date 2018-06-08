# Here go your api methods.
import json
from chart_json_string_editor import ChartJsonStringObject

def get_question():
	# retrieve question code from database
	# vue code enabled with two fields, retrieved from database result:
	# question (string)
	# answers (array of strings)
	# current text of those fields is placeholder only
	# may also add "A -", "B -", "C -", etc. to the beginning of all answers for display purposes
	return response.json(dict(
		question="What is your favorite Pokémon?",
		answers=["A - Pikachu", "B - Charizard", "C - Lucario", "D - Greninja", "E - Magikarp"]
		))

def poll_choices_to_list():
    return list(str(json.loads(item)["text"]) for item in request.vars["choices[]"])

def create_poll():
    print("Recieved Question Text:")
    print(request.vars.question)
    print("Recieved Choices:")
    choices = poll_choices_to_list()
    print(choices)
    cjso = ChartJsonStringObject()
    cjso.set_question(request.vars.question)
    for choice_string in choices:
        cjso.add_choice(choice_string)
    print(cjso)
    
