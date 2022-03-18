/* eslint-disable */
import {JavaCstVisitor} from '@cst/visitors/JavaCstVisitor';
import * as Java from '@cst/java';
import {ModifierType, TokenType} from '@cst/java';
import AbstractNode from '@cst/AbstractNode';

export class JavaCstRenderer extends JavaCstVisitor {
  private stack: string[] = [];
  private depth: number = 0;

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

    const popped = this.stack.pop();
    if (popped === undefined) {
      throw new Error('Cannot pop is the stack is empty');
    }

    if (incrementedDepth) {
      this.depth--;
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

  private getIndentation(): string {
    return ' '.repeat(this.stack.length);
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

  visitBlock(node: Java.Block): void {

    this.push(true);
    super.visitBlock(node);
    const blockContent = this.pop(true);

    const indentation = this.getIndentation();
    const indentedBlockContent = indentation + blockContent.replace(/\n/, `\n${indentation}`);

    this.append(indentedBlockContent);
  }

  // visitBinaryExpression(node: Java.BinaryExpression) {
  //   super.visitBinaryExpression(node);
  // }

  visitFieldReference(node: Java.FieldReference) {
    this.append(`this.${this.pushAndPop(node.field.identifier)}`);
  }

  visitReturnStatement(node: Java.ReturnStatement) {
    this.append(`return ${this.pushAndPop(node.expression)};`);
  }

  visitToken(node: Java.JavaToken) {
    this.append(JavaCstRenderer.getTokenTypeString(node.type));
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

  visitClassDeclaration(node: Java.ClassDeclaration) {

    const comments = node.comments ? this.pushAndPop(node.comments) + '\n' : '';
    const annotations = node.annotations ? this.pushAndPop(node.annotations) + '\n' : '';
    const modifiers = this.pushAndPop(node.modifiers);
    const name = this.pushAndPop(node.name);
    const classExtension = node.extends ? ' ' + this.pushAndPop(node.extends) : '';
    const classImplementations = node.implements ? ' ' + this.pushAndPop(node.implements) : '';
    const body = this.pushAndPop(node.body);

    this.append(comments);
    this.append(annotations);
    this.append(`${modifiers} class ${name}${classExtension}${classImplementations} {\n`);
    this.append(body);
    this.append('\n}\n');
  }

  visitField(node: Java.Field): void {

    const modifierTypes = node.modifiers.modifiers.map(it => it.type).map(it => JavaCstRenderer.getModifierString(it));
    const modifiersJoined = modifierTypes.join(' ');

    const typeName = JavaCstRenderer.getTypeName(node.type);

    this.append(modifiersJoined);
    this.append(` ${typeName} `);
    this.append(node.identifier.value);
    this.append(';\n');
  }

  visitIdentifier(node: Java.Identifier) {
    this.append(node.value);
  }

  visitMethodDeclaration(node: Java.AbstractMethodDeclaration) {

    const comments = node.comments ? this.pushAndPop(node.comments) + '\n' : '';
    const annotations = node.annotations ? this.pushAndPop(node.annotations) + '\n' : '';
    const modifiers = this.pushAndPop(node.modifiers);
    const type = this.pushAndPop(node.type);
    const name = this.pushAndPop(node.name);
    const parameters = node.parameters ? this.pushAndPop(node.parameters) : '';
    const body = node.body ? this.pushAndPop(node.body, true) : '';

    this.append(comments);
    this.append(annotations);
    this.append(`${modifiers} ${type} ${name}(${parameters}) {\n`);
    this.append(body);
    this.append('\n}\n');
  }

  visitArgumentDeclaration(node: Java.ArgumentDeclaration): void {

    // TODO: Make this simpler by allowing to "visit" between things, so we can insert spaces or delimiters without tinkering inside the base visitor

    const annotations = node.annotations ? this.pushAndPop(node.annotations) + ' ' : '';
    const type =  this.pushAndPop(node.type);
    const identifier =this.pushAndPop(node.identifier);

    this.append(`${annotations}${type} ${identifier}`)
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
