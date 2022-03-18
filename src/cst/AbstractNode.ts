import { AbstractCstVisitor } from '@cst/visitors/AbstractCstVisitor';
import AbstractVisitable from '@cst/AbstractVisitable';

export default abstract class AbstractNode<TVisitor extends AbstractCstVisitor> extends AbstractVisitable<TVisitor> {

}
