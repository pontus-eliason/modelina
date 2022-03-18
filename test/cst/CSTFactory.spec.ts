import {} from '@cst/CSTFactory';
import * as Java from '@cst/java';
import {JavaCstRenderer} from '@cst/renderers/JavaCstRenderer';

describe('JavaCstRenderer', () => {
  test('generate class string', () => {
    const nClass = new Java.ClassDeclaration(
      new Java.Identifier('ModelA'),
      new Java.Block(
        new Java.FieldGetterSetter(new Java.Type('java.util.UUID'), new Java.Identifier('id'))
      )
    );

    const renderer = new JavaCstRenderer();

    const str = renderer.render(nClass);

    console.log(str);
  });
});
