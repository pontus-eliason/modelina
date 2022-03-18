import AbstractNode from '@cst/AbstractNode';

export abstract class AbstractCstVisitor {
  visit(node: AbstractNode<this>): void {
    // Generic
  }
}
