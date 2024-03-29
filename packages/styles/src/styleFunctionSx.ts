import {
  capitalize,
  get,
  isFunction,
  isObject,
  isString,
  mergeDeep,
  runIfFn,
} from '@universal-ui/utils';
import { UnistylesValues } from 'react-native-unistyles';
import { handleBreakpoints } from './breakpoints';
import { SxConfig, SxProps, defaultSxConfig } from './defaultSxConfig';
import { Theme } from './defaultTheme';
import { AnyProps } from './types';

function objectsHaveSameKeys(...objs: Record<string, any>[]) {
  const keys = new Set(
    objs.reduce<string[]>((acc, obj) => [...acc, ...Object.keys(obj)], []),
  );
  return objs.every((obj) => keys.size === Object.keys(obj).length);
}

function getStyleValue(
  themeMapping: unknown,
  transform: ((propValue: string | number) => string | number) | undefined,
  propValueFinal: any,
  userValue = propValueFinal,
) {
  let value;

  if (isFunction(themeMapping)) {
    value = themeMapping(propValueFinal);
  } else if (Array.isArray(themeMapping)) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    value = themeMapping[propValueFinal] || userValue;
  } else {
    value = get(themeMapping as Record<string, any>, propValueFinal, userValue);
  }

  if (transform) {
    // @ts-expect-error: Last 2 arguments are missing in declaration on purpose.
    value = transform(value, userValue, themeMapping);
  }

  return value;
}

function getThemeValue(
  propName: string,
  propValue: string | number | Record<string, any>,
  theme: Theme,
  config: SxConfig,
) {
  const props = {
    [propName]: propValue,
    theme,
  };

  const options = config[propName];

  if (!options) {
    return { [propName]: propValue };
  }

  const { cssProperty = propName, themeKey, transform, style } = options;

  if (propValue == null) {
    return undefined;
  }

  const themeMapping = get(theme, themeKey, {});

  if (style) {
    return style(props);
  }

  const styleFromPropValue = (propValueFinal: unknown): Record<string, any> => {
    let value = getStyleValue(themeMapping, transform, propValueFinal);

    if (propValueFinal === value && isString(propValueFinal)) {
      // Haven't found value
      value = getStyleValue(
        themeMapping,
        transform,
        `${propName}${propValueFinal === 'default' ? '' : capitalize(propValueFinal)}`,
        propValueFinal,
      );
    }

    if (cssProperty === false) {
      return value;
    }

    return {
      [cssProperty]: value,
    };
  };

  return handleBreakpoints(propValue, styleFromPropValue);
}

export interface StyleFunctionSx {
  (
    props: AnyProps & { sx?: SxProps; theme: Theme },
  ): UnistylesValues | undefined | (UnistylesValues | undefined)[];
  filterProps?: string[];
}

export function createStyleFunctionSx(): StyleFunctionSx {
  return function styleFunctionSx({ sx, theme }) {
    if (!sx) {
      return undefined;
    }

    const config: SxConfig = theme.sxConfig ?? defaultSxConfig;

    /**
     * Receive `sxInput` as object or callback and then recursively check
     * keys & values to create media query object styles. The result will be
     * used in `styled`.
     */
    const traverse = (sxInput: boolean | Exclude<SxProps, readonly any[]>) => {
      let sxObject;
      if (isFunction(sxInput)) {
        sxObject = sxInput(theme);
      } else if (isObject(sxInput)) {
        sxObject = sxInput;
      } else {
        return undefined;
      }
      if (!sxObject) {
        return undefined;
      }

      let css: UnistylesValues = {};

      const mergeCss = (item: any) => mergeDeep(css, item, { clone: false });

      for (const propName of Object.keys(
        sxObject,
      ) as (keyof typeof sxObject)[]) {
        const value = runIfFn(sxObject[propName], theme);

        if (value != null) {
          if (isObject(value)) {
            if (config[propName]) {
              css = mergeCss(getThemeValue(propName, value, theme, config));
            } else {
              const breakpointsValues = handleBreakpoints(value, (x) => ({
                [propName]: x,
              }));
              if (objectsHaveSameKeys(breakpointsValues, value)) {
                // @ts-expect-error: In this case `propName` is a breakpoint.
                css[propName] = styleFunctionSx({ sx: value, theme });
              } else {
                css = mergeCss(breakpointsValues);
              }
            }
          } else {
            css = mergeCss(getThemeValue(propName, value, theme, config));
          }
        }
      }

      return css;
    };

    return Array.isArray(sx)
      ? // eslint-disable-next-line unicorn/no-array-callback-reference
        sx.map(traverse)
      : traverse(sx as Exclude<SxProps, readonly any[]>);
  };
}

export const styleFunctionSx = createStyleFunctionSx();

styleFunctionSx.filterProps = ['sx'];
