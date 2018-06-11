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





class SubFunctionError:
    
    def __init__(self, error_string):
        self.errorstring = error_string
        
    def get_error_dict(self):
        return dict(
            error=self.errorstring
        )
        

#$$AccessFunctions$$
def get_poll_by_admin_id(admin_id):
    return db(db.polls.admin_id == admin_id).select().first()

def get_poll_by_poll_id(poll_id):
    return db(db.polls.id == poll_id).select().first()

def get_poll_cjso(record):
    return ChartJsonStringObject(record.poll_json)

def save_poll_cjso(record, cjso):
    try:
        record.poll_json = cjso.get_json_string()
        record.update_record()
        return dict(
            updated_poll_id=record.id
        )
    except AttributeError:
        return SubFunctionError("record_update_failed")
#$$END_AccessFunctions$$

#++CreatePoll++
def poll_choices_to_list():
    choice_list = json.loads(request.vars.choices)
    print(choice_list)
    return choice_list

def create_poll():
    print("Recieved Question Text:")
    print(request.vars.question)
    print("Recieved Choices:")
    choices = poll_choices_to_list()
    print(choices)
    cjso = ChartJsonStringObject()
    cjso.set_question(request.vars.question)
    for choice in choices:
        cjso.add_choice(str(choice["text"]), None, choice["sort_index"])
    print(cjso)
    insert_result = db_insert_new_poll(cjso)
    if insert_result[0] is None:
        raise ValueError("Insert id was not properly returned.")
    return response.json(dict(
        poll_id = insert_result[0],
        admin_id = insert_result[1]
    ))

def db_insert_new_poll(cjso):
    poll_admin_id = cjso.uid
    date = int(cjso.meta["creation_UNIX_timestamp"])
    print("DATE:", date, "POLL_ADMIN_ID:", poll_admin_id)
    insert_id = db.polls.insert(creation_unix_timestamp=date, admin_id=poll_admin_id, poll_json=cjso.get_json_string())
    return(insert_id, poll_admin_id)
#++END_CreatePoll++

def creator_get_poll_record():
    request_admin_id = request.vars.admin_id
    if request_admin_id is None:
        return SubFunctionError("id_not_provided")
    record = get_poll_by_admin_id(request_admin_id)
    if record is None:
        #No Poll With This ID Exists
        return SubFunctionError("poll_not_found")
    return record

def answerer_get_poll_record():
    request_poll_id = request.vars.poll_id
    if request_poll_id is None:
        return SubFunctionError("id_not_provided")
    record = get_poll_by_poll_id(request_poll_id)
    if record is None:
        #No Poll With This ID Exists
        return SubFunctionError("poll_not_found")
    return record

        
def delete_poll():
    try:
        record = creator_get_poll_record()
        poll_id_confirmation = record.id
        record.delete_record()
        print("Successfully deleted poll with id:", poll_id_confirmation)
        return response.json(dict(
            deleted_poll_id=poll_id_confirmation
        ))
    except AttributeError:
        return response.json(dict(
            error="failed_delete_poll"
        ))
    
def toggle_accepting_answers():
    try:
        record = creator_get_poll_record()
        toggle_to = request.vars.toggle_to
        record.accepting_answers = toggle_to if type(toggle_to) is bool else not record.accepting_answers
        record.update_record()
        print("Successfully toggled accepting_answers of poll with id:", record.id)
        print("The new value of 'accepting_answers' is", record.accepting_answers)
        return response.json(dict(
            is_poll_accpeting_answers=record.accepting_answers
        ))
    except AttributeError:
        return response.json(dict(
            error="failed_accepting_toggle"
        ))
    
def get_poll():
    try:
        record = creator_get_poll_record()
        if record.__class__ is SubFunctionError: return response.json(record.get_error_dict())
        cjso = get_poll_cjso(record)
        return response.json(dict(
            poll_json = cjso.get_json_string(),
            room_id = record.id
        ))
    except AttributeError:
        return response.json(dict(
            error="failed_get_poll"
        ))

def answerer_get_poll_results():
    try:
        record = answerer_get_poll_record(True)
        if record.__class__ is SubFunctionError: return response.json(record.get_error_dict())
        cjso = get_poll_cjso(record)
        return response.json(dict(
            poll_json = cjso.get_public_json_string()
        ))
    except AttributeError:
        return response.json(dict(
            error="failed_get_poll"
        ))
        
