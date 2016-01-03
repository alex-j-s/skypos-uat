'''
USBCOM.PY

Class that handles generic usb communication

AUTHOR: Blaine Rothrock -- blaine@appirio.com

change log
______________________________________
CREATED: 10/27/2015
'''

import usb.core
import usb.util


class USBConnection:

    '''
    INIT the usb conenction
    
    PARAMETERS
        - vendorId  : (hex) : The vendor id for the USB device
        - productId : (hex) : the product Id for the the USB device
    '''
    def __init__(self,vendorId,productId,id=None):
        
        # set the name of the USBConnectiom
        self.id = id
        
        # init the instance variable
        self.device = None
        
        # attempt to find the device by vendor and product id
        self.device = usb.core.find(idVendor=vendorId,idProduct=productId)
        
        # initialize the endpoint variable
        self.ep = None

        if self.device is not None:
            
            # set the active configuration. With no arguments, the first
            # configuration will be the active one
            self.device.set_configuration()

            # get an output endpoint instance
            cfg = self.device.get_active_configuration()
            intf = cfg[(0,0)]

            self.ep = usb.util.find_descriptor(
                intf,
                custom_match = \
                lambda e: \
                    usb.util.endpoint_direction(e.bEndpointAddress) == \
                    usb.util.ENDPOINT_OUT)

        else:
            print 'NO DEVICE'


    '''
    Device Status
    
    return true if the device was found, false if it was not
    '''
    def is_online(self):
        if self.device is None:
            return False
        else:
            return True

    def disable(self):
        usb.util.claim_interface(self.device,0)
        print('interface claimed')
        # try:
        #   self.device.detach_kernel_driver(1)
        #   return True
        # except usb.core.USBError as e:
        #   raise DeviceException('Could not set configuration: %s' % str(e))
        #   return False

    '''
    Write to the device
    '''
    def write(self,command):
        print 'COMMAND: ' + command
        if self.ep is None:
            return False
            
        usb.util.claim_interface(self.device,0)

        # write to the output endpoint of the device
        self.ep.write(command)  
        
        usb.util.release_interface(self.device,0)   
        return True

    '''
    Release the device interface
    '''
    def disconnect(self):
        # release the interface
        usb.util.release_interface(self.device,0)
        
        # clear instance variables
        self.device, self.ep = None, None
