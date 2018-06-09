Here is an example page that uses JavaScript (cookie.js) to enable JSON strings as site cookies.
(written by Alexander Mayben)

Functions of importance:
-----
get_cookie():
- Determines the content of a cookie and displays said content when page is loaded

from_cookie(string):
- When called, returns the value stored in the cookie at the key equal to the given string

find_cookie():
- Called by other functions that access cookie content
- Finds the string contained in a given cookie

write_string(string):
- Writes the given string (which should be a JSON string) as a cookie to the site

add_to_cookie(first arg string, second arg anything):
- Adds a new field to current cookie; first arg is the key and second arg is the value
- If a cookie doesn't exist, writes a new one as a JSON object (given key/value is the only field)
- If a cookie does exist, adds the key/value pair as a new field of the cookie
- (If the cookie exists and the field exists already, the new field simply overwrites the old one)

store_cookie(anything):
- Modify this according to what is being stored
- Call add_to_cookie any number of times for every field that needs to be instantiated
- Once the function terminates, the website stores a cookie with every necessary field

delete_cookie():
- Doesn't actually delete the cookie, but changes the flag that tells the page that a cookie exists
- This is done so that the cookie can then be overwritten when an answer is changed