def edit_poll():
    record = creator_get_poll_record()
    if record.__class__ is SubFunctionError: return response.json(record.get_error_dict())
    edited_json_string = request.vars.poll_json
    if not edited_json_string:
        return response.json(dict(
            error="no_edit_parameter"
        ))
    try:
        cjso = ChartJsonStringObject(edited_json_string)
    except:
        return response.json(dict(
            error="malformed_json_string"
        ))
    save_result = save_poll_cjso(record, cjso)
    if save_result.__class__ is SubFunctionError:
        return response.json(save_result.get_error_dict())
    else:
        return response.json(save_result)


@auth.requires_login()        
def reassign_poll_creator():
    given_polls_dict = json.loads(request.vars.saved_user_polls_array)
    if not given_polls_dict:
        return response.json(dict(
            error="empty_request_variable"
        ))
    if auth.user is None:
        return response.json(dict(
            error="not_signed_in"
        ))
    user_email = auth.user.email
    try:
        admin_id_array = given_polls_dict["admin_id_array"]
    except:
        print("!IMPORTANT PRINT FOLLOWS:")
        print(given_polls_dict)
        admin_id_array = json.dumps(str(given_polls_dict))["admin_id_array"]
        print("!IMPORTANT PRINT2 FOLLOWS:")
        print(admin_id_array)
    altered_admin_ids_can_be_removed_from_cookie = []
    for admin_id in admin_id_array:
        found_poll = get_poll_by_admin_id(admin_id)
        if not found_poll:
            print("Poll with id:", admin_id, "not found.")
            altered_admin_ids_can_be_removed_from_cookie.append(admin_id)
            continue
        found_poll.creator = user_email
        try:
            found_poll.update_record()
            altered_admin_ids_can_be_removed_from_cookie.append(admin_id)
        except(AttributeError):
            continue
    return response.json(dict(
        can_be_removed_from_cookie = altered_admin_ids_can_be_removed_from_cookie
    ))

@auth.requires_login()
def get_logged_in_user_polls():
    if auth.user is None:
        return response.json(dict(
            error="not_signed_in"
        ))
    user_poll_records = db(db.polls.creator == auth.user.email).select(orderby=~db.polls.id)
    return response.json(dict(
        user_polls=list(record.poll_json for record in user_poll_records)
    ))


#------ Answerer Functions ------

def answerer_get_poll_record(ignore_closed=False):
    request_poll_id = request.vars.poll_id
    if request_poll_id is None:
        return SubFunctionError("id_not_provided")
    record = get_poll_by_poll_id(request_poll_id)
    print("answerer get poll record:", request_poll_id)
    print(record)
    if record is None:
        #No Poll With This ID Exists
        return SubFunctionError("poll_not_found")
    if record.accepting_answers is False and not ignore_closed:
        poll_response_count = get_poll_cjso(record).get_response_count()
        if poll_response_count <= 0:
            return SubFunctionError("poll_not_open")
        else:
            return SubFunctionError("poll_closed")
    return record


    


def get_choices():
    record = answerer_get_poll_record()
    if record.__class__ is SubFunctionError: return response.json(record.get_error_dict())
    cjso = get_poll_cjso(record)
    return response.json(dict(
        choices=cjso.get_choices_list_no_results(),
        question=cjso.question
    ))

def send_choice():
    option_id = request.vars.option_id
    if not option_id:
        return response.json(dict(
            error="missing_option_id"
        ))
    record = answerer_get_poll_record()
    if record.__class__ is SubFunctionError: return response.json(record.get_error_dict())
    cjso = get_poll_cjso(record)
    cjso.increment_option_count(option_id)
    save_poll_cjso(record, cjso)

def undo_choice():
    option_id = request.vars.option_id
    if not option_id:
        return response.json(dict(
            error="missing_option_id"
        ))
    record = answerer_get_poll_record()
    if record.__class__ is SubFunctionError: return response.json(record.get_error_dict())
    cjso = get_poll_cjso(record)
    cjso.decrement_option_count(option_id)
    save_poll_cjso(record, cjso)