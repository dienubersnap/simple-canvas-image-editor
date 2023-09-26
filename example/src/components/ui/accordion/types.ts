import { CSSProperties, ReactNode } from "react"

export interface AccordionComponentProps {
  // index: number | string
  summary: ReactNode
  details: ReactNode
  idTagAccordion?: string
  styleAccordion?: CSSProperties
  styleSummary?: CSSProperties
  styleDetails?: CSSProperties
}
