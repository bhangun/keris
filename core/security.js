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

// https://spec.openapis.org/oas/latest.html#securityRequirementObject

/* 
Example:
 {
  "type": "oauth2",
  "flows": {
    "implicit": {
      "authorizationUrl": "https://example.com/api/oauth/dialog",
      "scopes": {
        "write:pets": "modify pets in your account",
        "read:pets": "read your pets"
      }
    },
    "authorizationCode": {
      "authorizationUrl": "https://example.com/api/oauth/dialog",
      "tokenUrl": "https://example.com/api/oauth/token",
      "scopes": {
        "write:pets": "modify pets in your account",
        "read:pets": "read your pets"
      }
    }
  }
} 
*/

// const utils = require('./utils');


/**
 * Get security information
 * @param {*} api 
 * @Result type oauth2|http
 */
function getSecurity(api) {

    const schema = []
    if (api) Object.entries(api).forEach(sch => {
      let scopes = []
      let url = ''
      let typeName = sch[1].name ? sch[1].name : ''
      let position = sch[1].in ? sch[1].in : ''
      let protocol = sch[1].type? sch[1].type : ''
      let bearerFormat = sch[1].bearerFormat ? sch[1].bearerFormat : ''
      let type = sch[1].scheme ? sch[1].scheme : ''  
      let tokenUrl = ''

      if (sch[1].flows) {
        const flows = sch[1].flows
        if (flows.implicit){
          scopes = getScopes(flows.implicit.scopes)
          url = sch[1].flows.implicit.authorizationUrl
        }
        if(flows.authorizationCode){
          scopes = getScopes(flows.authorizationCode.scopes)
          url = flows.implicit.authorizationUrl == flows.authorizationCode.authorizationUrl ? flows.authorizationCode.authorizationUrl : flows.authorizationCode.authorizationUrl
          tokenUrl = flows.authorizationCode.tokenUrl
        }
      }
  
      schema.push({
        name: sch[0],
        protocol: protocol,
        typeName: typeName,
        type: type,
        position : position,
        bearerFormat : bearerFormat,
        url: url,
        tokenUrl: tokenUrl,
        in: position,
        scopes: scopes
      })
    })

    return schema
}


/**
 * Mapping scopes
 * @param {*} input 
 * @returns 
 */
function getScopes(scope) {
  const scopes = []
  if (scope) Object.entries(scope).forEach(s => {
    const scope = s[0]?s[0].split(':'):''
    scopes.push({
      scope: scope[0],
      object: scope[1],
      description: s[1]
    })
  })
  return scopes
}

  
module.exports = {
  getSecurity,
  getScopes
};


  