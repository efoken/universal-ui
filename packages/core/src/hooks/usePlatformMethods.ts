import { getRect } from '@react-universal/utils';
import { useIsomorphicLayoutEffect } from '@tamagui/constants';
import type {
  MeasureInWindowOnSuccessCallback,
  MeasureOnSuccessCallback,
  NativeMethods,
} from 'react-native';
import { measureLayout } from './useElementLayout';

export function usePlatformMethods<T extends HTMLElement>(hostRef: React.RefObject<T>) {
  useIsomorphicLayoutEffect(() => {
    const node = hostRef.current as (T & NativeMethods) | null;
    if (node != null) {
      // eslint-disable-next-line @typescript-eslint/unbound-method
      node.measure ||= (callback: MeasureOnSuccessCallback) => measureLayout(node, null, callback);
      // eslint-disable-next-line @typescript-eslint/unbound-method
      node.measureLayout ||= (relativeToNode: any, success: any) =>
        measureLayout(node, relativeToNode, success);
      // eslint-disable-next-line @typescript-eslint/unbound-method
      node.measureInWindow ||= (callback: MeasureInWindowOnSuccessCallback) => {
        if (node == null) {
          return;
        }
        setTimeout(() => {
          const { height, left, top, width } = getRect(node)!;
          callback(left, top, width, height);
        }, 0);
      };
    }
  }, [hostRef]);

  return hostRef;
}
