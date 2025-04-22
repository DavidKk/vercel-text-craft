export interface TextPosition {
  /** Start line number of the text */
  startLine: number
  /** End line number of the text */
  endLine: number
  /** Start column number of the text in the line */
  startColumn: number
  /** End column number of the text in the line */
  endColumn: number
}

export interface TextSegmentPosition extends TextPosition {
  /** The text contents of the segment */
  texts?: string[]
}

export interface TextSegment extends TextSegmentPosition {
  className: string
  /** Whether this segment is present in the comparison text */
  isPresent?: boolean
  /** Optional array of line numbers where this segment matches */
  matchingLines?: number[]
  /** Array of line numbers that are ignored due to overlapping with other segments */
  ignoredLines?: number[]
}
