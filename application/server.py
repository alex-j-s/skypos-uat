'''
SERVER.PY

This is the main file for the skyPOS Integration Tool. It initializes the Flask server 
and routes the websocket requests.

AUTHOR: Blaine Rothrock -- blaine@appirio.com

change log
______________________________________
CREATED: 10/27/2015

'''
# library imports
# from gevent import monkey
# monkey.patch_all()

import time, sys, threading
from flask import Flask, render_template, session, request, current_app, send_from_directory
from flask.ext.socketio import SocketIO, emit, disconnect
from base64 import b64encode, b64decode
import eventlet
eventlet.monkey_patch()


# create the application
app = Flask(__name__)
app.debug = True
app.config['SECRET_KEY'] = 'skyPOS1234567890!'
socketio = SocketIO(app,async_mode='eventlet')

# internal imports
from SerialCom import SerialConnection
from USBCom import USBConnection
import RFIDCom

#######################################################################
######## GENERAL COMMANDS #############################################
#######################################################################
'''
INIT Connection
'''
@socketio.on('connect', namespace='/skyPOS')
def connect():
	sys.stdout.write("CONNECT\n")
	sys.stdout.flush()
	
	# for key,value in current_app.usb_connections:
	# 	value.disconnect()
		
	
	# initialize the global app variables for usb and serial connection
	current_app.usb_connections = {}
	current_app.serial_connections = {}
	current_app.usb_hid_connections = {}

	# respond to the client
	emit('response',{ 
		'success': True,
		'message':'connected'
	})

'''
Disconnect

dummy method for disconnecting, does nothing.
'''
@socketio.on('disconnect-request', namespace='/skyPOS')
def disconnect_request():
    session['receive_count'] = session.get('receive_count', 0) + 1
    # emit('disconnect',
    #      {'data': 'Disconnected!', 'count': session['receive_count']})
    disconnect()
	
@socketio.on('disconnect', namespace='/test')
def test_disconnect():
    print('Client disconnected', request.sid)
	
'''
Server status

returns all connected divices and their status
'''
@socketio.on('status',namespace="/skyPOS")
def status():
	
	connections = []
	for name, conn in current_app.usb_connections.iteritems():
		connections.append({'status': conn.is_online(), 'name': name})
		
	for name, conn in current_app.serial_connections.iteritems():
		connections.append({'status': conn.is_online(), 'name':name})
	
	sys.stdout.write('connections: ' + str(connections))
	sys.stdout.flush()
	
	emit('status', connections);

#######################################################################
######## END GENERAL COMMANDS #########################################
#######################################################################


#######################################################################
######## MAIN ROUTE ###################################################
#######################################################################
'''
serves index.html
- For status and testing

'''
@app.route('/')
def index():
	# serve the index.html page to the client
	return render_template('index.html')

#######################################################################
######## END MAIN ROUTE ###############################################
#######################################################################


#######################################################################
######## SERIAL COMMANDS ##############################################
#######################################################################

'''
Start a Serial Connection

socket connection for connecting to a serial device
- Can only connect to one serial device at a time.

- PARAMETERS
	- message - (dictionary) -- Object passed from javascript
		- port     - (int or string) -- Port of the device (e.g. 0 = COM1, 4 = COM5, etc.)
		- baudrate - (int)           -- baudrate of the device (default = 115200)
'''
@socketio.on('serial-connection',namespace='/skyPOS')
def serial_connection(message):
	
	# validate
	validated = serial_message_validator(message)
	if not validated:
		return
		
	# store the connection id
	connection_id = message['connectionId']
	
	# check if there is already a serial connection with that id
	if current_app.serial_connections.get(connection_id) is not None:
		emit('error', { 'message':'There is already a connection with id %s' % (connection_id) })
		return
	

	# create the serial_connection and assign to the global app variable serial_connection
	serial_connection = SerialConnection(port=message.get('port'),baudrate=message.get('baudrate')) 
	current_app.serial_connections[connection_id] = serial_connection

	# check if the serial device is online
	if serial_connection.is_online():
		# respond with a success message
		emit('response',{ 
			'success':True,
			'message': '%s connected' % (connection_id), 
			'connection_id':connection_id
			})
	else:
		# respond with an error and clear the global app variable serial_connection
		emit('error', { 
			'message': 'There was an error connecting to the device. Please make sure the device connected, turned on and assocted to the correct port.' 
		})
		del current_app.serial_connections[connection_id]

