import {AbstractGenerator, CommonGeneratorOptions, defaultGeneratorOptions} from '../AbstractGenerator';
import {CommonInputModel, CommonModel, RenderOutput} from '../../models';
import {CommonNamingConvention, CommonNamingConventionImplementation, ModelKind, TypeHelpers} from '../../helpers';
import {JavaScriptPreset, JS_DEFAULT_PRESET} from './JavaScriptPreset';
import {ClassRenderer} from './renderers/ClassRenderer';
import {Logger} from '../../';

export interface JavaScriptOptions extends CommonGeneratorOptions<JavaScriptPreset> {
  namingConvention?: CommonNamingConvention
}

export interface JavaScriptRenderCompleteModelOptions {
  moduleSystem?: 'ESM' | 'CJS';
}

/**
 * Generator for JavaScript
 */
export class JavaScriptGenerator extends AbstractGenerator<JavaScriptOptions, JavaScriptRenderCompleteModelOptions> {
  static defaultOptions: JavaScriptOptions = {
    ...defaultGeneratorOptions,
    defaultPreset: JS_DEFAULT_PRESET,
    namingConvention: CommonNamingConventionImplementation
  };

  constructor(
    options: JavaScriptOptions = JavaScriptGenerator.defaultOptions,
  ) {
    super('JavaScript', JavaScriptGenerator.defaultOptions, options);
  }
  
  /**
   * Render a complete model result where the model code, library and model dependencies are all bundled appropriately.
   *
   * @param model
   * @param inputModel
   * @param options
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async renderCompleteModel(model: CommonModel, inputModel: CommonInputModel, options: JavaScriptRenderCompleteModelOptions): Promise<RenderOutput> {
    const outputModel = await this.render(model, inputModel);
    let modelDependencies = model.getNearestDependencies();
    //Ensure model dependencies have their rendered name
    modelDependencies = modelDependencies.map((dependencyModelName) => {
      return this.options.namingConvention?.type ? this.options.namingConvention.type(dependencyModelName, { inputModel, model: inputModel.models[String(dependencyModelName)] }) : dependencyModelName;
    });
    //Filter out any dependencies that is recursive to it'self
    modelDependencies = modelDependencies.filter((dependencyModelName) => {
      return dependencyModelName !== outputModel.renderedName;
    });
    //Create the correct dependency imports
    modelDependencies = modelDependencies.map((formattedDependencyModelName) => {
      if (options.moduleSystem === 'CJS') {
        return `const ${formattedDependencyModelName} = require('./${formattedDependencyModelName}');`;
      }
      return `import ${formattedDependencyModelName} from './${formattedDependencyModelName}';`;
    });
    let modelCode = `${outputModel.result}
export default ${outputModel.renderedName};
`;
    if (options.moduleSystem === 'CJS') {
      modelCode = `${outputModel.result}
module.exports = ${outputModel.renderedName};`;
    }
    const outputContent = `${[...modelDependencies, ...outputModel.dependencies].join('\n')}

${modelCode}`;
    return RenderOutput.toRenderOutput({ result: outputContent, renderedName: outputModel.renderedName, dependencies: outputModel.dependencies });
  }

  render(model: CommonModel, inputModel: CommonInputModel): Promise<RenderOutput> {
    const kind = TypeHelpers.extractKind(model);
    if (kind === ModelKind.OBJECT) {
      return this.renderClass(model, inputModel);
    }
    Logger.warn(`JS generator, cannot generate model for '${model.$id}'`);
    return Promise.resolve(RenderOutput.toRenderOutput({result: '', renderedName: '', dependencies: []}));
  }

  async renderClass(model: CommonModel, inputModel: CommonInputModel): Promise<RenderOutput> {
    const presets = this.getPresets('class'); 
    const renderer = new ClassRenderer(this.options, this, presets, model, inputModel);
    const result = await renderer.runSelfPreset();
    const renderedName = renderer.nameType(model.$id, model);
    return RenderOutput.toRenderOutput({result, renderedName, dependencies: renderer.dependencies});
  }
}
