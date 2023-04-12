/* eslint-disable no-undef */
/**
 * Copyright 2023 Bhangun Hartani
 * This file is part of the Kujang Generator
 * for more information.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

const GenBase = require('../core');
const utils = require('../core/utils');
const _ = require('lodash');
const fs = require('fs')
//const Buffer = require('buffer')
const trans = require('../core/transformer')


const API2 = 'https://petstore.swagger.io/v2/swagger.json'
const API3 = 'https://petstore3.swagger.io/api/v3/openapi.json'
const API4 = '../api_sample/pet-oas3.json'
const API5 = '../api_sample/api02.yaml'

const API01J = '../api_sample/api/api01.json'
const API01Y = '../api_sample/api/api01.yaml'
const API01R = '../api_sample/api/api01_result.json'

const API02J = '../api_sample/api/api02.json'
const API02R = '../api_sample/api/api02_result.json'
const API02Y = '../api_sample/api/api02.yaml'
const API6 = '../api_sample/ceph-oas3.json'


function testArray(_path) {
    const data = {}
    trans.transformApi('myname', _path, (api) => {
        this.props = api
        writeFile(JSON.stringify(api),'test/coba4.json')
    }) 
}

function writeFile(rawData, name){
  //const data =  new Uint8Array(Buffer(dataIn));
  //const data = Buffer.alloc(Buffer.byteLength(rawData, 'utf8'), rawData, 'utf8');
  fs.writeFileSync(name? name: '', rawData, function (err) {
    if (err) throw err;
    console.log('Saved!');
  });
}

// testArray(API4) // Pet
testArray(API6) // Ceph
