import { isFunction, isString } from '@react-universal/utils';
import { forwardRef } from 'react';
import { createElement } from './createElement';
import { css } from './css';
import { useStyles } from './hooks/useStyles';
import { interpolate } from './interpolate';
import { styleFunctionSx } from './styleFunctionSx';
import type { CreateStyledComponent, StyledOptions } from './styled.types';
import type { AnyProps, StyleInterpolation, StyleProp } from './types';

export function defaultShouldForwardProp(prop: string) {
  return prop !== 'ownerState' && prop !== 'theme' && prop !== 'sx' && prop !== 'as';
}

export function styled<T extends React.ComponentClass<React.ComponentProps<T>>>(
  component: T,
  options?: StyledOptions,
): CreateStyledComponent<
  React.ComponentProps<T> & {
    as?: React.ElementType;
    ref?: React.LegacyRef<InstanceType<T>>;
  }
>;

export function styled<T extends React.ComponentType<React.ComponentProps<T>>>(
  component: T,
  options?: StyledOptions,
): CreateStyledComponent<React.ComponentProps<T> & { as?: React.ElementType }>;

export function styled<T extends keyof React.JSX.IntrinsicElements>(
  component: T,
  options?: StyledOptions,
): CreateStyledComponent<React.JSX.IntrinsicElements[T] & { as?: React.ElementType }>;

export function styled<T extends React.ComponentType<React.ComponentProps<T>>>(
  component: T,
  { name, shouldForwardProp = defaultShouldForwardProp, skipSx = false, slot }: StyledOptions = {},
) {
  const shouldUseAs = !shouldForwardProp('as');

  return (styles: StyleInterpolation<AnyProps>) => {
    const Styled = forwardRef<
      T,
      React.ComponentProps<T> & {
        as?: React.ElementType;
        style?: StyleProp<Record<string, any>>;
      }
    >(({ style, ...props }, ref) => {
      const Component = shouldUseAs ? (props.as ?? component) : component;

      const { styles: _styles } = useStyles(
        css.create((theme, runtime) => ({
          style: interpolate.call(
            { ...props, runtime, theme },
            styles,
            !skipSx && styleFunctionSx({ ...props, theme }),
          ),
        })),
      );

      const newProps: AnyProps = {};

      for (const prop of Object.keys(props)) {
        if (shouldUseAs && prop === 'as') {
          continue;
        }
        if (shouldForwardProp(prop)) {
          newProps[prop] = props[prop as keyof typeof props];
        }
      }

      newProps.ref = ref;
      newProps.style = isFunction(style)
        ? (state: any) => [_styles.style, style(state)]
        : [_styles.style, style];

      return createElement(Component, newProps);
    });

    Styled.displayName =
      name == null
        ? `Styled(${
            isString(component)
              ? component
              : (component.displayName ?? component.name ?? 'Component')
          })`
        : `${name}${slot ?? ''}`;

    return Styled;
  };
}
