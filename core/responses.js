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
  transformContentType,
  transformContentTypeDetail,
  getResponseType
};


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
    isResponseCompArray: responseContent.isResponseCompArray
  }
}

/**
 * Mapping responses
 * @param {*} list 
 * @returns 
 */
function transformResponses(list, props, index, entitiesFromResponse, i) {
    const responses = []
    if (list)
        Object.entries(list.responses).forEach(r => {
           
          let headersType = []
          const responseCode = r[0]
          const name = 'R'+i+'A'+index+'B'+Math.random().toString(36).slice(-4)+responseCode

          const content = r[1].content ? transformContentType(r[1].content, entitiesFromResponse, name) : []

          if (r[1].headers){
            Object.entries(r[1].headers).forEach(c => {
              headersType.push(c[0])
            })
          }

          if(content.properties && content.properties.length > 0) {
            entitiesFromResponse.push({
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

              isResponseCompArray: content.isResponseCompArray,

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
function transformContentType(content, entitiesFromResponse, parentEntityName) {
  const listContent = []
  let compName = ''
  let isResponseCompArray = false
  let properties = {}
  if (content) Object.entries(content).forEach(c => {
    const contentItem = transformContentTypeDetail(c, entitiesFromResponse, parentEntityName)
    compName = contentItem ? contentItem.component : ''
    isResponseCompArray = contentItem.isResponseCompArray
    listContent.push(contentItem)
    properties = contentItem.properties
  })

  return {
    content: listContent,
    component: compName,
    isResponseCompArray: isResponseCompArray,
    properties: properties
  }
}



/**
 * Get ResponseContentType
 * @param {*} contentType 
 * @returns 
 */
function transformContentTypeDetail(c, entitiesFromResponse, parentEntityName) {
    let contentType = ''
    let localProperties = []
    let componentName = ''
    let req = []
    //let items = {}
    let compName = ''
    let isResponseCompArray = false
    let responseContentTypeDetail = {}
 
    /// responses.<responseCode>.content.<contentType>
    contentType = c[0]

    if(c[1].schema !=null){
      // has #ref
      const ref = c[1].schema.$ref

      if(c[1].schema.type == 'object'){
        ''
      }

      if(c[1].schema.type == 'array'){
        isResponseCompArray = true
        if(c[1].schema.items) {
          componentName = c[1].schema.items.$ref? c[1].schema.items.$ref.split(RegExp(`^#/components/schemas/`))[1]:''
        }
      }

      let component = ''
      if(ref){
        component = ref.split(RegExp(`^#/components/schemas/`))[1]
      }

      /// responses.<responseCode>.content.schema.xml.name
      if(c[1].schema.xml){
        componentName =  c[1].schema.xml.name 
        compName = _.capitalize(componentName)
      } else {
        compName = component
      }

      /// responses.<responseCode>.content.schema.required
      req = c[1].schema.required
  
      /// responses.<responseCode>.content.schema.properties
      localProperties = c[1].schema.properties

      /// responses.<responseCode>.content.schema.items
      const itemsProperties = transformItems(c[1].schema.items, parentEntityName+'I')
      
      if(itemsProperties && itemsProperties.name){
        compName = itemsProperties.name
        entitiesFromResponse.push(itemsProperties)
      }

      
    }


    responseContentTypeDetail = {
        contentType: contentType,
        component: compName,
        isResponseCompArray : isResponseCompArray,
        required: req,
        
        properties: prop.transformProperties(localProperties, []),

        //object: items
    }

    return responseContentTypeDetail
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
