import {CommonModel} from './CommonModel';

/**
 * This class is the wrapper for simplified models and the rest of the context needed to further generate typed models.
 */
export class CommonInputModel {
  models: {[key: string]: CommonModel} = {};
  originalInput: any = {};
}
