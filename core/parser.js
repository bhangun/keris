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

const _ = require('lodash');

module.exports = {
    parse
};

/**
 * 
 * @param {*} type 
 * @param {*} enumValue 
 * @param {*} lang 
 * @returns 
 */
function parse(typeOrigin, lang) {
  
    lang


    let newType = {}
    let _comp = ''
    if(typeOrigin.items && typeOrigin.items.$ref)
      _comp = _.capitalize(type.items.$ref.split(RegExp(`^#/components/schemas/`))[1])
  
    newType.origin = typeOrigin.type? typeOrigin.type: _comp
    newType.example = typeOrigin.example ? typeOrigin.example : ''
    newType.description = typeOrigin.description ? typeOrigin.description : ''
    newType= 'String'
    newType.typeDesc = ''
  
  
    switch (typeOrigin.type) {
      case 'integer':
        if (typeOrigin.format == 'int64')
          newType= 'double'
        else if (typeOrigin.format == 'int32')
          newType= 'int'
        break;
      case 'number':
        if (typeOrigin.format == 'float' || typeOrigin.format == 'double')
          newType= 'double'
       // else if (type.format == 'double')
        //  newType= 'double'
        break;
      case 'string':
        switch (typeOrigin.format) {
          case 'byte':
            newType= 'ByteData'
            break;
          case 'binary':
            newType= 'BinaryCodec'
            break;
          case 'date':
            newType= 'DateTime'
            break;
          case 'date-time':
            newType= 'DateTime'
            break;
          case 'password':
          default:
            newType= 'String'
            break;
        }
        break;
      case (typeOrigin == 'Instant'):
        newType= 'int'
        newType.typeDesc = '.toIso8601String()' + 'Z'
        break
      case 'array':
        if(_comp)
          newType= 'List<'+_comp+'>'
        else 
          newType= 'List'
        break;
      case 'uuid':
        newType= 'String'
        break;
      case 'object':
        if(_comp)
          newType= _comp
        else if(newType== typeOrigin.xml)
          newType=  _.capitalize(typeOrigin.xml.name)
        else 
          newType= 'Object'
        break;
    }
  
    if (typeOrigin.isEnum) newType= 'String'

if(newType!='String')
   console.log(newType)
    return newType
  }