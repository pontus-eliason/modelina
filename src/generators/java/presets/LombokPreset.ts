import { JavaPreset } from '../JavaPreset';
import { PropertyType } from '@models';

export const JAVA_LOMBOK_PRESET: JavaPreset = {
  class: {
    self(args): Promise<string> | string {
      args.renderer.addDependency('import lombok.*;');
      args.renderer.addDependency('import lombok.experimental.*;');
      args.renderer.addDependency('import lombok.extern.jackson.*;');

      const lines = [];

      lines.push(args.renderer.renderAnnotation('Getter'));
      lines.push(args.renderer.renderAnnotation('FieldDefaults', 'level=AccessLevel.PRIVATE'));
      lines.push(args.renderer.renderAnnotation('AllArgsConstructor'));

      if (args.model.required) {
        lines.push(args.renderer.renderAnnotation('RequiredArgsConstructor'));
      }

      lines.push(args.renderer.renderAnnotation('ToString'));
      lines.push(args.renderer.renderAnnotation('EqualsAndHashCode'));
      lines.push(args.renderer.renderAnnotation('With'));
      lines.push(args.renderer.renderAnnotation('Builder'));
      lines.push(args.renderer.renderAnnotation('Jacksonized'));

      lines.push(args.content);

      return args.renderer.renderBlock(lines);
    },
    property(args): Promise<string> | string {
      const lines = [];

      if (args.type === PropertyType.additionalProperty) {
        lines.push(args.renderer.renderAnnotation('JsonAnySetter'));
        lines.push(args.renderer.renderAnnotation('Getter', 'onMethod_ = @JsonAnyGetter'));
        lines.push(args.renderer.renderAnnotation('Singular', '"additionalProperty"'));
      }

      let typeName = args.renderer.renderType(args.property);
      if (args.type === PropertyType.additionalProperty || args.type === PropertyType.patternProperties) {
        // Is there some way to handle the map key type?
        typeName = `Map<String, ${typeName}>`;
      }

      let finalModifier = '';
      if (args.model.isRequired(args.propertyName)) {
        finalModifier = 'final ';
      }

      lines.push(`${finalModifier + typeName} ${args.renderer.nameProperty(args.propertyName)};`);

      return args.renderer.renderBlock(lines, 1);
    },
    getter() {
      return '';
    },
    setter(): Promise<string> | string {
      return '';
    },
  }
};
