import Spin from './Spin';
declare const createConfig: (cwd: string, cmd: string, argv: any, builderName?: string) => {
    builders: {};
    spin: Spin;
};
export default createConfig;
