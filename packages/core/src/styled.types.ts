import type { UnistylesRuntime } from 'react-native-unistyles';
import type { Theme } from './theme/defaultTheme';
import type {
  AnyProps,
  OverridableComponent,
  StyleInterpolation,
} from './types';

export interface StyledOptions {
  label?: string;
  shouldForwardProp?: (prop: string) => boolean;
  skipSx?: boolean;
}

export type StyledComponent<
  P extends AnyProps,
  T extends React.ElementType,
> = OverridableComponent<Omit<P, keyof React.ComponentProps<T>>, T>;

export type CreateStyledComponent<
  T extends React.ElementType,
  P extends AnyProps,
> = <AdditionalProps extends AnyProps = NonNullable<unknown>>(
  ...styles: StyleInterpolation<
    P & AdditionalProps & { runtime: typeof UnistylesRuntime; theme: Theme }
  >[]
) => StyledComponent<P & AdditionalProps, T>;
