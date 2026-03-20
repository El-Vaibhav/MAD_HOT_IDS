import jsPDF from "jspdf"
import html2canvas from "html2canvas"

export async function exportAnalysisReportToPDF({
  attackType,
  confidence,
  riskLevel,
  status,
  reasons = [],
  explanation = "",
  characteristics = []
}: {
  attackType: string
  confidence: number
  riskLevel: number
  status: string
  reasons?: string[]
  explanation?: string
  characteristics?: string[]
}) {

  const pdf = new jsPDF({ unit: "mm", format: "a4" })

  const pageWidth = pdf.internal.pageSize.getWidth()
  const pageHeight = pdf.internal.pageSize.getHeight()

  let y = 20

  const cyan = [0, 255, 255] as const
  const red = [255, 80, 80] as const
  const green = [0, 255, 120] as const
  const white = [240, 240, 240] as const
  const gray = [170, 170, 190] as const

  /* ===============================
     BACKGROUND
  =============================== */

  pdf.setFillColor(10, 10, 25)
  pdf.rect(0, 0, pageWidth, pageHeight, "F")

  pdf.setFont("helvetica", "normal")

  /* ===============================
     HEADER
  =============================== */

  pdf.setFont("helvetica", "bold")
  pdf.setFontSize(28)
  pdf.setTextColor(...cyan)
  pdf.text("MAD-HOT IDS", 15, y)

  y += 8

  pdf.setFontSize(11)
  pdf.setTextColor(...gray)
  pdf.text(
    "Machine Assisted Detection - Hybrid Online Threat System",
    15,
    y
  )

  y += 6

  pdf.setFontSize(9)
  pdf.text(`Report Generated: ${new Date().toLocaleString()}`, 15, y)

  y += 8

  pdf.setDrawColor(60, 60, 90)
  pdf.line(15, y, pageWidth - 15, y)

  y += 10

  /* ===============================
     STATUS
  =============================== */

  pdf.setFontSize(16)
  pdf.setFont("helvetica", "bold")

  if (status === "ATTACK") {
    pdf.setTextColor(...red)
    pdf.text("⚠ ATTACK DETECTED", 15, y)
  } else {
    pdf.setTextColor(...green)
    pdf.text("✔ NORMAL TRAFFIC", 15, y)
  }

  y += 12

  /* ===============================
     METRICS
  =============================== */

  pdf.setFillColor(18, 18, 40)
  pdf.roundedRect(15, y - 6, pageWidth - 30, 32, 4, 4, "F")

  pdf.setFontSize(13)
  pdf.setTextColor(...cyan)
  pdf.text("Key Metrics", 20, y)

  y += 8

  pdf.setFontSize(11)
  pdf.setTextColor(...white)

  pdf.text(`Attack Type: ${attackType}`, 20, y)
  y += 6

  pdf.text(`Confidence: ${confidence}%`, 20, y)
  y += 6

  pdf.text(`Risk Level: ${riskLevel}/100`, 20, y)
  y += 6

  pdf.text(`System Status: ${status}`, 20, y)

  y += 16

  /* ===============================
     RISK ASSESSMENT
  =============================== */

  pdf.setFontSize(14)
  pdf.setFont("helvetica", "bold")
  pdf.setTextColor(...cyan)
  pdf.text("Risk Assessment", 15, y)

  y += 8

  pdf.setFontSize(11)
  pdf.setFont("helvetica", "normal")
  pdf.setTextColor(...white)

  let riskText = ""

  if (riskLevel > 80) {
    riskText =
      "High risk traffic detected with strong behavioural match. Immediate mitigation recommended."
  } else if (riskLevel > 50) {
    riskText =
      "Moderate risk behaviour detected. Continuous monitoring advised."
  } else {
    riskText =
      "Traffic appears normal with minimal anomaly indicators."
  }

  const riskLines = pdf.splitTextToSize(riskText, 180)
  pdf.text(riskLines, 15, y)

  y += riskLines.length * 6 + 10

  /* ===============================
     DETECTION REASONS
  =============================== */

  pdf.setFontSize(14)
  pdf.setFont("helvetica", "bold")
  pdf.setTextColor(...cyan)
  pdf.text("Detection Indicators", 15, y)

  y += 8

  pdf.setFontSize(11)
  pdf.setFont("helvetica", "normal")
  pdf.setTextColor(...white)

  reasons.forEach((r) => {
    pdf.text(`• ${r}`, 18, y)
    y += 6
  })

  y += 10

  /* ===============================
     EXPLANATION
  =============================== */

  pdf.setFontSize(14)
  pdf.setFont("helvetica", "bold")
  pdf.setTextColor(...cyan)
  pdf.text("Attack Type Explanation", 15, y)

  y += 8

  pdf.setFontSize(11)
  pdf.setFont("helvetica", "normal")
  pdf.setTextColor(...white)

  const explanationLines = pdf.splitTextToSize(explanation, 180)
  pdf.text(explanationLines, 15, y)

  y += explanationLines.length * 6 + 10

  /* ===============================
     CHARACTERISTICS
  =============================== */

  pdf.setFontSize(14)
  pdf.setFont("helvetica", "bold")
  pdf.setTextColor(...cyan)
  pdf.text("Traffic Characteristics", 15, y)

  y += 8

  pdf.setFontSize(11)
  pdf.setFont("helvetica", "normal")
  pdf.setTextColor(...white)

  characteristics.forEach((c) => {
    pdf.text(`• ${c}`, 18, y)
    y += 6
  })

  /* ===============================
     NEW PAGE FOR CHARTS
  =============================== */

  pdf.addPage()
  pdf.setFillColor(10, 10, 25)
  pdf.rect(0, 0, pageWidth, pageHeight, "F")

  y = 20

  pdf.setFontSize(18)
  pdf.setFont("helvetica", "bold")
  pdf.setTextColor(...cyan)
  pdf.text("Network Traffic Visualizations", 15, y)

  y += 10

  function svgToPng(svgElement: SVGElement, width: number, height: number): Promise<string> {
    return new Promise((resolve, reject) => {

      const clone = svgElement.cloneNode(true) as SVGElement

      // Inline computed styles for every SVG node
      const all = clone.querySelectorAll("*")

      all.forEach((el: any) => {
        const computed = window.getComputedStyle(el)

        el.setAttribute("fill", computed.fill || "none")
        el.setAttribute("stroke", computed.stroke || "none")
        el.setAttribute("stroke-width", computed.strokeWidth || "1")
        el.setAttribute("font-size", computed.fontSize || "12px")
        el.setAttribute("font-family", computed.fontFamily || "sans-serif")
      })

      const serializer = new XMLSerializer()
      let svgString = serializer.serializeToString(clone)

      // Remove unsupported color spaces
      svgString = svgString.replace(/oklch\([^)]+\)/g, "rgb(0,255,255)")
      svgString = svgString.replace(/lab\([^)]+\)/g, "rgb(0,255,255)")
      svgString = svgString.replace(/lch\([^)]+\)/g, "rgb(0,255,255)")

      const svgBlob = new Blob([svgString], { type: "image/svg+xml;charset=utf-8" })
      const url = URL.createObjectURL(svgBlob)

      const img = new Image()

      img.onload = () => {

        const canvas = document.createElement("canvas")
        canvas.width = width * 2
        canvas.height = height * 2

        const ctx = canvas.getContext("2d")

        if (!ctx) {
          reject("Canvas context failed")
          return
        }

        ctx.scale(2, 2)

        ctx.fillStyle = "#0a0a19"
        ctx.fillRect(0, 0, width, height)

        ctx.drawImage(img, 0, 0, width, height)

        URL.revokeObjectURL(url)

        resolve(canvas.toDataURL("image/png"))
      }

      img.onerror = reject
      img.src = url
    })
  }
  /* ===============================
   CAPTURE CHARTS (SVG SAFE)
=============================== */

  const chartIds = [
  { id: "packet-rate-chart", title: "Packet Rate Timeline" },
  { id: "traffic-intensity-chart", title: "Traffic Intensity" },
]

