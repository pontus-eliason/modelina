import {AbstractCstVisitor} from '@cst/visitors/AbstractCstVisitor';
import AbstractVisitable from '@cst/AbstractVisitable';

export default abstract class AbstractToken<TVisitor extends AbstractCstVisitor> extends AbstractVisitable<TVisitor> {

}
