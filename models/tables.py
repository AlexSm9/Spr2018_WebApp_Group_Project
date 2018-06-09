# Define your tables below (or better in another model file) for example
#
# >>> db.define_table('mytable', Field('myfield', 'string'))
#
# Fields can be 'string','text','password','integer','double','boolean'
#       'date','time','datetime','blob','upload', 'reference TABLENAME'
# There is an implicit 'id integer autoincrement' field
# Consult manual for more options, validators, etc.

import datetime

def get_email_if_logged_in():
    return auth.user.email if auth.user is not None else None

def get_unix_time_timestamp():
    return int(datetime.datetime.utcnow().strftime('%s'))

db.define_table('polls',
               Field('creation_unix_timestamp', "double"),
               Field('last_update', "double", update=get_unix_time_timestamp()),
               Field('admin_id', "string"),
               Field('poll_json', "string"),
               Field('creator', default=get_email_if_logged_in()),
               Field('protected', "boolean", default=False),
               Field('accepting_answers', "boolean", default=False)
               )

db.polls.creation_unix_timestamp.writeable = False
db.polls.admin_id.writeable = False
db.polls.id.writeable = False

# after defining tables, uncomment below to enable auditing
# auth.enable_record_versioning(db)