'''
Write to a Serial Connection

- Requires a connection (serial_connection)

- PARAMETERS
	- message - (dictionary) -- Object passed from javascript
		- command - (string) -- command to send to connected device
'''
@socketio.on('serial-write',namespace='/skyPOS')
def serial_con(message):
	
	# validate
	validated = serial_message_validator(message)
	if not validated:
		return
	
	connection_id = message.get('connectionId')
	
	# check if there is already a serial connection
	if current_app.serial_connections.get(connection_id) is None:
		emit('error', { 'message':'No connection found with id %s' % (connection_id) })
		return
		
	if message.get('command') is None:
		emit('error', { 'message':'no command passed in message' })
		return

	# grab there global app variable serial_connection
	serialCon = current_app.serial_connections.get(connection_id)

	# wirte to the serial device
	# shouldRespond = message.get('shouldRespond')
	# if shouldRespond == None: shouldRespond = True
	shouldRespond = True
	if message.get('shouldRespond') == False:
		shouldRespond = False
	
	response = serialCon.send_command(message.get('command'),shouldRespond=shouldRespond)

	# respond with the response from the serial device
	if response == None:
		sys.stdout.write("no response not emitting\n")
		sys.stdout.flush()
		serialCon.flush()
		return
	
	if len(response.strip()) > 0:
		
		sys.stdout.flush()
		# response = unicode(response, errors='replace')
		data = b64encode(response)
		sys.stdout.write("Emitting Response " + response + "\n")
		emit('serial-response', {
			'success':True,	 
			'response':data
		})
	serialCon.flush()
		
'''
 Listen for response
'''
@socketio.on('serial-listen', namespace='/skyPOS')
def serial_listen(message):
	sys.stdout.write("SERIAL LISTEN\n")
	sys.stdout.flush()
	
	# validate he
	validated = serial_message_validator(message)
	if not validated:
		emit('error', { 'message':'There was something wrong with your data package.' })
		return
	
	connection_id = message.get('connectionId')
	
	# check if there is already a serial connection
	if current_app.serial_connections.get(connection_id) is None:
		emit('error', { 'message':'No connection found with id %s' % (connection_id) })
		return
		
	# store connection
	serialCon = current_app.serial_connections.get(connection_id)
	
	def listen_thread_kickoff():
		response = serialCon.waitForResponse()
	
		sys.stdout.write("*****RESPONSE RECIEVED*****\n")
	
		sys.stdout.write('RESPONSE: ' + response + "\n")
		sys.stdout.flush()
		
		global data
		
		# data = _encrypt(response);
			
		data = b64encode(response)
		
		socketio.emit('serial-response', { 'success':True, 'response':data },namespace="/skyPOS")
	
	thr1 = threading.Thread(target=listen_thread_kickoff,args=(),kwargs={})
	thr1.daemon = True
	thr1.start()
	# thr1.join();
	
	# response = serialCon.waitForResponse()
	
	# sys.stdout.write("*****RESPONSE RECIEVED*****\n")
	
	# sys.stdout.write('RESPONSE: ' + response + "\n")
	# sys.stdout.flush()
	
	# data = data = b64encode(response)
	
	# try:
	# 	emit('serial-response', { 'success':True, 'response':data })
	# 	break
	# except:
	# 	print('Error Emiting Serial Response: ' + sys.exc_info())
	# 	raise
	
# def _encrypt(data):
# 	ascii_value_list = [ord(i) for i in data]
# 	sys.stdout.write('ascii-value-list: ' + str(ascii_value_list))
# 	sys.stdout.flush()
# 	if (ascii_value_list[0:4] == [2,56,49,46]):
# 		sys.stdout.write('found string that need encrypted')
# 		sys.stdout.flush()
		
# 	return data
	
	
'''
	Read from device
'''
@socketio.on('serial-read', namespace='/skyPOS')
def serial_read(message):
	sys.stdout.write("SERIAL READ\n")
	sys.stdout.flush()
	
	# validate he
	validated = serial_message_validator(message)
	if not validated:
		emit('error', { 'message':'There was something wrong with your data package.' })
		return
	
	connection_id = message.get('connectionId')
	
	# check if there is already a serial connection
	if current_app.serial_connections.get(connection_id) is None:
		emit('error', { 'message':'No connection found with id %s' % (connection_id) })
		return
		
	# store connection
	serialCon = current_app.serial_connections.get(connection_id)

	response = serialCon.sp.readline()
	
	emit('serial-response', { 'success':True, 'response':response })
	
'''
Disconnect a serial device

- requires a connection
''' 
@socketio.on('serial-disconnect', namespace='/skyPOS')
def serial_disconnect(message):
	
	# validate
	validated = serial_message_validator(message)
	if not validated:
		return
		
	# store the connection id
	connection_id = message.get('connectionId')
	
	# check if there is a serial connection
	if current_app.serial_connections.get(connection_id) is None:
		emit('error', { 'message':'No connection found with id %s' % (connection_id) })
		return
	
	
	# clear the current serial connection
	current_app.serial_connections.get(connecton_id).disconnect()
	del current_app.serial_connections[connection_id]
	
	# return confirmation to client
	emit('response', { 'data':'serial connection terminated' })
	return
	
