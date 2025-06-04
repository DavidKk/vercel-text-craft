import * as YAML from 'js-yaml'

export function isYaml(text: string): boolean {
  try {
    YAML.load(text)
    return true
  } catch (error) {
    return false
  }
}
