import os
import json
import learning
import base64
from bottle import HTTPResponse, route, request, static_file, run

base = os.path.dirname(os.path.abspath(__file__))
@route('/')
def index():
    return static_file('index.html', root=base)

@route('/check', method='POST')
def check():
    ML = learning.ML()
    filename = '/tmp/test'
    prefix = len('data:image/png;base64,')

    with open(filename, 'wb') as f:
        f.write(base64.b64decode(request.json['image'][prefix:]))

    response = ML.setdata(filename).run()
    response = HTTPResponse(status=200, body=json.dumps(response))
    response.set_header('Content-Type', 'application/json')
    return response

@route('/js/<filepath:path>')
def js(filepath):
    return static_file(filepath, root=os.path.join(base, 'js'))

@route('/img')
def test():
    with open('/tmp/test', 'r') as f:
        response = HTTPResponse(status=200, body=f.read())
        response.set_header('Content-Type', 'image/png')
        return response

run(host='0.0.0.0', port=os.environ.get('PORT', 80), debug=True)
