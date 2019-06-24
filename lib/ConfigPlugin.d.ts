import Spin from './Spin';
export interface ConfigPlugin {
    configure(builder: any, spin: Spin): any;
}
