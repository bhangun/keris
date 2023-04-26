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
const SwaggerParser = require("@apidevtools/swagger-parser");
const path = require('./path');
const sec = require('./security');
const parser = require('./parser');
const utils = require('./utils');
const rs = require('./responses');

module.exports = {
    payloadKeris,
    transformApi,
    mappingEntities,
    mappingFields,
    transformType,
    otherEntity
};


/**
 * Mapping all api element to kujang schema
 * @param {*} api 
 * @param {*} appsName 
 * @returns Entity{
    appsName: '',
    baseName: '',
    packageFolder: '',
    info: {},
    servers: {},
    securitySchemes:  {},
    tags: [{}],
    paths: [{}],
    entities: [{}]
    properties: [{}]
  }
 */
function payloadKeris(api, appsName) {
    const props = []
    const entitiesFromRequest = []
    const entitiesFromResponse = []
    const uniqprop =  utils.uniqProperties(props)
    const properties = uniqprop? uniqprop :[]
    const paths = path.transformPaths(api, props, entitiesFromResponse, entitiesFromRequest)
    const services = mappingServices(paths, api, 'dart', properties )
    const entities = mappingEntities(appsName, api, entitiesFromResponse, entitiesFromRequest)
    

    const schema =  {
        appsName: appsName,
        baseName: appsName,
        packageFolder: appsName,
        info: api.info,
        endpoint: getEndpoint(api),
        security: api.components ? sec.getSecurity(api.components.securitySchemes) : {},
        //tags: api.tags,
        services: services,
        //paths: paths, 
        entities: entities.length > 0 ? entities: entityFromProperties(uniqprop),
        properties: properties
    }

    return schema
}

/**
 * Mapping component to be entities and as repositories
 * @param {*} appsName Application name
 * @param {*} api OpenAPi object
 * @returns entites
 */
function mappingEntities(appsName, api, entitiesFromResponse) {

    const schema = api.components ? api.components.schemas : null
    const entities = []
  
    entitiesFromResponse.forEach(entity => {
      entities.push({
        appsName: appsName,
        pkType: 'String',
        relationships: [],
        entityName: entity.name,
        entityClass: _.capitalize(entity.name),
        entityInstance: _.camelCase(entity.name),
        entityFolderName: _.camelCase(entity.name),
        entityFileName: _.camelCase(entity.name),
        enableTranslation: false,
        fields: mappingFields(entity, true)
        })
    })

    if (schema) Object.entries(schema).forEach(entity => {
        entities.push({
          appsName: appsName,
          pkType: 'String',
          relationships: [],
          entityName: entity[0],
          entityClass: _.capitalize(entity[0]),
          entityInstance: _.camelCase(entity[0]),
          entityFolderName: _.camelCase(entity[0]),
          entityFileName: _.camelCase(entity[0]),
          enableTranslation: false,
          fields: mappingFields(entity[1])
        })
    })
    return entities
}

/**
 * Mapping fiels as properties of entity
 * @param {*} obj 
 * @param {*} entities 
 * @returns 
 */
function mappingFields(obj, isFieldFromResponse) {
    const fields = []

    if (obj.properties){

        if(!isFieldFromResponse){
          Object.entries(obj.properties).forEach(field => {
          fields.push({
            fieldType: parser.parse(field[1], field[1].enum),
            fieldName: _.camelCase(field[0]),
            fieldIsEnum: field[1].enum ? true : false,
            fieldValues: _.join(field[1].enum, ','),
            fieldDescription: field[1].description,
            fieldsContainOneToMany: false,
            fieldsContainOwnerManyToMany: false,
            fieldsContainOwnerOneToOne: false,
            fieldsContainNoOwnerOneToOne: false,
            fieldsContainManyToOne: false
          })
        })
        } else {
          obj.properties.forEach(field => {
     
            fields.push({
              fieldType: parser.parse(field),
              fieldName: _.camelCase(field.name),
              fieldIsEnum: field.enum ? true : false,
              fieldValues: _.join(field.enum, ','),
              fieldDescription: field.description,
              fieldsContainOneToMany: false,
              fieldsContainOwnerManyToMany: false,
              fieldsContainOwnerOneToOne: false,
              fieldsContainNoOwnerOneToOne: false,
              fieldsContainManyToOne: false
            })
          })
        }
  }
  
  return fields
}


/**
 * 
 * @param {*} appsName 
 * @param {*} path 
 * @param {*} callback 
 */
function transformApi(appsName, path, callback) {

    SwaggerParser.bundle(path, 
        /* 
        resolve: {
            file: false,                    // Don't resolve local file references
            http: {
            timeout: 2000,                // 2 second timeout
            withCredentials: true,        // Include auth credentials when resolving HTTP references
            }
        },
        dereference: {
            circular: false                 // Don't allow circular $refs
        },
        validate: {
            spec: false                     // Don't validate against the Swagger spec
        }
        }, */
        {
            continueOnError: true,            // Don't throw on the first error
            parse: {
                json: true,                    // Enable the JSON parser
                yaml: {
                allowEmpty: false             // Don't allow empty YAML files
                },
                text: {
                canParse: [".txt", ".html", ""],  // Parse .txt and .html files as plain text (strings)
                encoding: 'utf16'             // Use UTF-16 encoding
                }
            },
            dereference: {
                circular: false
            }
        },
        (err, api) => {
        if (err) {
            console.error(err);
        }
        else {
            callback(payloadKeris(api, appsName), api)
        }
    })
}

