export class JSDOM {
  window: any;

  constructor() {
    this.window = {
      document: {
        implementation: {
          createHTMLDocument: () => ({
            createElement: (tag: string) => ({
              tagName: tag,
              innerHTML: '',
              setAttribute: () => {},
            }),
          }),
        },
      },
    };
  }
}
