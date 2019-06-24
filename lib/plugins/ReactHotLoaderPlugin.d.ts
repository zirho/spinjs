import { Builder } from '../Builder';
import { ConfigPlugin } from '../ConfigPlugin';
import Spin from '../Spin';
export default class ReactHotLoaderPlugin implements ConfigPlugin {
    configure(builder: Builder, spin: Spin): void;
}
