import { Builder } from '../Builder';
import { ConfigPlugin } from '../ConfigPlugin';
import Spin from '../Spin';
export default class VuePlugin implements ConfigPlugin {
    configure(builder: Builder, spin: Spin): void;
}
