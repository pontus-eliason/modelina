/* eslint-disable @typescript-eslint/ban-types */
import {AbstractRenderer} from '../AbstractRenderer';
import {CommonModel, CommonPreset, EnumPreset, Preset, PresetArgs} from '../../models';
import {GO_DEFAULT_STRUCT_PRESET, StructRenderer} from './renderers/StructRenderer';
import {EnumRenderer, GO_DEFAULT_ENUM_PRESET} from './renderers/EnumRenderer';

export enum FieldType {
  field,
  additionalProperty,
  patternProperties
}
export interface FieldArgs {
  fieldName: string;
  field: CommonModel;
  type: FieldType;
}

export interface StructPreset<R extends AbstractRenderer, O extends object = any> extends CommonPreset<R, O> {
  field?: (args: PresetArgs<R, O> & FieldArgs) => Promise<string> | string;
}

export type GoPreset = Preset<{
  struct: StructPreset<StructRenderer>;
  enum: EnumPreset<EnumRenderer>
}>;

export const GO_DEFAULT_PRESET: GoPreset = {
  struct: GO_DEFAULT_STRUCT_PRESET,
  enum: GO_DEFAULT_ENUM_PRESET,
};
