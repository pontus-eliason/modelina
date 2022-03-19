import * as Java from '@cst/java';
import { JavaCstRenderer } from '@cst/renderers/JavaCstRenderer';
import { parse } from 'java-parser';
import { TestVisitor } from './TestVisitor';

describe('JavaCstRenderer', () => {
  test('generate class', () => {
    const nClass = new Java.ClassDeclaration(
      new Java.Identifier('ModelA'),
      new Java.Block(
        new Java.FieldGetterSetter(
          new Java.Type('java.util.UUID'),
          new Java.Identifier('id'),
          new Java.AnnotationList(
            new Java.Annotation(
              new Java.Type('Hello'),
              new Java.AnnotationKeyValuePairList(
                new Java.AnnotationKeyValuePair(new Java.Identifier('someKey'), new Java.Literal('A Value')),
                new Java.AnnotationKeyValuePair(new Java.Identifier('otherKey'), new Java.Literal(1.11))
              )
            )
          )
        ),
      )
    );

    const renderer = new JavaCstRenderer();
    const str = renderer.render(nClass);

    const cst = parse(str);
    expect(cst).toBeDefined();

    const visitor = new TestVisitor();
    visitor.visit(cst);

    expect(visitor.foundFields).toHaveLength(1);
    expect(visitor.foundLiterals).toHaveLength(2);
    expect(visitor.foundLiterals[0]).toEqual('"A Value"');
    expect(visitor.foundLiterals[1]).toEqual(1.11);
  });

  test('generate interface', () => {
    const nClass = new Java.InterfaceDeclaration(
      new Java.Identifier('InterfaceA'),
      new Java.Block(
        new Java.MethodDeclaration(
          new Java.Type('java.lang.String'),
          new Java.Identifier('getName')
        )
      )
    );

    const renderer = new JavaCstRenderer();

    const visitor = new TestVisitor();
    const rendered = renderer.render(nClass);
    visitor.visit(parse(rendered));

    expect(visitor.foundInterfaces).toHaveLength(1);
    expect(visitor.foundInterfaces[0]).toEqual('InterfaceA');
    expect(visitor.foundMethods).toHaveLength(1);
    expect(visitor.foundMethods[0]).toEqual('getName');
  });
});
