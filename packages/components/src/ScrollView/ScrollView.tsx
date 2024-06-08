'use client';

import type { LayoutEvent } from '@universal-ui/core';
import { styled, useForkRef, useOwnerState } from '@universal-ui/core';
import { isArray } from '@universal-ui/utils';
import { Children, cloneElement, forwardRef, useImperativeHandle, useRef } from 'react';
import type { GestureResponderEvent } from 'react-native';
import { TextInputState } from '../TextInput/TextInputState';
import type { ViewMethods, ViewStyle } from '../View';
import { View } from '../View';
import type {
  ScrollEvent,
  ScrollViewMethods,
  ScrollViewOwnerState,
  ScrollViewProps,
} from './ScrollView.types';
import { ScrollViewBase } from './ScrollViewBase';

const ScrollViewRoot = styled(ScrollViewBase, {
  name: 'ScrollView',
  slot: 'Root',
})<{ ownerState: ScrollViewOwnerState }>(({ ownerState }) => ({
  flexGrow: 1,
  flexShrink: 1,
  WebkitOverflowScrolling: 'touch',
  transform: 'translateZ(0)',
  ...(ownerState.horizontal
    ? {
        flexDirection: 'row',
        overflowX: 'auto',
        overflowY: 'hidden',
      }
    : {
        flexDirection: 'column',
        overflowX: 'hidden',
        overflowY: 'auto',
      }),
  ...(ownerState.pagingEnabled && {
    scrollSnapType: ownerState.horizontal ? 'x mandatory' : 'y mandatory',
  }),
}));

const scrollViewRefreshControlStyle: ViewStyle = {
  flexDirection: 'inherit' as any,
  flexGrow: 1,
  flexShrink: 1,
  WebkitOverflowScrolling: 'inherit',
  overflowX: 'inherit',
  overflowY: 'inherit',
  scrollSnapType: 'inherit',
};

const ScrollViewStickyHeader = styled(View, {
  name: 'ScrollView',
  slot: 'StickyHeader',
})({
  position: 'sticky' as any,
  top: 0,
  zIndex: 10,
});

const ScrollViewContentContainer = styled(View, {
  name: 'ScrollView',
  slot: 'ContentContainer',
})<{ ownerState: ScrollViewOwnerState }>(({ ownerState }) => ({
  ...(ownerState.horizontal && {
    flexDirection: 'row',
  }),
  ...(ownerState.centerContent && {
    flexGrow: 1,
    justifyContent: 'center',
  }),
}));

const ScrollViewChild = styled(View, {
  name: 'ScrollView',
  slot: 'Child',
})({
  scrollSnapAlign: 'start',
});

