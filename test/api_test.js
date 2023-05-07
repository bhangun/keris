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

/* const GenBase = require('../core');
const utils = require('../core/utils');
*/
const _ = require('lodash'); 
const fs = require('fs')
const trans = require('../core/transformer')


// const API2 = 'https://petstore.swagger.io/v2/swagger.json'

/* process.argv.forEach(function (val, index, array) {
  console.log(index + ': ' + val+ '');
}); */


function testAPI(arg) {
  let path = 'https://petstore3.swagger.io/api/v3/openapi.json'
  switch (arg) {
    case 'ceph':
      path = '../api_sample/ceph-oas3.json'
      break;
    case 'shopify':
      path = '../api_sample/shopify-oas3.json'
      // https://shopify-connector-sit-oms.ascentis.com.sg/swagger/v1/swagger.json
      // https://shopify-connector-sit-oms.ascentis.com.sg/swagger/index.html
      // Swagger 2.0: https://gist.github.com/kinlane/0346107813e6402ba7aaf9e1829616b7 
      break;
    default:
      path = '../api_sample/pet-oas3.json'
      break;
  }

    trans.transformApi('myname', path, (api) => {
        this.props = api
        writeFile(JSON.stringify(api),'test/coba4.json')
    }) 
}

function writeFile(rawData, name){
  fs.writeFileSync(name? name: '', rawData, function (err) {
    if (err) throw err;
    console.log('Saved!');
  });
}

console.log('------Start--------')
//const text = '{name}/api/service/{serv_name}/daemons/{servi_ss}'
//console.log(text.match(/(?<=\{).+?(?=\})/g))

testAPI(process.argv[2])
console.log('------Finish--------')
