import requests
import threading
import json

getStandardPixelsUrl = 'http://localhost:5000/getAllStandardPixels'
turnOnPixelInDirectionUrl = 'http://localhost:5000/turnOnPixelInDirection'

cars = []

class Car:
    def __init__(self, label):
        self.label = label
        self.direction = 'Down'

def moveAll():
    labels = ','.join(map(lambda (c): c.label, cars))
    directions = ','.join(map(lambda (c): c.direction, cars))

    params = 'directions='+directions+'&labels='+labels+'&type='+'standard'
    r = requests.get(turnOnPixelInDirectionUrl+'?'+params)
    data = r.json()

    for i,label in enumerate(data):
        l = data[i]
        if (not l):
            newDirection = None

            if (cars[i].direction == 'Down'): newDirection = 'Up'
            if (cars[i].direction == 'Up'): newDirection = 'Down'

            cars[i].direction = newDirection
        else:
            cars[i].label = l

def getInitialPixels(data):
    if (len(data) != len(cars)): return

    for i,c in enumerate(cars):
        c.label = data[i]

def loop():
    moveAll()
    threading.Timer(0.5, loop).start()

if __name__ == '__main__':

    r = requests.get(getStandardPixelsUrl)
    data = r.json()
    for label in data:
        cars.append(Car(label))

    loop()
