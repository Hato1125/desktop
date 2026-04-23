export type Component = {
  name: string;
  render: () => JSX.Element;
};

export const defineComponent = (
  name: string,
  render: () => JSX.Element,
): Component => ({ name, render });