export const ScrollView = forwardRef<ScrollViewMethods, ScrollViewProps>(
  (
    {
      centerContent = false,
      children,
      contentContainerStyle,
      horizontal = false,
      keyboardDismissMode,
      keyboardShouldPersistTaps = 'never',
      onContentSizeChange,
      onMomentumScrollBegin,
      onMomentumScrollEnd,
      onResponderGrant,
      onResponderRelease,
      onScroll,
      onScrollBeginDrag,
      onScrollEndDrag,
      onTouchEnd,
      onTouchMove,
      onTouchStart,
      pagingEnabled = false,
      refreshControl,
      scrollEventThrottle = 0,
      stickyHeaderIndices,
      style,
      ...props
    },
    ref,
  ) => {
    const scrollNodeRef = useRef<ViewMethods>();
    const innerViewRef = useRef<any>(null);

    const getInnerViewNode = () => innerViewRef.current;

    const getScrollableNode = () => scrollNodeRef.current!;

    const touching = useRef(false);

    const observedScrollSinceBecomingResponder = useRef(false);

    const handleScrollShouldSetResponder = () => touching.current;

    // eslint-disable-next-line unicorn/consistent-function-scoping
    const handleStartShouldSetResponder = () => false;

    // eslint-disable-next-line unicorn/consistent-function-scoping
    const handleStartShouldSetResponderCapture = () => false;

    // eslint-disable-next-line unicorn/consistent-function-scoping
    const handleResponderReject = () => {
      console.warn("universal-ui: ScrollView doesn't take rejection well - scrolls anyway");
    };

    const handleResponderTerminationRequest = () => !observedScrollSinceBecomingResponder.current;

    const handleTouchEnd = (event: GestureResponderEvent) => {
      touching.current = event.nativeEvent.touches.length > 0;
      onTouchEnd?.(event);
    };

    const handleResponderRelease = (event: GestureResponderEvent) => {
      onResponderRelease?.(event);

      // By default ScrollViews will unfocus a TextInput if another touch occurs
      // outside of it
      const currentlyFocusedTextInput = TextInputState.currentlyFocusedField();
      if (
        currentlyFocusedTextInput != null &&
        keyboardShouldPersistTaps !== 'always' &&
        // @ts-expect-error: We have to handle better typing for the event
        event.target !== currentlyFocusedTextInput &&
        !observedScrollSinceBecomingResponder.current
      ) {
        TextInputState.blurTextInput(currentlyFocusedTextInput);
      }
    };

    const handleResponderGrant = (event: GestureResponderEvent) => {
      observedScrollSinceBecomingResponder.current = false;
      onResponderGrant?.(event);
    };

    const handleTouchStart = (event: GestureResponderEvent) => {
      touching.current = true;
      onTouchStart?.(event);
    };

    const handleTouchMove = (event: GestureResponderEvent) => {
      onTouchMove?.(event);
    };

    const scrollTo = ({
      animated,
      x: left = 0,
      y: top = 0,
    }: { animated?: boolean; x?: number; y?: number } = {}) => {
      // Default to true, see https://reactnative.dev/docs/scrollview#scrolltoend
      const _animated = animated !== false;
      const scrollResponderNode = scrollNodeRef.current;
      if (scrollResponderNode instanceof HTMLElement) {
        scrollResponderNode.scroll({
          behavior: _animated ? 'smooth' : 'auto',
          left,
          top,
        });
      }
    };

    const scrollToEnd = ({ animated }: { animated?: boolean } = {}) => {
      const scrollResponderNode = scrollNodeRef.current!;
      if (scrollResponderNode instanceof HTMLElement) {
        const x = horizontal ? scrollResponderNode.scrollWidth : 0;
        const y = horizontal ? 0 : scrollResponderNode.scrollHeight;
        scrollTo({ animated, x, y });
      }
    };

    const getScrollResponder = (): ScrollViewMethods => ({
      flashScrollIndicators: () => {},
      getInnerViewNode,
      getScrollableNode,
      getScrollResponder,
      scrollTo,
      scrollToEnd,
    });

    useImperativeHandle(ref, getScrollResponder);

    const handleContentContainerLayout = (event: LayoutEvent) => {
      const { height, width } = event.nativeEvent.layout;
      onContentSizeChange?.(width, height);
    };

    const handleScroll = (event: ScrollEvent) => {
      if (process.env.NODE_ENV !== 'production' && onScroll != null && scrollEventThrottle === 0) {
        console.log(
          'universal-ui: You specified `onScroll` on a `<ScrollView>` but ' +
            'not `scrollEventThrottle`. You will only receive one event. ' +
            'Using `16` you get all the events but be aware that it may ' +
            "cause frame drops, use a bigger number if you don't need as " +
            'much precision.',
        );
      }

      if (keyboardDismissMode === 'on-drag') {
        TextInputState.blurTextInput(TextInputState.currentlyFocusedField());
      }

      observedScrollSinceBecomingResponder.current = true;
      onScroll?.(event);
    };

    const handleRef = useForkRef<any>(scrollNodeRef, ref);

    const hasStickyHeaderIndices = !horizontal && isArray(stickyHeaderIndices);

    const _children =
      hasStickyHeaderIndices || pagingEnabled
        ? Children.map(children, (child, i) => {
            if (child != null) {
              if (hasStickyHeaderIndices && stickyHeaderIndices.includes(i)) {
                return <ScrollViewStickyHeader>{child}</ScrollViewStickyHeader>;
              }
              if (pagingEnabled) {
                return <ScrollViewChild>{child}</ScrollViewChild>;
              }
            }
            return child;
          })
        : children;

    const ownerState = useOwnerState({
      centerContent,
      horizontal,
      pagingEnabled,
    });

    const scrollView = (
      <ScrollViewRoot
        ref={handleRef}
        ownerState={ownerState}
        scrollEventThrottle={scrollEventThrottle}
        style={style}
        onResponderGrant={handleResponderGrant}
        onResponderReject={handleResponderReject}
        onResponderRelease={handleResponderRelease}
        onResponderTerminationRequest={handleResponderTerminationRequest}
        onScroll={handleScroll}
        onScrollShouldSetResponder={handleScrollShouldSetResponder}
        onStartShouldSetResponder={handleStartShouldSetResponder}
        onStartShouldSetResponderCapture={handleStartShouldSetResponderCapture}
        onTouchEnd={handleTouchEnd}
        onTouchMove={handleTouchMove}
        onTouchStart={handleTouchStart}
        {...props}
      >
        <ScrollViewContentContainer
          ref={innerViewRef}
          collapsable={false}
          ownerState={ownerState}
          style={contentContainerStyle}
          onLayout={handleContentContainerLayout}
        >
          {_children}
        </ScrollViewContentContainer>
      </ScrollViewRoot>
    );

    if (refreshControl) {
      return cloneElement(refreshControl, { style: scrollViewRefreshControlStyle }, scrollView);
    }

    return scrollView;
  },
) as unknown as React.FunctionComponent<ScrollViewProps & React.RefAttributes<ScrollViewMethods>> &
  ScrollViewMethods;

ScrollView.displayName = 'ScrollView';
