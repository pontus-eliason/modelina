import * as Java from '@cst/java';
import { JavaCstRenderer } from '@cst/renderers/JavaCstRenderer';
import { parse } from 'java-parser';
import { TestVisitor } from '../TestVisitor';
import fs from 'fs';
import { Modelina } from '../../../src';

describe('renderCompleteService()', () => {
  test('Should be able to render a fully functional service', () => {
    const schemaContent = fs.readFileSync('test/schemas/openapi/full-service.yml').toString();

    expect(schemaContent).toBeDefined();

    const model =

    //fs.readFileSync('./');

    //expect(renderer.renderAnnotation('someComment', {test: 'test2'})).toEqual('@SomeComment(test=test2)');
  });
});
