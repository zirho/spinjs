import { Builders } from './Builder';
import { ConfigPlugin } from './ConfigPlugin';
import Spin from './Spin';
export default class ConfigReader {
    private spin;
    private plugins;
    constructor(spin: Spin, plugins: ConfigPlugin[]);
    readConfig(filePath: string): Builders;
    private _createBuilders;
}
