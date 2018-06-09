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


def get_poll_by_admin_id(admin_id):
    return db(db.polls.admin_id == admin_id).select().first()

def get_poll_by_poll_id(poll_id):
    return db(db.polls.id == poll_id).select().first()

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
    insert_result = db_insert_new_poll(cjso)
    if insert_result[0] is None:
        raise ValueError("Insert id was not properly returned.")
    return response.json(dict(
        poll_id = insert_result[0],
        admin_id = insert_result[1]
    ))


def creator_get_poll_record():
    request_admin_id = request.vars.admin_id
    if request_admin_id is None:
        return response.json(dict(
            error="id_not_provided"
        ))
    record = get_poll_by_admin_id(request_admin_id)
    if record is None:
        #No Poll With This ID Exists
        return response.json(dict(
            error="poll_not_found"
        ))
    return record

        
def delete_poll():
    request_admin_id = request.vars.admin_id
    print("DELETE POLL WITH ADMIN ID:", request_admin_id)
    try:
        record = get_poll_by_admin_id(request_admin_id)
        poll_id_confirmation = record.id
        record.delete_record()
        return response.json(dict(
            deleted_poll_id=poll_id_confirmation
        ))
    except AttributeError:
        return response.json(dict(
            deleted_poll_id=None
        ))
    
def toggle_accepting_answers():
    request_admin_id = request.vars.admin_id
    record = get_poll_by_admin_id(request_admin_id)
    try:
        record.accepting_answers = not record.accepting_answers
        record.update_record()
        return response.json(dict(
            is_poll_accpeting_answers=record.accepting_answers
        ))
    except AttributeError:
        return response.json(dict(
            is_poll_accpeting_answers=None
        ))
    
def db_insert_new_poll(cjso):
    poll_admin_id = cjso.uid
    date = int(cjso.meta["creation_UNIX_timestamp"])
    print("DATE:", date, "POLL_ADMIN_ID:", poll_admin_id)
    insert_id = db.polls.insert(creation_unix_timestamp=date, admin_id=poll_admin_id, poll_json=cjso.get_json_string())
    return(insert_id, poll_admin_id)




#------ Answerer Functions ------

def answerer_get_poll_record():
    request_poll_id = request.vars.poll_id
    if request_poll_id is None:
        return response.json(dict(
            error="id_not_provided"
        ))
    record = get_poll_by_poll_id(request_poll_id)
    if record is None:
        #No Poll With This ID Exists
        return response.json(dict(
            error="poll_not_found"
        ))
    if record.accepting_answers is False:
        return response.json(dict(
            error="poll_closed"
        ))
    return record

def answerer_get_poll_cjso(record):
    cjso = ChartJsonStringObject(record.poll_json)
    
def answerer_save_poll_cjso(record, cjso):
    try:
        record.poll_json = cjso.get_json_string()
        record.update_record()
        return response.json(dict(
            updated_poll_id=record.id
        ))
    except AttributeError:
        return response.json(dict(
            error="update_failed"
        ))

def get_choices():
    cjso = answerer_get_poll_cjso(answerer_get_poll_record())
    return response.json(dict(
        choice=cjso.get_choices_list()
    ))

def send_choice():
    option_id = request.vars.option_id
    if not option_id:
        return response.json(dict(
            error="missing_option_id"
        ))
    record = answerer_get_poll_record()
    cjso = answerer_get_poll_cjso(record)
    cjso.increment_option_count(option_id)
    answerer_save_poll_cjso(record, cjso)

def undo_choice():
    option_id = request.vars.option_id
    if not option_id:
        return response.json(dict(
            error="missing_option_id"
        ))
    record = answerer_get_poll_record()
    cjso = answerer_get_poll_cjso(record)
    cjso.decrement_option_count(option_id)
    answerer_save_poll_cjso(record, cjso)