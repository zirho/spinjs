import { Configuration } from 'webpack';
import { Builder } from './Builder';
export default class Spin {
    dev: boolean;
    test: boolean;
    watch: boolean;
    cmd: string;
    cwd: string;
    options: any;
    constructor(cwd: any, cmd: any);
    createConfig(builder: Builder, tool: string, config: any): Configuration;
    merge(config: any, overrides: any): Configuration;
    mergeWithStrategy(strategy: any, config: any, overrides: any): Configuration;
}