for (const chart of chartIds) {

  const container = document.getElementById(chart.id)
  if (!container) continue

  const svg =
    container.querySelector("svg.recharts-surface") ||
    container.querySelector("svg")

  if (!svg) {
    console.warn("Chart SVG not found:", chart.id)
    continue
  }

  try {

    const width = svg.clientWidth || 800
    const height = svg.clientHeight || 400

    const serializer = new XMLSerializer()
    let svgString = serializer.serializeToString(svg)

    svgString = svgString.replace(/oklch\([^)]+\)/g, "rgb(0,255,255)")
    svgString = svgString.replace(/lab\([^)]+\)/g, "rgb(0,255,255)")

    const svgBlob = new Blob([svgString], {
      type: "image/svg+xml;charset=utf-8"
    })

    const url = URL.createObjectURL(svgBlob)

    const img = new Image()

    await new Promise((resolve, reject) => {

      img.onload = resolve
      img.onerror = reject
      img.src = url

    })

    const canvas = document.createElement("canvas")
    canvas.width = width * 2
    canvas.height = height * 2

    const ctx = canvas.getContext("2d")

    if (!ctx) continue

    ctx.scale(2, 2)

    ctx.fillStyle = "#0a0a19"
    ctx.fillRect(0, 0, width, height)

    ctx.drawImage(img, 0, 0, width, height)

    const imgData = canvas.toDataURL("image/png")

    if (y + 80 > pageHeight - 20) {
      pdf.addPage()
      pdf.setFillColor(10, 10, 25)
      pdf.rect(0, 0, pageWidth, pageHeight, "F")
      y = 20
    }

    pdf.setFontSize(13)
    pdf.setTextColor(...cyan)
    pdf.text(chart.title, 15, y)

    y += 4

    pdf.addImage(imgData, "PNG", 15, y, pageWidth - 30, 70)

    y += 80

    URL.revokeObjectURL(url)

  } catch (err) {
    console.error("Chart export failed:", chart.id, err)
  }
}
  /* ===============================
     FOOTER
  =============================== */

  pdf.setDrawColor(60, 60, 90)
  pdf.line(15, pageHeight - 18, pageWidth - 15, pageHeight - 18)

  pdf.setFontSize(8)
  pdf.setTextColor(...gray)

  pdf.text(
    "MAD-HOT IDS | Automated Network Intrusion Detection System Report",
    15,
    pageHeight - 10
  )

  const timestamp = new Date().toISOString().split("T")[0]

  pdf.save(`MADHOT_IDS_Report_${timestamp}.pdf`)
}