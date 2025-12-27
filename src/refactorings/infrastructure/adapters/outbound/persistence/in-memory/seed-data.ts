import { RefactoringShowcase } from '../../../../../domain/entities/refactoring-showcase.entity';
import { RefactoringStep } from '../../../../../domain/entities/refactoring-step.entity';
import { RefactoringFile } from '../../../../../domain/value-objects/refactoring-file.vo';
import { DifficultyLevel } from '../../../../../domain/value-objects/difficulty-level.vo';

export const seedRefactoringShowcases: RefactoringShowcase[] = [
  new RefactoringShowcase({
    id: '1',
    title: 'Extract Method Refactoring',
    description:
      'Transform a long method into smaller, focused methods following the Single Responsibility Principle',
    technologies: ['TypeScript', 'Node.js'],
    difficulty: DifficultyLevel.BEGINNER,
    tags: ['clean-code', 'code-smell', 'readability', 'srp'],
    order: 0,
    isHighlighted: true,
    steps: [
      new RefactoringStep({
        id: 's1',
        showcaseId: '1',
        title: 'Initial Code',
        description:
          'Long method doing validation, calculation, and formatting',
        explanation:
          'This method violates Single Responsibility Principle by handling validation, calculation, and formatting. Each responsibility should be extracted into its own method for better readability and maintainability.',
        order: 0,
        files: [
          new RefactoringFile({
            filename: 'order-service.ts',
            language: 'typescript',
            content: `export class OrderService {
  processOrder(order: Order): string {
    // Validation
    if (!order.items || order.items.length === 0) {
      throw new Error('Order must have items');
    }
    if (!order.customer) {
      throw new Error('Order must have customer');
    }

    // Calculate total
    let total = 0;
    for (const item of order.items) {
      total += item.price * item.quantity;
    }
    const tax = total * 0.1;
    const finalTotal = total + tax;

    // Format result
    return \`Order for \${order.customer.name}: $\${finalTotal.toFixed(2)}\`;
  }
}`,
            order: 0,
          }),
        ],
      }),
      new RefactoringStep({
        id: 's2',
        showcaseId: '1',
        title: 'Extract Validation',
        description: 'Move validation logic to separate method',
        explanation:
          'First step: extract validation into dedicated method. This makes the main method clearer and the validation logic reusable. Now each method has a clear purpose.',
        order: 1,
        files: [
          new RefactoringFile({
            filename: 'order-service.ts',
            language: 'typescript',
            content: `export class OrderService {
  processOrder(order: Order): string {
    this.validateOrder(order);

    // Calculate total
    let total = 0;
    for (const item of order.items) {
      total += item.price * item.quantity;
    }
    const tax = total * 0.1;
    const finalTotal = total + tax;

    // Format result
    return \`Order for \${order.customer.name}: $\${finalTotal.toFixed(2)}\`;
  }

  private validateOrder(order: Order): void {
    if (!order.items || order.items.length === 0) {
      throw new Error('Order must have items');
    }
    if (!order.customer) {
      throw new Error('Order must have customer');
    }
  }
}`,
            order: 0,
          }),
        ],
      }),
      new RefactoringStep({
        id: 's3',
        showcaseId: '1',
        title: 'Extract Calculation',
        description: 'Move calculation logic to separate method',
        explanation:
          'Second step: extract total calculation for reusability. The calculation logic can now be tested independently and reused elsewhere if needed.',
        order: 2,
        files: [
          new RefactoringFile({
            filename: 'order-service.ts',
            language: 'typescript',
            content: `export class OrderService {
  processOrder(order: Order): string {
    this.validateOrder(order);
    const finalTotal = this.calculateTotal(order);
    return \`Order for \${order.customer.name}: $\${finalTotal.toFixed(2)}\`;
  }

  private validateOrder(order: Order): void {
    if (!order.items || order.items.length === 0) {
      throw new Error('Order must have items');
    }
    if (!order.customer) {
      throw new Error('Order must have customer');
    }
  }

  private calculateTotal(order: Order): number {
    let total = 0;
    for (const item of order.items) {
      total += item.price * item.quantity;
    }
    const tax = total * 0.1;
    return total + tax;
  }
}`,
            order: 0,
          }),
        ],
      }),
      new RefactoringStep({
        id: 's4',
        showcaseId: '1',
        title: 'Final Refactored Code',
        description: 'Clean, focused methods with single responsibilities',
        explanation:
          'Final step: extract formatting logic and improve calculation using reduce. Each method now has a clear, single purpose. The code is more testable, maintainable, and follows clean code principles.',
        order: 3,
        files: [
          new RefactoringFile({
            filename: 'order-service.ts',
            language: 'typescript',
            content: `export class OrderService {
  processOrder(order: Order): string {
    this.validateOrder(order);
    const finalTotal = this.calculateTotal(order);
    return this.formatOrderSummary(order.customer.name, finalTotal);
  }

  private validateOrder(order: Order): void {
    if (!order.items || order.items.length === 0) {
      throw new Error('Order must have items');
    }
    if (!order.customer) {
      throw new Error('Order must have customer');
    }
  }

  private calculateTotal(order: Order): number {
    const subtotal = order.items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
    const tax = subtotal * 0.1;
    return subtotal + tax;
  }

  private formatOrderSummary(customerName: string, total: number): string {
    return \`Order for \${customerName}: $\${total.toFixed(2)}\`;
  }
}`,
            order: 0,
          }),
        ],
      }),
    ],
  }),
];
