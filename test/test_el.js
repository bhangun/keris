const tags = require('../core/tags')
const sec = require('../core/security')

const name= "write:aba"
console.log(name.split(':'))

const scope =  {
    "write:pets": "modify pets in your account",
    "read:pets": "read your pets"
  }
console.log(sec.getScopes(scope))