import { expandGlob } from "std/fs"
import { toFileUrl } from "std/path"
import kebabToCamel from "../utils/kebab-to-camel.ts"
import cloneMaterialWeb from "./clone-material-web.ts"

const testCodeRegex = /^.*?_test\.ts$/

export type Touple2<T> = [T,T]
export interface Data {
  pathArr: Touple2<string>
}

export default async () => {
  //await cloneMaterialWeb()
  const importCodes: string[] = []
  const datas: Data[] = []
  for await (const entry of expandGlob("./material-web/*/*.ts")) {
    if (testCodeRegex.test(entry.name) || entry.name === "harness.ts") {
      continue
    }

    const pathArr: Touple2<string> = toFileUrl(entry.path).pathname.split("/").slice(-2) as Touple2<string>

    if(pathArr[0] === "testing") {
      continue
    }
    const importPath = "npm:@material/web/" + pathArr.join("/").replace(/\.ts$/, ".js")
    
    const importCode = `export * as ${kebabToCamel(pathArr[1].replace(/\.ts$/,""))} from "${importPath}";`
    importCodes.push(importCode)

    datas.push({
      pathArr,
    })
  }
  await Deno.writeTextFile("./tmp/material-components.ts",importCodes.join(""))
  const components = await import("../../tmp/material-components.ts")
  
  const result: Record<string, {
    components: any,
    data: Data
  }>= {}
  let i = 0
  for (const key in components) {
    result[key] = {
      components,
      data: datas[i],
    }
    i++
  }
  return result
}
