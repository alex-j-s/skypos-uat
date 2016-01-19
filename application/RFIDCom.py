import serial
import time
import binascii

#
# Define indexes for bytes in received messages
#
REC_MSG_LEN = 0
REC_CMD_INDEX = 2
REC_STATUS_INDEX = 3
REC_DATA_INDEX = 4
REC_EPC_LEN = 5
REC_EPC1_INDEX = 6


# ---------------------------------------------------------------------------------------
#
#     Sends Inventory command to rfid reader and returns EPC of first tag returned.
#
#     Paramaters:
#      string fid_reader_com_port, default = 'COM3', The COM port the reader is connected to
#      int timeout, default = 1, The serial read timeout in seconds
#
#     Returns:
#     Type      Value       Explanation
#      int      -1          Unknown message received from reader
#      int      0           No tags detected
#      string   variable    EPC of first tag returned by reader (hex characters)
#
#     Assumptions:
#      rfid reader set to default shipped options
#      rfid reader address is 0x00
#      rfid reader responds within 0.1 seconds
#      
# ---------------------------------------------------------------------------------------
def read_tag_epc(rfid_reader_com_port = 'COM12', timeout = 1):
    
    rfid_reader = serial.Serial(                                # Set up serial port
        port=rfid_reader_com_port,
        baudrate=57600,
        timeout=0,
    )

    if rfid_reader.isOpen():                                    # Open port and flush buffers
        rfid_reader.flushInput()
        rfid_reader.flushOutput()
         
        cmd_msg = '040001db4b'
        rfid_reader.write(bytearray.fromhex(cmd_msg))           # Send inventory command

        time.sleep(0.1)
        rcv_msg = rfid_reader.read(40)                          # Read response
        
        timecount = 1.0
        while (len(rcv_msg) < 10) and (timecount < timeout):
            scmd_msg = '040001db4b'
            rfid_reader.write(bytearray.fromhex(cmd_msg)) 
            rcv_msg = rfid_reader.read(40)
            timecount += 0.1
            time.sleep(0.1)
            
        rfid_reader.flushInput()
        rfid_reader.close()
        
        print('read: ' + rcv_msg)
        
        if type(rcv_msg) is str:                                # Handle case in Python 2.x where 
            rcv_msg = bytearray(rcv_msg)                        # serial.read outputs a string
            
        if crc16(rcv_msg) == bytearray([0x00]):                 # Check message crc
            if (rcv_msg[REC_CMD_INDEX] == int("0x01", 0) and 
                rcv_msg[REC_STATUS_INDEX] == int("0xfb", 0)):   # If response indicates no tags
                # print ("No Tag In Range")
                return 0
                
            elif (rcv_msg[REC_CMD_INDEX] == int("0x01", 0) and 
                rcv_msg[REC_STATUS_INDEX] == int("0x01", 0)):   # If response has tags
                
                epc_len = rcv_msg[REC_EPC_LEN]                  
                tag_epc = rcv_msg[REC_EPC1_INDEX:
                                  REC_EPC1_INDEX+epc_len]       # Extract tag from message

                return (binascii.hexlify(tag_epc).decode('utf8'))
            else:                                               # Otherwise unknown message received
                print ("Unknown message received: ", binascii.hexlify(rcv_msg))
                
                return -1
        else:
            raise Exception("CRC check failed.", crc16(rcv_msg))
        
    else:
        raise Exception("Failed to open COM port")
    
    
# ---------------------------------------------------------------------------------------   
#
#     Calculates crc16 of bytearray with polynomial '0x8408' and initial value '0xFFFF'
#
#     Returns: 2-byte array: LSB,MSB
#
# ---------------------------------------------------------------------------------------
def crc16(data_bytes, bits=8):
    data = binascii.hexlify(data_bytes).decode('utf8')
    crc = 0xFFFF
    for op, code in zip(data[0::2], data[1::2]):
        crc = crc ^ int(op+code, 16)
        for bit in range(0, bits):
            if (crc&0x0001)  == 0x0001:
                crc = ((crc >> 1) ^ 0x8408)
            else:
                crc = crc >> 1

    return bytearray.fromhex(type_casting(crc))

    
# ---------------------------------------------------------------------------------------
#
#     Reverses crc order. 
#
#     Returns: bytearray: LSB, MSB
#
# ---------------------------------------------------------------------------------------
def type_casting(crc):
    msb = format(crc >> 8, 'x')
    lsb = format(crc & 0x00FF, 'x')
    return lsb + msb
    
# ---------------------------------------------------------------------------------------
#
#     Test script
#
# ---------------------------------------------------------------------------------------
# if __name__ == "__main__":
#     tag_epc = read_tag_epc(rfid_reader_com_port='COM12')
#     if tag_epc == -1:
#         print ("Unknown message received.")
#     elif tag_epc == 0:
#          print ("No tag in range.")
#     else:
#         print ("Tag found with EPC: ", tag_epc)
    
