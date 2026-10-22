import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import Ajv from "ajv";
const load = (p) =>
  JSON.parse(readFileSync(new URL(p, import.meta.url), "utf8"));
const validate = new Ajv().compile(load("../schemas/manifest.schema.json"));
test("shared valid fixture", () =>
  assert.equal(validate(load("../fixtures/valid.json")), true));
test("shared invalid fixture", () =>
  assert.equal(validate(load("../fixtures/invalid.json")), false));
test("shared implementation dependencies remain additive and reject malformed declarations",()=>{
  const fixture=load("../fixtures/dependencies.valid.json");
  assert.equal(validate(fixture),true);
  for(const dependencies of [{"Invalid ID":"^1.0.0"},{"example.provider":""},{"example.provider":42}])
    assert.equal(validate({...fixture,dependencies}),false);
});
test("host config supports exact version locks and local package catalogs",()=>{
  const host=new Ajv().compile(load("../schemas/host-config.schema.json"));
  const config={schemaVersion:1,dataDir:"data",pluginSources:["packages"],plugins:[{path:"plugins/example",version:"1.2.0",integrity:"a".repeat(64),grants:[]}]};
  assert.equal(host(config),true);
  assert.equal(host({...config,plugins:[{...config.plugins[0],version:"^1.0.0"}]}),false);
});
test("optional plugin categories support custom names without changing old manifests", () => {
  const fixture = load("../fixtures/valid.json");
  for (const category of [undefined, "core", "community.monitoring"])
    assert.equal(validate({ ...fixture, ...(category ? { category } : {}) }), true);
  for (const category of ["", "Invalid", "has space", "a".repeat(65), 42])
    assert.equal(validate({ ...fixture, category }), false);
});
