import json
import requests
import time

from lxml import etree

getStandardPixelsUrl = 'http://localhost:5000/getAllStandardPixels'
turnOnPixelInDirectionUrl = 'http://localhost:5000/turnOnPixelInDirection'
turnOffPixelsUrl = 'http://localhost:5000/turnOffAllPixels'
sendPixelSequenceUrl = 'http://localhost:5000/sendPixelSequence'

channels = {}
dimensions = {'rows': 8, 'cols': 30}

# Assume the user has already selected the top right label

r = requests.get(getStandardPixelsUrl)

for col in range(dimensions['cols']):
    first = r.json()[0]
    label = ""
    for row in range(dimensions['rows']):
        i = dimensions['rows']*col + row

        r = requests.get(getStandardPixelsUrl)
        label = r.json()[0]

        channels[label] = {'channel': i, 'label': label}
        print channels[label]

        params = 'directions=Down&labels='+label+'&type=standard'
        requests.get(turnOnPixelInDirectionUrl+'?'+params)

    requests.post(turnOffPixelsUrl)
    r = requests.post(sendPixelSequenceUrl+'?pixels='+first)

    params = 'directions=Right&labels='+first+'&type=standard'
    requests.get(turnOnPixelInDirectionUrl+'?'+params)
    r = requests.get(getStandardPixelsUrl)

filename = "../../dist/svg/newGrid.svg"

f = open(filename, 'r');
tree = etree.parse(f)

for element in tree.iter():
    ID = element.get("id")
    if ID in channels:
        element.attrib['channels'] = str(channels[ID]['channel'])

tree.write('../../dist/svg/newGrid2.svg')
f.close()

# channels[0] = {channel: 0, }
# print(start)
