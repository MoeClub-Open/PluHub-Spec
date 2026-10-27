import type { ChannelWorkflow, WorkflowNode } from "./workflow.js";

/** Convert legacy request conditions into a data predicate and a boolean branch. */
export function migrateWorkflowConditions(flow: ChannelWorkflow): ChannelWorkflow {
  const oldConditions = flow.nodes.filter((node) => node.type === "condition");
  if (!oldConditions.length) return flow;

  const used = new Set(flow.nodes.map((node) => node.id));
  const predicateIds = new Map<string, string>();
  for (const node of oldConditions) {
    const prefix = node.id.slice(0, 108) + "-predicate";
    let id = prefix;
    let suffix = 1;
    while (used.has(id)) id = `${prefix}-${suffix++}`;
    used.add(id);
    predicateIds.set(node.id, id);
  }

  const fields = new Set(["test", "models", "modelSource", "protocol", "value"]);
  const nodes = flow.nodes.flatMap<unknown>((node) => {
    if (node.type !== "condition") return [structuredClone(node)];
    const { id, type: _type, yes, no, ...predicate } = node;
    return [
      { id, type: "branch", condition: false, yes, no },
      { id: predicateIds.get(id)!, type: "predicate", ...structuredClone(predicate) },
    ];
  });
  const bindings = (flow.bindings ?? []).map((binding) => ({
    ...binding,
    target:
      predicateIds.has(binding.target) && fields.has(binding.input)
        ? predicateIds.get(binding.target)!
        : binding.target,
  }));
  for (const [target, source] of predicateIds)
    bindings.push({ source, output: "result", target, input: "condition" });

  const layout = flow.layout && structuredClone(flow.layout);
  if (layout)
    for (const [oldId, newId] of predicateIds) {
      const point = layout[oldId];
      if (point) {
        const candidate = { x: point.x - 370, y: point.y };
        while (Object.values(layout).some((other) =>
          Math.abs(other.x - candidate.x) < 340 && Math.abs(other.y - candidate.y) < 240,
        )) candidate.y += 260;
        layout[newId] = candidate;
      }
    }

  return {
    ...flow,
    nodes: nodes as unknown as WorkflowNode[],
    bindings,
    ...(layout ? { layout } : {}),
  };
}
