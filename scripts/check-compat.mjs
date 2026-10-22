import { readFileSync } from "node:fs";
import assert from "node:assert/strict";
const read = (path) =>
  JSON.parse(readFileSync(new URL(path, import.meta.url), "utf8"));
function check(old, next, path = "$") {
  for (const name of [
    "type",
    "const",
    "pattern",
    "minimum",
    "maximum",
    "minLength",
    "maxLength",
    "additionalProperties",
  ])
    if (name in old)
      assert.deepEqual(next[name], old[name], path + "." + name + " changed");
  if (old.enum)
    for (const value of old.enum)
      assert.ok(next.enum?.includes(value), path + " enum narrowed");
  for (const required of next.required ?? [])
    assert.ok(
      old.required?.includes(required),
      path + " adds required field " + required,
    );
  for (const [name, value] of Object.entries(old.properties ?? {})) {
    assert.ok(next.properties?.[name], path + " removes " + name);
    check(value, next.properties[name], path + "." + name);
  }
  if (old.items) check(old.items, next.items, path + "[]");
}
check(
  read("../compat/v1/manifest.schema.json"),
  read("../schemas/manifest.schema.json"),
);
console.log("Manifest v1 baseline remains compatible");