@socketio.on('rfid-read',namespace='/skyPOS')
def rfid_read():

	def rfid_read_thread_kickoff():
		# sys.stdout.write('read rfid' + '\n')
		# sys.stdout.flush()
		tag = RFIDCom.read_tag_epc(timeout=5)
		# sys.stdout.write('rfid read: ' + tag + '\n')
		# sys.stdout.flush()
	
		if tag == -1:
			socketio.emit('error', { 'message':'RFID - Unknown message recived' },namespace="/skyPOS")
		elif tag == 0:
			socketio.emit('rfid-response', { 'success': False,'message':'No tag in range' },namespace="/skyPOS")
		else:
			socketio.emit('rfid-response', { 'success':True,'message':tag },namespace="/skyPOS")
	
	thr1 = threading.Thread(target=rfid_read_thread_kickoff,args=(),kwargs={})
	thr1.daemon = True
	thr1.start()
	
	
# helpers
def serial_message_validator(message):
	if message['connectionId'] is None: 
		emit('error','Please provide a connection id for the serial message')
		return False
	else:
		return True

#######################################################################
######## END SERIAL COMMANDS ##########################################
#######################################################################

#######################################################################
######## USB COMMANDS #################################################
#######################################################################
'''
Start USB Connection

can only connect to one USB device at a time

- PARAMETERS
	- message - (dictionary) -- Object passed from javascript
		- vendorId  - (hex) -- vendor id of the device to connect to
		- productId - (hex) -- product id of the device to connect to
'''
@socketio.on('usb-connection',namespace="/skyPOS")
def usb_con(message):
	
	# vaildate the incoming message
	validated = usb_validate_message(message)
	if not validated:
		return
		
	# store the connection id
	connection_id = message['connectionId']
	
	# make sure there is not already a connectio with that id
	if current_app.usb_connections.get(connection_id) is not None:
		emit('error', { 'message':'There is already a connection with id %s' % (connection_id) })
		return
	
	# attempt to create a usb connection with given vendor and product id
	usb_connection = USBConnection(message['vendorId'],message['productId'],id=connection_id)
	
	# add the usb connection to usb_connections dictionary
	current_app.usb_connections[connection_id] = usb_connection

	# test if the usb connection is online
	if usb_connection.is_online():
		# response with a success message
		emit('response', { 
			'success':True,
			'message':'usb device connected'
		})
	else:
		# respond with error to the client
		emit('error', { 'message': 'Could not connect to the usb device, please make you the device is connected, turned on and you have the correct product and vendor id' })
		# clear the global app variable for usb_connection since there was an error.
		current_app.usb_connection = None

'''
Write to USB Device

requires a connection (usb_con)

- PARAMETERS
	- message - (dictionary) -- Object passed from javascript
		- command - (string) -- command to send to the device
'''
@socketio.on('usb-write',namespace='/skyPOS')
def usb_write(message):
	
	# validate message
	validated = usb_validate_message(message)
	if not validated:
		return
	
	# store the connection id	
	connection_id = message['connectionId'] 
	
	# check if there is a device connected. 
	if current_app.usb_connections.get(connection_id) is None:
		emit('error', { 'message':'There is no device connected with that id' })
		return

	# grab the current connection from the global app variable
	usbCon = current_app.usb_connections[connection_id]

	def kick_off_usb_write():
		# write the command
		usbCon.write(message['command'])
	
		# respond to the client
		socketio.emit('response', {
			'success': True, 
			'message':'usb command sent' 
		}, namespace="\skyPOS")
		
	thr1 = threading.Thread(target=kick_off_usb_write,args=(),kwargs={})
	thr1.daemon = True
	thr1.start()
	
@socketio.on('usb-disconnect',namespace='/skyPOS')
def usb_disconnect(message):
	
	# validate message
	validated = usb_validate_message(message)
	if not validated:
		return
		
	# store the connection id
	connection_id = message['connectionId']
	
	# check if there is a connection
	if current_app.usb_connections.get(connection_id) == None:
		emit('error', { 'message':'No connection found with that id' })
		
	# get the connection
	usbCon = current_app.usb_connections[connection_id]
	
	# disconnect and clear the instance for usb_connection
	usbCon.disconnect()
	del current_app.usb_connections[connection_id]
	
	# respond to the client
	emit('response', {
		'success': True, 
		'message':'usb connection terminated'  
	})
	return

		
# helpers
def usb_validate_message(message):
	if message.get('connectionId') is None: 
		emit('error',{ "message": 'Please provide a connection id for the usb message' })
		return False
	else:
		return True
	
	

#######################################################################
######## END USB COMMANDS #############################################
#######################################################################


#######################################################################
######## MAIN #########################################################
#######################################################################
'''
Start The Server
'''
if __name__ == '__main__':
	# run the server
	socketio.run(app)