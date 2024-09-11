import type { AnyProps, StyleProp } from '@universal-ui/core';
import { normalizeRole, styled, StyleSheet } from '@universal-ui/core';
import { forwardRef } from 'react';
import {
  Circle as RNCircle,
  ClipPath as RNClipPath,
  Defs as RNDefs,
  Ellipse as RNEllipse,
  Filter as RNFilter,
  ForeignObject as RNForeignObject,
  G as RNG,
  Image as RNImage,
  Line as RNLine,
  LinearGradient as RNLinearGradient,
  Marker as RNMarker,
  Mask as RNMask,
  Path as RNPath,
  Pattern as RNPattern,
  Polygon as RNPolygon,
  Polyline as RNPolyline,
  RadialGradient as RNRadialGradient,
  Rect as RNRect,
  Stop as RNStop,
  Svg as RNSvg,
  Symbol as RNSymbol,
  Text as RNText,
  TextPath as RNTextPath,
  TSpan as RNTSpan,
  Use as RNUse,
} from 'react-native-svg';
import type {
  CircleProps,
  ClipPathProps,
  DefsProps,
  EllipseProps,
  FilterProps,
  ForeignObjectProps,
  GProps,
  ImageProps,
  LinearGradientProps,
  LineProps,
  MarkerProps,
  MaskProps,
  PathProps,
  PatternProps,
  PolygonProps,
  PolylineProps,
  RadialGradientProps,
  RectProps,
  StopProps,
  SvgProps,
  SymbolProps,
  TextPathProps,
  TextProps,
  TSpanProps,
  UseProps,
} from './types';

function createComponent<
  P extends {
    children?: React.ReactNode;
    id?: string;
    parent?: React.ComponentType;
    style?: StyleProp<any>;
  },
  T = any,
>(
  Base: React.ComponentType<any>,
  name: Capitalize<string>,
  prepareProps: (props: React.PropsWithoutRef<P>) => React.PropsWithoutRef<P> = (props) => props,
) {
  const Component = forwardRef<T, P>(({ style, ...props }, ref) => {
    const styleProps: AnyProps = StyleSheet.flatten(style)[0];

    return <Base ref={ref} {...prepareProps(props as React.PropsWithoutRef<P>)} {...styleProps} />;
  });

  Component.displayName = name;

  return Component;
}

const SvgRoot = styled(RNSvg, {
  name: 'Svg',
  slot: 'Root',
})(({ theme }) => ({
  borderColor: theme.colors.border.default,
  position: 'static',
}));

export const Svg = forwardRef<any, SvgProps>(({ hitSlop, role, style, ...props }, ref) => (
  <SvgRoot
    ref={ref}
    hitSlop={hitSlop ?? undefined}
    role={normalizeRole(role)}
    style={style as any}
    {...props}
  />
));

Svg.displayName = 'Svg';

export const Circle = createComponent<CircleProps>(RNCircle, 'Circle');
export const ClipPath = createComponent<ClipPathProps>(RNClipPath, 'ClipPath');
export const Defs = createComponent<DefsProps>(RNDefs, 'Defs');
export const Ellipse = createComponent<EllipseProps>(RNEllipse, 'Ellipse');
export const Filter = createComponent<FilterProps>(RNFilter, 'Filter');
export const ForeignObject = createComponent<ForeignObjectProps>(RNForeignObject, 'ForeignObject');
export const G = createComponent<GProps>(RNG, 'G');
export const Image = createComponent<ImageProps>(RNImage, 'Image');
export const Line = createComponent<LineProps>(RNLine, 'Line');
export const LinearGradient = createComponent<LinearGradientProps>(
  RNLinearGradient,
  'LinearGradient',
);
export const Marker = createComponent<MarkerProps>(RNMarker, 'Marker');
export const Mask = createComponent<MaskProps>(RNMask, 'Mask');
export const Path = createComponent<PathProps>(RNPath, 'Path');
export const Pattern = createComponent<PatternProps>(RNPattern, 'Pattern');
export const Polygon = createComponent<PolygonProps>(RNPolygon, 'Polygon');
export const Polyline = createComponent<PolylineProps>(RNPolyline, 'Polyline');
export const RadialGradient = createComponent<RadialGradientProps>(
  RNRadialGradient,
  'RadialGradient',
);
export const Rect = createComponent<RectProps>(RNRect, 'Rect');
export const Stop = createComponent<StopProps>(RNStop, 'Stop');
export const Symbol = createComponent<SymbolProps>(RNSymbol, 'Symbol');
export const Text = createComponent<TextProps>(RNText, 'Text');
export const TextPath = createComponent<TextPathProps>(RNTextPath, 'TextPath');
export const TSpan = createComponent<TSpanProps>(RNTSpan, 'TSpan');
export const Use = createComponent<UseProps>(RNUse, 'Use');