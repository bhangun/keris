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
const prop = require('./properties');

module.exports = {
  transformResponses,
  getResponseType
};


/**
 * Mapping responses
 * @param {*} list 
 * @returns 
 */
function transformResponses(list, props, index, entities, i) {
    const responses = []
    if (list)
        Object.entries(list.responses).forEach(r => {
           
          let headersType = []
          const responseCode = r[0]
          const name = 'R'+i+'A'+index+'B'+Math.random().toString(36).slice(-4)+responseCode

          const content = r[1].content ? transformResponseContentType(r[1].content, props, name) : []

          if (r[1].headers){
            Object.entries(r[1].headers).forEach(c => {
              headersType.push(c[0])
            })
          }

          if(content.properties && content.properties.length > 0) {
            entities.push({
              name: name,
              properties: content.properties
            })
          }

          

          responses.properties= content.properties
          responses.object= content.object

          responses.push({
              /// responses.<responseCode>
              code: responseCode,

              name : content.component? content.component: name,

              hasComponent: content.component? true : false,

              isComponentArray: content.isComponentArray,

              /// responses.<responseCode>.description
              description: r[1].description ? r[1].description : '',

              content: content.content,
              /// responses.<responseCode>.content
              contentType: content.contentType,
              // component: content.component,
              required: content.required,
      
              /// responses.<responseCode>.content
              //required: required,
              headers: headersType
          })
        })

    return responses;
}

/**
 * Get ResponseContentType
 * @param {*} contentType 
 * @returns 
 */
function transformResponseContentType(content, props, parentEntityName) {
  const listContent = []
  let compName = ''
  let isComponentArray = false
  if (content) Object.entries(content).forEach(c => {
    const contentItem = transformResponseContentTypeDetail(c, props, parentEntityName)
    compName = contentItem ? contentItem.component : ''
    isComponentArray = contentItem.isComponentArray
    listContent.push(contentItem)
  })

  return {
    content: listContent,
    component: compName,
    isComponentArray: isComponentArray
  }
}



/**
 * Get ResponseContentType
 * @param {*} contentType 
 * @returns 
 */
function transformResponseContentTypeDetail(c, props, parentEntityName) {
    let contentType = ''
    let _props = []
    let componentName = ''
    let req = []
    let items = {}
    let compName = ''
    let isComponentArray = false
 
    /// responses.<responseCode>.content.<contentType>
    contentType = c[0]

    if(c[1].schema !=null){
      // has #ref
      const ref = c[1].schema.$ref

      if(c[1].schema.type == 'object'){
        ''
      }

      if(c[1].schema.type == 'array'){
        isComponentArray = true
        if(c[1].schema.items) {
          componentName = c[1].schema.items.$ref? c[1].schema.items.$ref.split(RegExp(`^#/components/schemas/`))[1]:''
        }
      }

      let component = ''
      if(ref){
        component = ref.split(RegExp(`^#/components/schemas/`))[1]
      }

      /// responses.<responseCode>.content.schema.xml.name
      if(c[1].schema.xml)
        componentName =  c[1].schema.xml.name 
      else component

      /// responses.<responseCode>.content.schema.required
      req = c[1].schema.required
  
      /// responses.<responseCode>.content.schema.properties
      _props = c[1].schema.properties

      /// responses.<responseCode>.content.schema.items
      //items.type = c[1].schema.items ? c[1].schema.items.type : ''
      items = transformItems(c[1].schema.items, parentEntityName+'I')
      //items.properties = c[1].schema.items ? prop.transformProperties(c[1].schema.items.properties, []) : []
    }

    compName = _.capitalize(componentName)

    return {
        contentType: contentType,
        component: compName,
        isComponentArray : isComponentArray,
        required: req,
        
        properties: prop.transformProperties(_props, []),
        object: items
    }
}

function transformItems(items, parentEntityName){
  if (items){
    return {
      type: items.type ? items.type: '',
      name: parentEntityName,
      properties: items.properties? prop.transformProperties(items.properties, []) : [],
    }
  } else return {}
}


function getResponseType(responses, properties) {

   let responseType = 'void'
   // RESPONSE
   const _responses = responses;
   const code200 = _responses.find(e => e.code.slice(0,1) == 2) //'200' ||  e.code == '201')
   const responseContent = code200 ? code200 : {}
   let hasResponse = false
 
   if (responseContent) {
     if (responseContent.hasComponent){
       responseType = responseContent.name
       hasResponse =  true
     }
     else if(responseContent.properties && responseContent.properties.length >0 ){
       //responseType = findEqualObject(responseContent.properties, properties).name
       //responseType = _.capitalize(responseContent.content.items.type + '' + i)
       responseType = findEqualObject(responseContent.properties, properties).name
       responseType = responseContent.name
       hasResponse = true
     } 
   } else responseType = 'UnknownObject'

   return {
     hasResponse: hasResponse,
     responseType: responseType,
     isComponentArray: responseContent.isComponentArray
   }
}

/**
 * findEqualObject from array
 * @param {array} objects 
 * @param {object} properties 
 * @returns object which equals with properties instead []
 */
function findEqualObject(objects, properties) {
  let index = 0
  const obj =  _.filter(objects, (a,i) => {
    index = i
    return _.isEqual(a, properties)
  })

  return {name: 'Object'+index, object: obj, index: index}
}
