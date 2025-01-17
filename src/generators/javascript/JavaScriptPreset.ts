import {ClassPreset, Preset} from '../../models';

import {ClassRenderer, JS_DEFAULT_CLASS_PRESET} from './renderers/ClassRenderer';

export type JavaScriptPreset = Preset<{
  class: ClassPreset<ClassRenderer>;
}>;

export const JS_DEFAULT_PRESET: JavaScriptPreset = {
  class: JS_DEFAULT_CLASS_PRESET,
};
