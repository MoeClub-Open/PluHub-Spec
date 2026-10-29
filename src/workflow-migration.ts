import type {
  ChannelWorkflow,
  WorkflowBinding,
  WorkflowNode,
} from "./workflow.js";

export type LegacyWorkflowPredicate = {
  id: string;
  type: "predicate";
  test: "hasTools" | "stream" | "textLengthAbove" | "protocol" | "model";
  models?: string[];
  modelSource?: "requested" | "mapped";
  protocol?: import("./ai.js").Protocol;
  value?: number;
};
export type LegacyWorkflowCondition = Omit<LegacyWorkflowPredicate, "type"> & {
  type: "condition";
  yes: string;
  no: string;
};
export type LegacyChannelWorkflow = Omit<ChannelWorkflow, "nodes"> & {
  nodes: (
    | WorkflowNode
    | { id: string; type: "start"; next: string }
    | LegacyWorkflowPredicate
    | LegacyWorkflowCondition
  )[];
};

/** Migrate old request conditions and scalar entry connections to the current graph. */
export function migrateWorkflowConditions(
  flow: LegacyChannelWorkflow,
): ChannelWorkflow {
  const legacy = flow.nodes.filter(
    (node) => node.type === "condition" || node.type === "predicate",
  );
  const oldEntry = flow.nodes.some(
    (node) => node.type === "start" && typeof node.next === "string",
  );
  if (!legacy.length && !oldEntry) return flow as ChannelWorkflow;
  const used = new Set(flow.nodes.map((node) => node.id));
  const comparisons = new Map<string, { id: string; field?: string }>();
  const added: WorkflowBinding[] = [];
  const layout = flow.layout && structuredClone(flow.layout);
  const literal = (id: string, field: string, fallback: unknown): unknown => {
    const binding = flow.bindings?.find(
      (item) => item.target === id && item.input === field,
    );
    if (!binding) return fallback;
    const node = flow.nodes.find((item) => item.id === binding.source);
    if (node?.type !== "value" || binding.output !== "value")
      throw new Error(`旧条件的 ${field} 需要先固定为参数值：${id}`);
    return literal(node.id, "value", node.value);
  };
  const nodes = flow.nodes.flatMap<WorkflowNode>((node) => {
    if (node.type === "start")
      return [
        {
          ...node,
          next: typeof node.next === "string" ? [node.next] : [...node.next],
        },
      ];
    if (node.type !== "condition" && node.type !== "predicate")
      return [structuredClone(node)];
    let id = node.id;
    if (node.type === "condition") {
      const prefix = node.id.slice(0, 110) + "-compare";
      id = prefix;
      let suffix = 1;
      while (used.has(id)) id = `${prefix}-${suffix++}`;
      used.add(id);
      added.push({
        source: id,
        output: "result",
        target: node.id,
        input: "condition",
      });
      if (layout?.[node.id]) {
        const point = layout[node.id]!;
        const candidate = { x: point.x - 370, y: point.y };
        while (
          Object.values(layout).some(
            (other) =>
              Math.abs(other.x - candidate.x) < 340 &&
              Math.abs(other.y - candidate.y) < 240,
          )
        )
          candidate.y += 260;
        layout[id] = candidate;
      }
    }
    const test = literal(node.id, "test", node.test);
    let output: string, field: string | undefined;
    let compare: Extract<WorkflowNode, { type: "compare" }>;
    switch (test) {
      case "model":
        output =
          literal(node.id, "modelSource", node.modelSource) === "mapped"
            ? "mappedModel"
            : "requestedModel";
        field = "models";
        compare = {
          id,
          type: "compare",
          valueType: "string",
          operator: "matches",
          left: "",
          right: node.models ?? [],
        };
        break;
      case "protocol":
        output = "ingressProtocol";
        field = "protocol";
        compare = {
          id,
          type: "compare",
          valueType: "string",
          operator: "eq",
          left: "",
          right: node.protocol ?? "",
        };
        break;
      case "textLengthAbove":
        output = "textLength";
        field = "value";
        compare = {
          id,
          type: "compare",
          valueType: "number",
          operator: "gt",
          left: 0,
          right: node.value ?? 0,
        };
        break;
      case "hasTools":
      case "stream":
        output = test;
        compare = {
          id,
          type: "compare",
          valueType: "boolean",
          operator: "eq",
          left: false,
          right: true,
        };
        break;
      default:
        throw new Error(`旧条件的判断类型无效：${node.id}`);
    }
    comparisons.set(node.id, { id, field });
    added.push({ source: flow.entry, output, target: id, input: "left" });
    return node.type === "condition"
      ? [
          {
            id: node.id,
            type: "branch",
            condition: false,
            yes: node.yes,
            no: node.no,
          },
          compare,
        ]
      : [compare];
  });
  const bindings = (flow.bindings ?? []).flatMap((binding) => {
    const comparison = comparisons.get(binding.target);
    if (!comparison) return [{ ...binding }];
    return binding.input === comparison.field
      ? [{ ...binding, target: comparison.id, input: "right" }]
      : [];
  });
  return {
    ...flow,
    nodes,
    bindings: [...bindings, ...added],
    ...(layout ? { layout } : {}),
  };
}