/**
 * 
 * @param {*} paths 
 * @returns 
 */
function mappingServices(paths, api, lang, properties) {

    const services = []
    for (const i in paths) {
      for (const m in paths[i].methods) {
        const tag = paths[i].methods[m].tags[0]
        const serviceName = ('serv'+i+tag+m).replace(/[^a-z0-9]/gi,'');
      
        let externalDoc = ''
        let description = ''
        const response = rs.getResponseType(paths[i].methods[m].responses, properties)

        let responseType = response.responseType

        // PARAMETER
        const param = transformParam(paths[i].methods[m], responseType, lang);

        const method = transformMethod(paths[i].methods[m].method, param);
        
        const parameters = param.param;
        const query = param.query;
        const optId = paths[i].methods[m].operationId 

        for (const t in api.tags){
          if (api.tags[t].name == tag){
            externalDoc = api.tags[t].externalDoc
            description = api.tags[t].description
          }
        }

        services.push({
            index: i, 
            path: paths[i].path ? paths[i].path : '',
            serviceName: optId ? optId : serviceName,
            method: method.method,
            summary: paths[i].methods[m].summary ? paths[i].methods[m].summary : '',
            desc: paths[i].methods[m].description ? paths[i].methods[m].description : description,
            responseType: responseType,
            hasResponse: response.hasResponse,
            isResponseCompArray: response.isResponseCompArray,
            parametersString: parameters,
            parameterItems: param.paramItems,
            query: query,
            requestPayload: method.payload,
            requestPayloadStatement: method.payloadStatement,
            onlyParam: method.onlyParam,
            jsonParam: method.jsonParam,

            name: paths[i].methods[m].name,     
            parameters: paths[i].methods[m].parameters,
            tag: tag,
            externalDoc : externalDoc,
            operationId: optId ? optId : serviceName,
            requestBody: paths[i].methods[m].requestBody.content,
            responses: paths[i].methods[m].responses
        })
      }
    }
    return services
}


/**
 * 
 * @param {*} input 
 * @param {*} resType 
 * @returns 
 */
function transformParam(input, resType, lang) {
  let result = {}
  let paramType = '';
  let param = {}
  let isProp = false
  let onlyParam = ''
  let dartParam = ''
  let jsonParam = ''
  let query = ''
  let payloadStatement = 'const ' + resType? resType.toLowerCase() : '' + ' = ' + resType + '(';

  let newParameters = []


  if (input.parameters){
    param = input.parameters
  }
  else {
    param = input.requestBody.properties;
    isProp = true
  }

  if (param) {

    let required = ''
    let n = param.length
    let comma = ''
    let andDelimeter = '';
    let queryIndex = 0;

    if (param.required)
    required = '@required '

    for (const p in param) {

      const paramName = param[p].name 

      const _type = isProp ? parser.parse(param[p], lang).type : parser.parse(param[p].schema, lang).type

      paramType += comma + required + _type + '? ' + paramName;

      //paramType += tranformParamType(param[p], paramName, required, isProp, comma, lang)

      onlyParam += comma + paramName

      dartParam += comma + paramName + ': ' + paramName;

      jsonParam += comma + '"'+paramName + '": '+ isString(_type, paramName);

      query = transformQuery(param[p], paramName, andDelimeter, queryIndex)

      n--;

      if (n > 0){
        comma = ', '
      }

  
      newParameters.push({
        name : param[p].name,
        in: param[p].in,
        description: param[p].description,
        required: param[p].required,
        type: _type,
        isTypeArray: param[p].schema && param[p].schema.type == 'array' ? true: false,
        originType: param[p].schema
      })
    }
  }

  // add parameter if there is payload
  if (resType !== 'void') {
    payloadStatement += onlyParam + ');'
  }

  if (query)
    query = '?' + query

  result = {
    param: paramType,
    paramItems: newParameters,
    query: query,
    payload: resType.toLowerCase(),
    payloadStatement: payloadStatement,
    onlyParam: onlyParam,
    dartParam: dartParam,
    jsonParam: jsonParam
  };
  return result
}

/* function tranformParamType(paramItem, paramName, required, isProp, comma, lang){
  let paramType = ''
  const _type = isProp ? parser.parse(paramItem, lang).type : parser.parse(paramItem.schema, lang).type

  paramType = comma + required + _type + '? ' + paramName;

  return paramType
} */

