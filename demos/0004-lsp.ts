// demos/0004-lsp.ts — Liskov Substitution Principle
// Run: npm run demo:lsp

export {};

class Rectangle {
  constructor(protected width: number, protected height: number) {}

  setWidth(width: number): void {
    this.width = width;
  }

  setHeight(height: number): void {
    this.height = height;
  }

  dimensions(): { width: number; height: number } {
    return { width: this.width, height: this.height };
  }

  area(): number {
    return this.width * this.height;
  }
}

// It type-checks, but breaks Rectangle's promise that each setter changes one dimension.
class Square extends Rectangle {
  constructor(size: number) {
    super(size, size);
  }

  override setWidth(width: number): void {
    this.width = width;
    this.height = width;
  }

  override setHeight(height: number): void {
    this.width = height;
    this.height = height;
  }
}

function resizeAsRectangle(rectangle: Rectangle) {
  rectangle.setWidth(5);
  rectangle.setHeight(4);
  return { ...rectangle.dimensions(), area: rectangle.area() };
}

console.log('Rectangle expectation:', resizeAsRectangle(new Rectangle(2, 3)));
console.log('Square substitution:  ', resizeAsRectangle(new Square(3)));

// Better: model the shared promise clients actually need.
interface Shape {
  area(): number;
}

interface IndependentlyResizableRectangle extends Shape {
  setWidth(width: number): void;
  setHeight(height: number): void;
  dimensions(): { width: number; height: number };
}

class SafeRectangle implements IndependentlyResizableRectangle {
  constructor(private width: number, private height: number) {}

  setWidth(width: number): void {
    this.width = width;
  }

  setHeight(height: number): void {
    this.height = height;
  }

  dimensions(): { width: number; height: number } {
    return { width: this.width, height: this.height };
  }

  area(): number {
    return this.width * this.height;
  }
}

class SafeSquare implements Shape {
  constructor(private size: number) {}

  area(): number {
    return this.size * this.size;
  }
}

function totalArea(shapes: Shape[]): number {
  return shapes.reduce((total, shape) => total + shape.area(), 0);
}

console.log('Shared Shape contract, total area:', totalArea([
  new SafeRectangle(5, 4),
  new SafeSquare(3),
]));
