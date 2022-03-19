/* eslint-disable */
import { JavaCstVisitor } from '@cst/visitors/JavaCstVisitor';
import * as Java from '@cst/java';
import { ModifierType, TokenType } from '@cst/java';
import AbstractNode from '@cst/AbstractNode';

export class JavaCstRenderer extends JavaCstVisitor {
  private stack: string[] = [''];
  private depth: number = 0;
  private readonly _lineStart = new RegExp(/(?<!$)^/mg);
  private _tokenPrefix = ' ';
  private _tokenSuffix = ' ';

  private append(str: string): void {
    this.stack[this.stack.length - 1] += str;
  }

  private push(incrementDepth: boolean = false) {
    this.stack.push('');
    if (incrementDepth) {
      this.depth++;
    }
  }

  private pop(incrementedDepth: boolean = false): string {

    if (incrementedDepth) {
      this.depth--;
    }

    const popped = this.stack.pop();
    if (popped === undefined) {
      throw new Error('Cannot pop is the stack is empty');
    }

    return popped;
  }

  private static getTypeName(type: Java.Type): string {
    return type.fqn;
  }

  private pushAndPop(node: AbstractNode<JavaCstRenderer>, incrementDepth: boolean = false): string {
    this.push(incrementDepth);
    node.visit(this);
    return this.pop(incrementDepth);
  }

  private getIndentation(d: number = this.depth): string {
    return '  '.repeat(d);
  }

  render(node: AbstractNode<this>): string {
    this.push();
    node.visit(this);
    return this.pop();
  }

  private static getModifierString(type: ModifierType) {
    switch (type) {
    case ModifierType.PUBLIC:
      return 'public';
    case ModifierType.PRIVATE:
      return 'private';
    case ModifierType.DEFAULT:
      return '';
    case ModifierType.PROTECTED:
      return 'protected';
    default:
      throw new Error('Unknown modifier type');
    }
  }

  visitFieldReference(node: Java.FieldReference) {
    this.append(`this.${this.pushAndPop(node.field.identifier)}`);
  }

  visitReturnStatement(node: Java.ReturnStatement) {
    this.append(`return ${this.pushAndPop(node.expression)};`);
  }

  visitToken(node: Java.JavaToken) {
    this.append(`${this._tokenPrefix}${JavaCstRenderer.getTokenTypeString(node.type)}${this._tokenSuffix}`);
  }

  private static getTokenTypeString(type: Java.TokenType) {
    switch (type) {
    case TokenType.ASSIGN:
      return '=';
    case TokenType.EQUALS:
      return '==';
    case TokenType.ADD:
      return '+';
    case TokenType.SUBTRACT:
      return '-';
    case TokenType.MULTIPLY:
      return '*';
    case TokenType.COMMA:
      return ',';
    default:
      throw new Error('Unknown token type');
    }
  }

  visitBlock(node: Java.Block): void {

    this.push(true);
    const indentation = this.getIndentation();
    super.visitBlock(node);
    const blockContent = this.pop(true);

    const indentedBlockContent = blockContent.replace(this._lineStart, indentation);

    this.append(indentedBlockContent);
  }

  visitCommonTypeDeclaration(node: Java.AbstractObjectDeclaration, typeType: string) {
    const modifiers = this.pushAndPop(node.modifiers);
    const name = this.pushAndPop(node.name);
    const classExtension = node.extends ? ' ' + this.pushAndPop(node.extends) : '';
    const classImplementations = node.implements ? ' ' + this.pushAndPop(node.implements) : '';

    this.append(node.comments ? this.pushAndPop(node.comments) + '\n' : '');
    this.append(node.annotations ? this.pushAndPop(node.annotations) + '\n' : '');
    this.append(`${modifiers} ${typeType} ${name}${classExtension}${classImplementations} {\n`);
    this.append(this.pushAndPop(node.body));
    this.append(`}\n`);
  }

  visitClassDeclaration(node: Java.ClassDeclaration) {
    this.visitCommonTypeDeclaration(node, 'class');
  }

  visitInterfaceDeclaration(node: Java.InterfaceDeclaration) {
    this.visitCommonTypeDeclaration(node, 'interface');
  }