function transformQuery(paramItem, paramName, andDelimeter, queryIndex){
  let query = ''
  if (queryIndex > 0)
    andDelimeter = '%26'
  if (paramItem.in == 'query') {
    query += andDelimeter + paramName + '=$' + paramName
    queryIndex++;
  }
  return query
}
  
  
function isString(type, param){
    if(type ==='String' || type ==='string')
      return '"$'+param+'"'
    else
      return param
}
  
/**
 * 
 * @param {*} m 
 * @returns 
 */
function transformMethod(m, param) {

  let method = m;
  let payload = '';
  let payloadStatement = '';
  let onlyParam = ''
  let jsonParam = ''

  if (m == 'put')
    method = 'update';
  else if (m == 'get')
    method = 'fetch';


  if (m == 'post' || m == 'update' || method === 'update') {
    payload = ', ' + param.payload;
    payloadStatement = param.payloadStatement
    onlyParam = param.onlyParam
    jsonParam = ', json.encode({'+param.jsonParam+'})'
  }

  return {
    method: method,
    payload: payload,
    payloadStatement: payloadStatement,
    onlyParam: onlyParam,
    jsonParam: jsonParam
  };
}
  
/**
 * 
 * @param {*} paths 
 * @returns 
 */
function otherEntity(paths) {
  const responseTypes = [];
  for (const i in paths) {
    for (const m in paths[i].methods) {
      let responseType = ''
      // RESPONSE
      const responses = paths[i].methods[m].responses;
      const code200 = responses.find(e => e.code == '200')
      const responseContent = code200 ? code200 : {}

      if (responseContent.content.component)
        responseType = responseContent.content.component
      else if (responseContent.content.items.type)
        responseType = _.capitalize(responseContent.content.items.type + '' + i)
      else responseType = 'Object' + i
      

      responseTypes.push(
        {
          "appsName": responseType,
          "pkType": "String",
          "relationships": [],
          "entityName": _.capitalize(responseType),
          "entityClass": _.capitalize(responseType),
          "entityInstance": responseType,
          "entityFolderName": responseType,
          "entityFileName": responseType,
          "enableTranslation": false,
          "fields": otherFields(paths[i].methods[m])
        }
      )
    }
  }
  return responseTypes
}

/**
 * 
 * @param {*} input 
 * @returns 
 */
function otherFields(input) {
  let param = {}
  const fields = []
  let isProp = false

  if (input.parameters)
    param = input.parameters
  else {
    param = input.requestBody.properties;
    isProp = true
  }

  for (const p in param) {
    fields.push(
      {
        "fieldType": parser.parse(isProp ? param[p] : param[p].schema.type, false), //isProp ? param[p].type : param[p].schema.type, //
        "fieldName": param[p].name,
        "fieldIsEnum": false,
        "fieldValues": "",
        "fieldsContainOneToMany": false,
        "fieldsContainOwnerManyToMany": false,
        "fieldsContainOwnerOneToOne": false,
        "fieldsContainNoOwnerOneToOne": false,
        "fieldsContainManyToOne": false
      }
    )
  }
  return fields
}
  
  /**
   * entityFromProperties from properties
   * @param {array} properties 
   * @returns entities[]
   */
  function entityFromProperties(properties){
    const entities = []
    properties.forEach((el, i) =>{
      const fields = []
  
      const entity = {
          "appsName": this.appsName,
          "pkType": "String",
          "relationships": [],
          "entityName": 'Object'+i,
          "entityClass": 'Object'+i,
          "entityInstance": 'object'+i,
          "entityFolderName": 'object'+i,
          "entityFileName": 'object'+i,
          "enableTranslation": false,
          "fields": []
        }
      
      el.forEach( f =>{
          fields.push({
            "fieldType": parser.parse({type:f,isEnum: f.isEnum}, 'dart'),
            "fieldName": f.name,
            "fieldIsEnum": f.isEnum,
            "fieldValues": f.isEnum? f.enum:'',
            "fieldsContainOneToMany": false,
            "fieldsContainOwnerManyToMany": false,
            "fieldsContainOwnerOneToOne": false,
            "fieldsContainNoOwnerOneToOne": false,
            "fieldsContainManyToOne": false,
            "required": f.required,
          })
      })
  
      entity.fields = fields
  
      entities.push(entity)
    })
  
    return entities
  }
  
  /**
   * Get endpoint information
   */
  function getEndpoint(api) {
  
    var endpoint = api.servers !=null && api.servers.length == 1 && api.servers.length > 0? api.servers[0].url : 'localhost'
    var protocol = api.schemes !=null && api.schemes.length == 1 && api.schemes.length > 0? api.schemes[0] : 'http'
  
    const schema =  {
      url: endpoint,
      protocol: protocol,
      host: api.host ? api.host : '',
      basePath: api.basePath ? api.basePath : '',
      servers: api.servers,
      schemes: api.schemes
    }
  
    return schema
  }
  
/**
 * 
 * @param {*} type 
 * @param {*} lang 
 * @returns 
 */
function transformType(type, lang) {
  parser.parse(type, lang)
}