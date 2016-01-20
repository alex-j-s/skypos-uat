'use-strict'


angular.module('skyZoneApp')


.factory('VerifoneCommandFactory',[ function() {
	var fac = {};
		fac.STX = '\x02'; // start text
		fac.BEL = '\x07'; // bell
		fac.ETX = '\x03'; // end text
		fac.FS  = '\x1c'; // file separator
		fac.ACK = '\x06';  // acknowledge
		fac.BS  = '\x08';  // backspace
		fac.byteASCIIMap = {
			0   : '<NULL>',
			1   : '<SOH>',
			2   : '<STX>',
			3   : '<ETX>',
			4   : '<EOT>',
			5   : '<ENQ>',
			6   : '<ACK>',
			7   : '<BEL>',
			8   : '<BS>',
			9   : '<TAB>',
			10  : '<LF>',
			11  : '<VT>',
			12  : '<FF>',
			13  : '<CR>',
			14  : '<SO>',
			15  : '<SI>',
			16  : '<DLE>',
			17  : '<DC1>',
			18  : '<DC2>',
			19  : '<DC3>',
			20  : '<DC4>',
			21  : '<NAK>',
			22  : '<SYN>',
			23  : '<ETB>',
			24  : '<CAN>',
			25  : '<EM>',
			26  : '<SUB>',
			27  : '<ESC>',
			28  : '<FS>',
			29  : '<GS>',
			30  : '<RS>',
			31  : '<US>',
			127 : '<DEL>'
		}
		fac.readableString = function(bytes,LRC) {
			var str = "";
			
			if ( LRC == undefined ) { LRC = true; };
			
			for ( var i in bytes ) {
				var byte = bytes[i];
				
				if ( (i == bytes.length - 1 && bytes.length > 1) && LRC ) {
					str += '{LRC: ' + byte + '}';
				}else if ( fac.byteASCIIMap[byte] == undefined ) {
					str += String.fromCharCode(byte);
				} else {
					str += fac.byteASCIIMap[byte]
				}
			}
			
			return str;	
		};
		fac.stripByteArray = function(bytes) {
			var stripped = [];
			for ( var i in bytes ) {
				var byte = bytes[i];
				if ( byte != 2 && byte != 6 && byte != 3 && i != bytes.length - 1 ) {
					stripped.push(byte);
				}
			} 	
			return stripped;
		};
		fac.stringToByteArray = function(str) {
			var bytes =  [];
			
			for (var i = 0; i < str.length; i++) {
				bytes.push(str.charCodeAt(i));
			}
			
			return bytes;
		};
		fac.userResponseCommand = function() {
			return fac.stringToByteArray('XEVT');
		};
		fac.addToTextBoxResponseCommand = function() {
			return fac.stringToByteArray('XATT');	
		};
		fac.displayTextResponseCommand = function() {
			return fac.stringToByteArray('XDTX');
		};
		fac.sigCapMetaCommand = function() {
			return fac.stringToByteArray('S01');
		};
		fac.sigPacketCommand = function() {
			return fac.stringToByteArray('S02');
		};
		fac.bin2String = function(bin) {
			return String.fromCharCode.apply(String,bin);
		};
		fac.calcLRC = function(command) {
			var lrc = 0;
			for (var i = 0;i < command.length; i++) {
				var char = command[i];
				if (char === 6 || char === 2) {
					continue;
				}
				
				lrc ^= char;
			}
			return lrc;
		};
		fac.arraysEqual = function arraysEqual(a, b) {
			if (a === b) return true;
			if (a == null || b == null) return false;
			if (a.length != b.length) return false;
			
			// If you don't care about the order of the elements inside
			// the array, you should sort both arrays here.
			
			for (var i = 0; i < a.length; ++i) {
				if (a[i] !== b[i]) return false;
			}
			return true;
		};
		fac.clearScreen = { 
			request: function() {
				var command = fac.STX;
				command += 'XCLS';
				command += fac.ETX + fac.BEL;
				var barray = fac.stringToByteArray(command);
				barray.push(fac.calcLRC(barray));
				return barray;
			},
			response: function() {
				var command = fac.ACK;
				command += fac.STX
				command += 'XCLS';
				command += fac.FS;
				command += '1';
				command += fac.ETX;
				var barray = fac.stringToByteArray(command);
				barray.push(fac.calcLRC(barray));
				return barray;
			}
		}
        
        fac.enableForm = {
            request : function(enabled) {
                var command = fac.STX;
                command += 'XEFM' + fac.FS;
                command += enabled  ? '1' : '0';
                command += fac.ETX;
                var barray = fac.stringToByteArray(command);
				barray.push(fac.calcLRC(barray)); 
				return barray;
            },
            response : function() {
                var command = fac.ACK;
				var barray = fac.stringToByteArray(command);
				// barray.push(fac.calcLRC(barray));
				return barray;
            }
        }
        
		fac.initForm = {
			// rawRequest: function(formName) {
			// 	//var command = fac.STX;
			// 	var command = 'XIFM';
			// 	command += fac.FS;
			// 	command += formName;
			// 	command += fac.FS;
			// 	command += '0';
			// 	return command;
			// },
			request: function(formName) {
				var command = fac.STX;
				command += 'XIFM';
				command += fac.FS;
				command += formName;
				command += fac.FS;
				command += '1'; //only allow one event on the form
				//fac.initForm.rawRequest(initForm);
				command += fac.ETX;
				var barray = fac.stringToByteArray(command);
				barray.push(fac.calcLRC(barray)); 
				return barray;
			},
			response: function() {
				var command = fac.ACK;
				command += fac.STX;
				command += 'XIFM';
				command += fac.FS;
				command += '1';
				command += fac.ETX;
				var barray = fac.stringToByteArray(command);
				barray.push(fac.calcLRC(barray));
				return barray;
			}
		}
		fac.setFormParam = {
			request: function(key,value) {
				var command = fac.STX
								+ 'XSPV'
								+ fac.FS
								+ key
								+ fac.FS
								+ 'CAPTION'
								+ fac.FS
								+ 'STRING'
								+ fac.FS
								+ value
								+ fac.ETX;
								
				var barray = fac.stringToByteArray(command);
				barray.push(fac.calcLRC(barray));
				return barray;
			},
			response: function() {
				var command = fac.ACK;
				command += fac.STX
				command += 'XSPV';
				command += fac.FS;
				command += '1';
				command += fac.ETX;
				var barray = fac.stringToByteArray(command);
				barray.push(fac.calcLRC(barray));
				return barray;
			}
		};
		fac.showForm = {
			request: function() {
				var command = fac.STX
								+ 'XSFM'
								+ fac.FS
								+ '1'
								+ fac.FS
								+ fac.ETX;
				var barray = fac.stringToByteArray(command);
				barray.push(fac.calcLRC(barray));
				return barray;
			},
			response: function() {
				var command = fac.ACK;
				command += fac.STX;
				command += 'XSFM';
				command += fac.FS;
				command += '1';
				command += fac.ETX;
				var barray = fac.stringToByteArray(command);
				barray.push(fac.calcLRC(barray));
				return barray;
			}
		};
		fac.addTextBoxText = {
			request: function(controlId,text) {
				var command = fac.STX
				command += 'XATT'
				command += fac.FS + controlId
				command += fac.FS + text
				command += fac.ETX
				var barray = fac.stringToByteArray(command);
				barray.push(fac.calcLRC(barray));
				return barray;
			},
			response: function() {
				return '';
			}	
		};
		fac.displayText =  {
			request: function(text,x,y,row,col,mask,fontsize,font,color) {
				var command = fac.STX
								+ 'XDTX'
								+ fac.FS
								+ x + fac.FS
								+ y + fac.FS
								+ row + fac.FS
								+ col + fac.FS
								+ mask + fac.FS
								+ font + fac.FS
								+ fontsize + fac.FS
								+ text + fac.FS
								+ color
								+ fac.ETX;
				var barray = fac.stringToByteArray(command);
				barray.push(fac.calcLRC(barray));
				return barray;
			},
			response: function() {
				return '';
			}
		};
		fac.setupSignatureBox = {
			request: function(LX,LY,RX,RY) {
				var command = fac.STX
				command += 'S04';
				command += LX + LY + RX + RY;
				command += '1';
				command += fac.ETX;
				var barray = fac.stringToByteArray(command);
				barray.push(fac.calcLRC(barray));
				return barray;
			},
			response: function() {
				var command = fac.ACK;
				var barray = fac.stringToByteArray(command);
				// barray.push(fac.calcLRC(barray));
				return barray;
			}
		};
		fac.setSignatureSettings = {
			request: function(userMaxStart,userMaxEnd,displayMode,signatureRes,saveMode,flash) {
				var command = fac.STX;
				command += 'S03';
				command += userMaxStart + userMaxEnd + displayMode + signatureRes + saveMode + flash
				command += fac.ETX
				var barray = fac.stringToByteArray(command);
				barray.push(fac.calcLRC(barray));
				return barray;
			},
			response: function() {
				var command = fac.ACK;
				var barray = fac.stringToByteArray(command);
				// barray.push(fac.calcLRC(barray));
				return barray;
			}	
		};
		fac.captureSignatureData = { 
			request: function() {
				var command = fac.STX
								+ 'S00'
								+ fac.ETX;
				var barray = fac.stringToByteArray(command);
				barray.push(fac.calcLRC(barray));
				return barray;
			},
			response: function() {
				var command = fac.ACK;
				var barray = fac.stringToByteArray(command);
				// barray.push(fac.calcLRC(barray));
				return barray;
			}
		};
		
		fac.getCardData = {
			request: function() {
				var command = fac.STX
				command += 'Q13'
				command += fac.ETX
				var barray = fac.stringToByteArray(command);
				barray.push(fac.calcLRC(barray));
				return barray;
			},
			response: function() {
				var command = fac.ACK;
				var barray = fac.stringToByteArray(command);
				// barray.push(fac.calcLRC(barray));
				return barray;		
			}
		};
		
		fac.setWorkingKey = {
			request: function(key) {
				var command = fac.STX
				command += 'D40' + key
				command += fac.ETX
				var barray = fac.stringToByteArray(command);
				barray.push(fac.calcLRC(barray));
				return barray;
			},
			response: function() {
				var command = fac.ACK;
				var barray = fac.stringToByteArray(command);
				// barray.push(fac.calcLRC(barray));
				return barray;
			}
		}
		
		fac.requestDebitPin = {
			request: function(cardNumber) {
				var command = fac.STX
				command += 'Z60.' + cardNumber
				command += fac.ETX
				 var barray = fac.stringToByteArray(command);
				barray.push(fac.calcLRC(barray));
				return barray;
			},
			response: function() {
				var command = fac.ACK;
				var barray = fac.stringToByteArray(command);
				// barray.push(fac.calcLRC(barray));
				return barray;
			}
		}
        
        fac.reboot = {
            request: function() {
                var command = fac.STX;
                command += 'XRST';
                command += fac.ETX;
                var barray = fac.stringToByteArray(command);
                barray.push(fac.calcLRC(barray));
				return barray;
            },
            response: null
        }
        
        fac.restartApp = {
            request: function() {
                var command = fac.STX;
                command += 'XRSTAPP';
                command += fac.ETX;
                var barray = fac.stringToByteArray(command);
                barray.push(fac.calcLRC(barray));
				return barray;
            },
            response: null
        }
		
				
		return fac;
}]);