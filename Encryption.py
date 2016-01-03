import base64
from Crypto import Random
from Crypto.Cipher import AES
from Crypto.Hash import SHA256

class AESCipher(object):
	def __init__(self,key):
		self.bs = 32
		
		h = SHA256.new()
		h.update(key.encode())
		self.key = h.digest()
		
	def encrypt(self,rawData):
		data = self._pad(rawData)
		iv = Random.new().read(AES.block_size)
		cipher = AES.new(self.key,AES.MODE_CBC, iv)
		return base64.b64encode(iv + cipher.encrypt(data))
		
	def _pad(self,s):
		return s + (self.bs - len(s) % self.bs) * chr(self.bs - len(s) % self.bs)
