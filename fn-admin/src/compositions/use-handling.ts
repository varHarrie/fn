import { ref } from "vue";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyFunction = (...args: any[]) => any;

export default function useHandling<T extends AnyFunction>(
  handler: T,
  initial = false
) {
  const handling = ref(initial);

  const execute = async (...args: Parameters<T>) => {
    handling.value = true;

    try {
      return (await handler(...args)) as Promise<ReturnType<T>>;
    } finally {
      handling.value = false;
    }
  };

  return [handling, execute as T] as const;
}
