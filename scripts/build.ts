import getComponents from "./get-components/mod.ts"
import camelToKebab from "./utils/camel-to-kebab.ts"
import camelToPascal from "./utils/camel-to-pascal.ts"
import "npm:@material/web/button/filled-button.js"
// make tmp dir
await Deno.mkdir("./tmp", {
  recursive: true
})

await Deno.mkdir("./tmp/components", {
  recursive: true
})

const components = await getComponents()
const tsRegex = /(?<=^.*)\.ts$/
for(const [ name, { data: { pathArr } }] of (Object.entries(components))) {
  const kebabName = camelToKebab(name)
  await Deno.writeTextFile("./tmp/components/" + kebabName + ".vue", `
<script setup>
import "@material/web/${pathArr.join("/").replace(tsRegex, ".js")}"
</script>
<template>
  <md-${kebabName}>
    <slot />
  </md-${kebabName}>
</template>
  `.slice(1,-2))
}
const componentNames = Object.keys(components).map(camelToPascal)
const kebabComponentNames = componentNames.map(camelToKebab)
await Deno.writeTextFile("./tmp/components/index.ts", componentNames.map((componentName, index) => {
  return `export { default as ${componentName} } from "./${kebabComponentNames[index]}.vue";`
}).join("\n"))
