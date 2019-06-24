import { Builders } from './Builder';
import { ConfigPlugin } from './ConfigPlugin';
import Spin from './Spin';
export default class BuilderDiscoverer {
    private configReader;
    private cwd;
    private argv;
    constructor(spin: Spin, plugins: ConfigPlugin[], argv: any);
    discover(): Builders;
    private _discoverRecursively;
    private _detectRootPaths;
}
