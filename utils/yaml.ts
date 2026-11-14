import { load as yamlLoad } from 'js-yaml'

export function isYaml(text: string): boolean {
  try {
    yamlLoad(text)
    return true
  } catch (error) {
    return false
  }
}
