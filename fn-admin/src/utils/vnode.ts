import { type VNode, Comment, Text } from "vue";

export function hasContent(content: VNode[] | undefined) {
  if (!content) return false;

  return content.some((node: VNode) => {
    if (node.type === Comment) return false;
    if (Array.isArray(node.children) && !node.children.length) return false;

    return (
      node.type !== Text ||
      (typeof node.children === "string" && node.children.trim() !== "")
    );
  });
}
