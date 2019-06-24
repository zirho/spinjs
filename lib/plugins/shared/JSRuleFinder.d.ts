import { Builder } from '../../Builder';
export default class JSRuleFinder {
    builder: Builder;
    jsRule: any;
    tsRule: any;
    constructor(builder: Builder);
    findJSRule(): any;
    createJSRule(): any;
    findAndCreateJSRule(): any;
    findTSRule(): any;
    createTSRule(): any;
    findAndCreateTSRule(): any;
    readonly extensions: string[];
}
