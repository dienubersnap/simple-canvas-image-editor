import { ExpandMore } from "@mui/icons-material"
import { Accordion, AccordionDetails, AccordionSummary } from "@mui/material"
import { AccordionComponentProps } from "./types"

export default function AccordionComponent(props: AccordionComponentProps) {
  const {
    summary,
    details,
    idTagAccordion,
    styleAccordion,
    styleSummary,
    styleDetails,
  } = props

  // const [expanded, setExpanded] = useState<string | false>(false)
  // const handleChange =
  //   (panel: string) => (event: React.SyntheticEvent, isExpanded: boolean) => {
  //     setExpanded(isExpanded ? panel : false)
  //   }

  return (
    <Accordion
      id={`${idTagAccordion}`}
      style={{
        ...styleAccordion,
        backgroundColor: "black",
        // color: theme.palette.neutral.neutral10,
        color: "white",
      }}
    >
      <AccordionSummary
        expandIcon={<ExpandMore sx={{ color: "white" }} />}
        aria-controls={`${idTagAccordion}-content`}
        id={`${idTagAccordion}-header`}
        style={{ padding: 0, ...styleSummary }}
      >
        {summary}
      </AccordionSummary>
      <AccordionDetails
        style={{ padding: 0, ...styleDetails }}
        id={`${idTagAccordion}-details`}
      >
        {details}
      </AccordionDetails>
    </Accordion>
  )
}
