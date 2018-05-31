# Here go your api methods.

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