import serial
from flask import Flask , request
import numpy as np

app = Flask(__name__)
app.config['SECRET_KEY'] = 'secret!'
app.config['DEBUG'] = True
app.config['TEMPLATES_AUTO_RELOAD'] = True

# UNCOMMENT:
# ser = serial.Serial('COM5', 9600)

def ByteArray(length, on):
    a= list('0' * length)
    for i in range(0, len(on)):
        a[on[i]] = '1'
    z = []
    for j in range(0, length/8):
        z.append (('0b' + ''.join(a[j*8 : j*8+8])))
    return(z)

def WriteToRegister(ser, onBits = (1, 11, 26), numBits = 64 ):
    z = ByteArray(numBits, onBits)
    e = []
    for k in range(0, len(z)):
        a = z[k]
        b = int(a, 2)
        b = chr(b)
        e.append(bytes(b))

    print ''.join(e)
    # UNCOMMENT:
    # ser.write(''.join(e))

@app.route('/writeToRegister',methods=['GET','POST','OPTIONS'])
def writeToRegister():
    print request.args['channels'].split(',')
    # onBits = map(int, request.args['channels'].split(','))
    # print onBits
    # # UNCOMMENT:
    # # WriteToRegister(ser, onBits)
    return "writing to register..."

if __name__ == "__main__":
    app.run(port=5001)
