<template>
  <div ref="container" class="code-editor" />
</template>

<script lang="ts" setup>
import { basicSetup, EditorState, EditorView } from "@codemirror/basic-setup";
import { indentWithTab } from "@codemirror/commands";
import { javascript } from "@codemirror/lang-javascript";
import { keymap, placeholder, ViewUpdate } from "@codemirror/view";
import { computed, onBeforeUnmount, onMounted, ref, watch } from "vue";

import lightTheme from "./light-theme";

type CodeEditorProps = {
  value: string;
  autoFocus?: string;
  placeholder?: string;
};

type CodeEditorEvents = {
  (type: "update:value", value: string): void;
  (type: "update", update: ViewUpdate): void;
};

const props = defineProps<CodeEditorProps>();
const emit = defineEmits<CodeEditorEvents>();

const container = ref<HTMLDivElement>();
let state: EditorState | undefined;
let view: EditorView | undefined;

const extensions = computed(() => {
  const list = [basicSetup, lightTheme, javascript()];

  list.push(
    EditorView.updateListener.of((update) => {
      emit("update", update);

      if (update.docChanged) {
        const value = update.state.doc.toString();
        emit("update:value", value);
      }
    })
  );

  list.push(keymap.of([indentWithTab]));

  if (props.placeholder) {
    list.push(placeholder(props.placeholder));
  }

  return list;
});

function initialize() {
  const parent = container.value;

  state = EditorState.create({
    doc: props.value,
    extensions: extensions.value,
  });
  view = new EditorView({ state, parent });

  if (props.autoFocus) {
    view.focus();
  }
}

function destroy() {
  if (view) {
    view.destroy();
    view = undefined;
  }
}

onMounted(() => initialize());
onBeforeUnmount(() => destroy());

watch(
  () => props.value,
  () => {
    if (!view) return;

    const nextValue = props.value;
    const currentValue = view.state.doc.toString() ?? "";
    if (currentValue === nextValue) return;

    view.dispatch({
      changes: { from: 0, to: currentValue.length, insert: nextValue },
    });
  }
);
</script>
