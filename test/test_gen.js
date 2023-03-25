const GenBase = require('../core');
const packagejs = require('../package.json');

module.exports = class extends GenBase {
    constructor(args, opts) {
        super(args, opts);
        this.props = opts
        console.log('-----cons-----')
    }

    get init() {
        console.log('----init------')
         return this.initializing(this, this.props, packagejs)
    }

    compose() { 
       console.log('-----com-----')
     }
};


console.log(this)