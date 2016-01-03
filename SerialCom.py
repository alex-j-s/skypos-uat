'''
SERIALCOM.PY

Class that handles generaic serial communication

AUTHOR: Blaine Rothrock -- blaine@appirio.com

change log
______________________________________
CREATED: 10/27/2015

'''
import serial, sys, time

class SerialConnection:

    '''
    INIT the serial connection
    
    PARAMETERS
        - name     : (string)  : name of the connection
        - port     : (int)     : port number for the device (e.g. 0 = COM1, 4 = COM5, etc.)
        - baudrate : (int)     : baudrate for the device (e.g. 115200)
        - bytesize : (enum)    : number of data bits (serial.FIVEBITS, SIXBITS, SEVENBITS, EIGHTBITS)
        - parity   : (enum)    : enable parity checking (serial.PARITY_NONE, PARITY_ODD, PARITY_EVEN, PARITY_MARK, PARITY_SPACE)
        - stopbits : (enum)    : number of stop bits (serial.STOPBITS_ONE, STOPBITS_ONE_POINT_FIVE, STOPBITS_TWO)
        - rtscts   : (boolean) : Enable hardware (RTS/CTS) flow control
        - timeout  : (int)     : read timeout value
    '''
    def __init__(self, id=None, port=None, baudrate=None,
                 bytesize=serial.EIGHTBITS,parity=serial.PARITY_NONE,stopbits=serial.STOPBITS_ONE,
                 rtscts=False,timeout=0,verbose=None):

        # set the name (id for connection)
        # this will be sent back with every response
        self.id = id
        
        # set instance variables
        self.port = port
        self.baudrate = baudrate

        # attempt the serial connection
        try:
            self.sp = serial.Serial(self.port,self.baudrate)
        except:
            return
        
        # set parameters for the serial connection
        self.sp.bytesize = bytesize
        self.sp.parity = parity
        self.sp.stopbits = stopbits
        self.sp.rtscts = rtscts
        self.sp.timeout = timeout
        
        self.flush()

        return
        
    
    '''
     Serial Connection Online
     
     is the device connected?
    '''
    def is_online(self):
        # if the connection is None return False, else return True
        try:
            if self.sp is not None:
                return True
            else:
                return False
        except:
            return False

    '''
    Send Command to the Serial Device
    '''
    def send_command(self,message,shouldRespond=True):
        
        # wite the message as a byte array encoded UTF-8
        sys.stdout.write("MESSAGE: " + str(message) + "\n")
        sys.stdout.flush()
        command = bytearray(message)
        
        self.sp.write(command)

        # sleep for 1/10th second to allow the device to respond
        time.sleep(0.1)

        if shouldRespond:
            response = self.sp.readline()
            waitTime = 0
            while len(response) <= 3 and waitTime < 10:
                # sys.stdout.write('waiting ' + str(waitTime + 1) + '/10th second(s) to complete response: ' + response + '\n')
                # sys.stdout.flush()
                time.sleep(0.1)
                waitTime += 1
                response += self.sp.readline()
            # toReturn = response
            # while response != "":
            #     time.sleep(0.1)
            #     response = self.sp.readline()
            #     toReturn += response
            self.sp.flushOutput()
            sys.stdout.write('response to return: ' + response + '\n')
            sys.stdout.flush()
            return response
        else:
            self.sp.flushOutput()
            return None
            
        
    '''
    Wait for a response
    '''
    def waitForResponse(self,timeout=0,EOF=3,min_response=3,read=False):        
        # old_timeout = self.sp.timeout
        # self.sp.timeout = timeout
        
        self.sp.flushOutput()
       
        response = self.sp.read(1)
        
        count = 0
        while response == "":
            # sys.stdout.write("response" + response + "\n")
            # sys.stdout.flush()
            response = self.sp.read(1)
            count += 1
            time.sleep(0.1)
            
        # if count == timeout:
        #     return None
            
        res = ""
        while ord(response) != EOF:
            res += response
            response = self.sp.read(1)
            
        res += response + self.sp.read(1)
            
        # sys.stdout.write("******response2******: " + str(bytearray(res)))
        # sys.stdout.flush()
              
        if len(res) < min_response:
            sys.stdout.write("***RES IS TOO SMALL, RECUSRSION***\n")
            return self.waitForResponse(timeout=timeout,EOF=EOF,min_response=min_response)
            
        # self.sp.timeout = old_timeout
       
        return res      
    '''
    Flush Device Buffer
    
    Clears the input and output buffer for the device.
    Could help with troubleshooting from client-side
    '''
    def flush(self):
        try:
            self.sp.flushInput()
            self.sp.flushOutput()
            return
        except:
            return
    
    '''
    Close Connection
    
    Closes connection to the serial device and clear the instance variable
    '''
    def disconnect(self):
        try:
            self.flush()
            self.sp.close()
            self.sp = None
            return
        except: 
            return
            
    # helpers
    def calcLRC(self,command):
        lrc = 0
        for b in command[1:]:
            lrc ^= b
        
        return lrc