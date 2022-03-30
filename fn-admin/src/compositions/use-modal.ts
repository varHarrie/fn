import { reactive } from "vue";

export type ModalBaseProps = {
  show: boolean;
  onOk(...args: unknown[]): unknown;
  onCancel(...args: unknown[]): unknown;
};

export default function useModal<T extends Partial<ModalBaseProps>>(data: T) {
  const { show = false, onOk: ok, onCancel: cancel } = data;

  const onOk = async (...args: unknown[]) => {
    try {
      await ok?.(...args);
      props.show = false;
    } catch {
      return;
    }
  };

  const onCancel = async (...args: unknown[]) => {
    try {
      await cancel?.(...args);
      props.show = false;
    } catch {
      return;
    }
  };

  const props = reactive<ModalBaseProps>({ ...data, show, onOk, onCancel });

  return {
    props,
    show: (patch?: Partial<T>) => {
      Object.assign(props, patch);
      props.show = true;
    },
    hide: () => {
      props.show = false;
    },
  };
}
