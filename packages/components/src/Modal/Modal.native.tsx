import {
  normalizeLayoutEvent,
  normalizeResponderEvent,
  normalizeRole,
  styled,
  useBackHandler,
} from '@universal-ui/core';
import { forwardRef } from 'react';
import type { GestureResponderEvent } from 'react-native';
import { Modal as RNModal, Pressable as RNPressable } from 'react-native';
import type { ModalProps, ModalType } from './Modal.types';

const ModalRoot = styled(RNModal, {
  name: 'Modal',
  slot: 'Root',
})();

const ModalBackdrop = styled(RNPressable, {
  name: 'Modal',
  slot: 'Backdrop',
})();

export const Modal = forwardRef<any, ModalProps>(
  (
    {
      backdropStyle,
      children,
      hideBackdrop = false,
      lang,
      onClose,
      onLayout,
      onMoveShouldSetResponder,
      onMoveShouldSetResponderCapture,
      onResponderEnd,
      onResponderGrant,
      onResponderMove,
      onResponderReject,
      onResponderRelease,
      onResponderStart,
      onResponderTerminate,
      onResponderTerminationRequest,
      onStartShouldSetResponder,
      onStartShouldSetResponderCapture,
      open,
      role,
      style,
      ...props
    },
    ref,
  ) => {
    const handleAccessibilityEscape = () => {
      onClose?.({}, 'escapeKeyDown');
    };

    const handleBackdropPress = (event: GestureResponderEvent) => {
      onClose?.(event, 'backdropPress');
    };

    useBackHandler(() => {
      if (open) {
        onClose?.({}, 'hardwareBackPress');
      }
      return true;
    });

    if (!open) {
      return null;
    }

    return (
      <ModalRoot
        ref={ref}
        transparent
        accessibilityLanguage={lang}
        animationType="fade"
        aria-live="polite"
        aria-modal={role === 'dialog' || role === 'alertdialog' ? true : undefined}
        role={normalizeRole(role)}
        style={style as any}
        supportedOrientations={['portrait', 'landscape']}
        visible={open}
        onAccessibilityEscape={handleAccessibilityEscape}
        onLayout={normalizeLayoutEvent(onLayout)}
        onRequestClose={onClose}
        onMoveShouldSetResponder={normalizeResponderEvent(onMoveShouldSetResponder)}
        onMoveShouldSetResponderCapture={normalizeResponderEvent(onMoveShouldSetResponderCapture)}
        onResponderEnd={normalizeResponderEvent(onResponderEnd)}
        onResponderGrant={normalizeResponderEvent(onResponderGrant)}
        onResponderMove={normalizeResponderEvent(onResponderMove)}
        onResponderReject={normalizeResponderEvent(onResponderReject)}
        onResponderRelease={normalizeResponderEvent(onResponderRelease)}
        onResponderStart={normalizeResponderEvent(onResponderStart)}
        onResponderTerminate={normalizeResponderEvent(onResponderTerminate)}
        onResponderTerminationRequest={normalizeResponderEvent(onResponderTerminationRequest)}
        onStartShouldSetResponder={normalizeResponderEvent(onStartShouldSetResponder)}
        onStartShouldSetResponderCapture={normalizeResponderEvent(onStartShouldSetResponderCapture)}
        {...props}
      >
        {!hideBackdrop && (
          <ModalBackdrop
            role="presentation"
            style={backdropStyle as any}
            onPress={handleBackdropPress}
          />
        )}
        {children}
      </ModalRoot>
    );
  },
) as unknown as ModalType;

Modal.displayName = 'Modal';
