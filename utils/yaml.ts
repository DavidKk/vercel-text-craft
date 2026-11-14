import { load as yamlLoad } from 'js-yaml'

export function isYaml(text: string): boolean {
  // An empty YAML stream is valid YAML; js-yaml >= 5 throws "expected a document" on it.
  if (text.trim() === '') {
    return true
  }

  try {
    yamlLoad(text)
    return true
  } catch (error) {
    return false
  }
}
