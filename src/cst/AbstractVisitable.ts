import { AbstractCstVisitor } from '@cst/visitors/AbstractCstVisitor';

export default abstract class AbstractVisitable<TVisitor extends AbstractCstVisitor> {
  abstract visit(visitor: TVisitor): void;
}
