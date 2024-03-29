import { ViewStyle as RNViewStyle } from 'react-native';
import { BreakpointValue } from './breakpoints';
import { Theme, ThemeValue } from './defaultTheme';

type BorderProp<T, K extends keyof Theme = never> = BreakpointValue<
  K extends string ? T | ThemeValue<Theme[K]> : T
>;

export interface BorderProps {
  borderWidth?: BorderProp<RNViewStyle['borderWidth']>;
  borderTopWidth?: BorderProp<RNViewStyle['borderTopWidth']>;
  borderRightWidth?: BorderProp<RNViewStyle['borderRightWidth']>;
  borderBottomWidth?: BorderProp<RNViewStyle['borderBottomWidth']>;
  borderLeftWidth?: BorderProp<RNViewStyle['borderLeftWidth']>;
  borderStartWidth?: BorderProp<RNViewStyle['borderStartWidth']>;
  borderEndWidth?: BorderProp<RNViewStyle['borderEndWidth']>;
  borderColor?: BorderProp<RNViewStyle['borderColor'], 'colors'>;
  borderTopColor?: BorderProp<RNViewStyle['borderTopColor'], 'colors'>;
  borderRightColor?: BorderProp<RNViewStyle['borderRightColor'], 'colors'>;
  borderBottomColor?: BorderProp<RNViewStyle['borderBottomColor'], 'colors'>;
  borderLeftColor?: BorderProp<RNViewStyle['borderLeftColor'], 'colors'>;
  borderStartColor?: BorderProp<RNViewStyle['borderStartColor'], 'colors'>;
  borderEndColor?: BorderProp<RNViewStyle['borderEndColor'], 'colors'>;
  /** @platform web */
  outlineWidth?: BorderProp<React.CSSProperties['outlineWidth']>;
  /** @platform web */
  outlineColor?: BorderProp<React.CSSProperties['outlineColor'], 'colors'>;
  /** @platform web */
  outlineOffset?: BorderProp<React.CSSProperties['outlineOffset']>;
  borderRadius?: BorderProp<RNViewStyle['borderRadius'], 'radii'>;
}
