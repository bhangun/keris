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
const rs = require('./responses');
//const prop = require('./properties');

module.exports = {
    transformPaths
};

/**
 * Mapping path to be use as services
 * @param {*} api Api root
 */
function transformPaths(api, props, entitiesFromResponse, entitiesFromRequest) {
    const paths = []
    let i = 0
    if (api) Object.entries(api.paths).forEach(path => {
        let param = ''
        param = path[0] ? splitParam(path[0]) : ''

        const hasParam = path[0].split('{').length > 1
        paths.push({
          pathOrigin: path[0],
          path: param,
          hasParam: hasParam,
          methods: getPathMethod(path[1], props, entitiesFromResponse, i, entitiesFromRequest)
        })
        i++
    })
    return paths
}

/**
 * Get Path method
 * @param {*} path path
 */
 function getPathMethod(path, props, entitiesFromResponse, i, entitiesFromRequest) {
    const methods = []
    
    let index = 0

    if (path) Object.entries(path).forEach(method => {
      const m = method[1];
      const reqContentType = []
     /*  let typeRequest = ''
      let required = []
      let _properties = [] 
      
      */
      entitiesFromRequest
  
      if (m.requestBody){
        Object.entries(m.requestBody.content).forEach(c => {
          
          /**  requestBody.content.<contentType> */
          reqContentType.push(c[0])
  
          /// requestBody.content.schema.xml
          typeRequest = c[1].schema.xml ? c[1].schema.xml.name : ''
  
          /// requestBody.content.<contentType>.schema.required
          required = c[1].schema.required
  
          /// requestBody.content.<contentType>.schema.properties
          _properties = c[1].schema.properties ? c[1].schema.properties : []
        })
      }
  
      methods.push({
  
        /// paths.<path>.<method>
        method: method[0],

        name: m.tags && m.tags.length > 0 ? m.tags[0]:'',
  
        /// List parameter
        parameters: m.parameters,
  
        /// paths.<path>.<method>.tags
        tags: m.tags,

        tag: m.tags != null && m.tags.length > 0 ? m.tags[0] : '',
  
        /// paths.<path>.<method>.summary
        summary: m.summary,
  
        /// paths.<path>.<method>.description
        // description: m.description,
  
        /// paths.<path>.<method>.operationId
        operationId: _.camelCase(m.operationId),
  
        /// Request Body -> All included
        /// requestBody.content
        //requestBody: getRequestBody(m.requestBody, typeRequest, reqContentType, required, _properties, props),
        
        requestBody: rs.transformContentType(m.requestBody.content),

        // Response
        responses: rs.transformResponses(m, props, index, entitiesFromResponse, i),

        security: m.security? securityEachMethod(m.security) : []
      })
      index++
    })

  return methods
}


function securityEachMethod(security){
  
  let securityNew = []
  security.forEach(sec => {
    let secType = ''
    let roles = []
    Object.entries(sec).forEach(s => {
      secType = s[0]
      if(s[1] && s[1].length > 1){
        s[1].forEach(r => {
          roles.push(splitRoles(r))
        })
      }
    })
    securityNew.push({
      type: secType,
      roles: roles
    })
  })
  return securityNew
}

function splitRoles(roles){
  if(roles && roles.split(':').length > 1){
    return {
      role: roles[0],
      object: roles[1],
      origin: roles
    }
  } 
}

/**
 * Contain all RequestBody element
 * @param {*} requestBody 
 * @param {*} typeRequest 
 * @param {*} reqContentType 
 * @param {*} required 
 * @param {*} properties 
 * @returns 
 */
/* function getRequestBody(requestBody, typeRequest, reqContentType, required, properties, props) {
  const getprop = prop.transformProperties(properties, required)

  props.push(getprop)

  return {
    required: required,
    component: _.capitalize(typeRequest),
    description: requestBody ? requestBody.description : '',
    contentType: reqContentType,
    properties: getprop
  }
} */
  
/**
 * Split Parameter
 * @param {*} path 
 * @returns 
 */
function splitParam(path) {
    return path.replaceAll('{', '${')
}
  