  visitMethodDeclaration(node: Java.AbstractMethodDeclaration) {

    const comments = node.comments ? this.pushAndPop(node.comments) + '\n' : '';
    const annotations = node.annotations ? this.pushAndPop(node.annotations) + '\n' : '';
    const modifiers = this.pushAndPop(node.modifiers);
    const type = this.pushAndPop(node.type);
    const name = this.pushAndPop(node.name);
    const parameters = node.parameters ? this.pushAndPop(node.parameters) : '';
    const body = node.body ? this.pushAndPop(node.body) : '';

    this.append(comments);
    this.append(annotations);
    this.append(`${modifiers} ${type} ${name}(${parameters}) {\n`);
    this.append(body);
    this.append('\n}\n');
  }

  visitAnnotationList(node: Java.AnnotationList) {
    this.append(node.children.map(it => this.pushAndPop(it)).join('\n'));
  }

  visitAnnotation(node: Java.Annotation) {
    const pairs = node.pairs ? '(' + this.pushAndPop(node.pairs) + ')' : '';
    this.append(`@${this.pushAndPop(node.type)}${pairs}`);
  }

  visitAnnotationKeyValuePairList(node: Java.AnnotationKeyValuePairList) {
    this.append(node.children.map(it => this.pushAndPop(it)).join(', '));
  }

  visitAnnotationKeyValuePair(node: Java.AnnotationKeyValuePair) {
    const key = node.key ? this.pushAndPop(node.key) + ' = ' : '';
    this.append(`${key}${this.pushAndPop(node.value)}`);
  }

  visitLiteral(node: Java.Literal) {
    if (typeof node.value === 'string' || node.value instanceof String) {
      this.append(`"${node.value}"`);
    } else {
      this.append(`${node.value}`);
    }
  }

  visitFieldGetterSetter(node: Java.FieldGetterSetter) {
    super.visitFieldGetterSetter(node);
    this.append('\n');
  }

  visitField(node: Java.Field): void {

    const comments = node.comments ? this.pushAndPop(node.comments) + '\n' : '';
    const annotations = node.annotations ? this.pushAndPop(node.annotations) + '\n' : '';
    const modifiers = this.pushAndPop(node.modifiers);
    const typeName = this.pushAndPop(node.type);
    const initializer = node.initializer ? ' = ' + this.pushAndPop(node.initializer) : '';
    const identifier = this.pushAndPop(node.identifier);

    this.append(comments);
    this.append(annotations);
    this.append(`${modifiers} ${typeName} ${identifier}${initializer};\n`);
  }

  visitIdentifier(node: Java.Identifier) {
    this.append(node.value);
  }

  visitArgumentDeclaration(node: Java.ArgumentDeclaration): void {

    // TODO: Make this simpler by allowing to "visit" between things, so we can insert spaces or delimiters without tinkering inside the base visitor

    const annotations = node.annotations ? this.pushAndPop(node.annotations) + ' ' : '';
    const type = this.pushAndPop(node.type);
    const identifier = this.pushAndPop(node.identifier);

    this.append(`${annotations}${type} ${identifier}`);
  }

  visitBinaryExpression(node: Java.BinaryExpression) {
    super.visitBinaryExpression(node);
  }

  visitAssignExpression(node: Java.AssignExpression) {
    super.visitAssignExpression(node);
    // TODO: This is wrong. Need to find a better way!
    this.append(";");
  }

  visitArgumentDeclarationList(node: Java.ArgumentDeclarationList): void {
    this.append(node.children.map(it => this.pushAndPop(it)).join(', '));
  }

  visitTypeList(node: Java.TypeList): void {
    this.append(node.children.map(it => this.pushAndPop(it)).join(' '));
  }

  visitType(node: Java.Type): void {
    this.append(JavaCstRenderer.getTypeName(node));
  }

  visitModifierList(node: Java.ModifierList): void {
    this.append(node.modifiers.map(it => this.pushAndPop(it)).join(' '));
  }

  visitModifier(node: Java.Modifier): void {
    const modifierString = JavaCstRenderer.getModifierString(node.type);
    if (modifierString) {
      this.append(modifierString);
    }
  }
}
