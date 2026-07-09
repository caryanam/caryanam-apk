/**
 * @format
 */
import { TextEncoder, TextDecoder } from 'text-encoding';

Object.assign(global, {
  TextEncoder,
  TextDecoder,
});

import {AppRegistry} from 'react-native';
import App from './App';
import {name as appName} from './app.json';

AppRegistry.registerComponent(appName, () => App);
