'use client';

import { computePosition, flip, shift, size } from '@floating-ui/dom';
import {
  forwardedProps,
  getLocaleDirection,
  styled,
  type AnyProps,
  type ForwardedProps,
} from '@react-universal/core';
import { pick } from '@react-universal/utils';
import { useComposedRefs } from '@tamagui/compose-refs';
import { forwardRef, useCallback, useEffect, useMemo, useRef } from 'react';
import type { PopoverMethods, PopoverProps } from './Popover.types';
import { parseModifiers, resolveAnchor } from './Popover.utils';

function pickProps<T extends AnyProps>(props: T) {
  return pick(props, {
    ...forwardedProps.defaultProps,
    ...forwardedProps.styleProps,
    lang: true,
  });
}

const PopoverRoot = styled('div', {
  name: 'Popover',
  slot: 'Root',
})(({ theme }) => ({
  alignItems: 'stretch',
  backgroundColor: theme.colors.background.default,
  flexBasis: 'auto',
  flexDirection: 'column',
  flexShrink: 0,
  minHeight: 0,
  minWidth: 0,
  zIndex: 1,
  '&:popover-open': {
    display: 'flex',
  },
}));

export const Popover = forwardRef<HTMLDivElement & PopoverMethods, PopoverProps>(
  (
    {
      anchor: anchorProp,
      dir,
      modifiers: modifiersProp = [],
      open,
      placement = 'bottom',
      role = 'tooltip',
      strategy: strategyProp = 'absolute',
      ...props
    },
    ref,
  ) => {
    const hostRef = useRef<HTMLDivElement>(null);

    const anchor = resolveAnchor(anchorProp);

    const modifiers = useMemo(
      () =>
        parseModifiers([
          {
            name: 'flip',
            enabled: true,
          },
          {
            name: 'shift',
            enabled: true,
          },
          ...modifiersProp,
        ]),
      [modifiersProp],
    );

    const handleBeforeToggle = useCallback(
      (event: ToggleEvent) => {
        const hostEl = hostRef.current;
        if (event.newState === 'open' && anchor != null && hostEl != null) {
          // @ts-expect-error: `anchor` can be of type `RNView` only for Native
          computePosition(anchor, hostEl, {
            middleware: [
              modifiers.flip?.enabled ? flip(modifiers.flip.options) : false,
              modifiers.shift?.enabled ? shift(modifiers.shift.options) : false,
              modifiers.size?.enabled ? size(modifiers.size.options) : false,
            ],
            placement,
            strategy: strategyProp,
          }).then(({ strategy, x, y }) => {
            Object.assign(hostEl.style, {
              left: `${x}px`,
              position: strategy,
              top: `${y}px`,
            });
          });
        }
      },
      [anchor, modifiers, placement, strategyProp],
    );

    const langDirection = props.lang == null ? undefined : getLocaleDirection(props.lang);
    const componentDirection = dir ?? langDirection;

    const supportedProps: ForwardedProps<HTMLDivElement> = pickProps(props);
    supportedProps.dir = componentDirection;
    supportedProps.popover = 'manual';
    supportedProps.role = role;

    const handleRef = useComposedRefs(hostRef, ref);

    supportedProps.ref = handleRef;

    useEffect(() => {
      const hostEl = hostRef.current;
      if (hostEl != null) {
        hostEl.addEventListener('beforetoggle', handleBeforeToggle);
        return () => {
          hostEl.removeEventListener('beforetoggle', handleBeforeToggle);
        };
      }
    }, [handleBeforeToggle]);

    useEffect(() => {
      if (open) {
        hostRef.current?.showPopover();
      } else {
        hostRef.current?.hidePopover();
      }
    }, [open]);

    return <PopoverRoot {...supportedProps} />;
  },
);
