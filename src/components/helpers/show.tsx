import React, { Children, type ReactNode } from 'react';
import { If } from './if';

type Props = {
  children: ReactNode;
};

type ElseProps = {
  render?: () => ReactNode;
  children?: ReactNode;
};

export const Show = ({ children }: Props) => {
  let when: ReactNode | null = null;
  let otherwise: ReactNode | null = null;

  Children.forEach(children, (child) => {
    if (!React.isValidElement(child)) return;

    const props = child.props as { condition?: boolean };

    if (props.condition === undefined) {
      otherwise = child;
    } else if (!when && props.condition === true) {
      when = child;
    }
  });

  return (when || otherwise) as ReactNode;
};

Show.When = If;
Show.Else = ({ render, children }: ElseProps) => (render ? render() : children);
