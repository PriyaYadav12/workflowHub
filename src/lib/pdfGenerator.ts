import jsPDF from "jspdf";

type TaskBreakdown = {
  task: number;
  details: string;
};

type WebhookResult = {
  output: {
    deliverableType: string;
    clientName: string;
    deliverablesRequested: string;
    finalOutput: unknown[];
    reasoning?: string[];
    task_breakdown?: TaskBreakdown[];
  };
};

export async function generateStrategyPdf(result: unknown) {
  const webhookResult = result as WebhookResult;
  
  if (!webhookResult?.output) {
    throw new Error("Invalid result format");
  }

  const { output } = webhookResult;
  const doc = new jsPDF();
  
  // Configuration
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  const contentWidth = pageWidth - 2 * margin;
  let yPosition = margin;

  // Helper function to add new page if needed
  const checkPageBreak = (requiredSpace: number) => {
    if (yPosition + requiredSpace > pageHeight - margin) {
      doc.addPage();
      yPosition = margin;
      return true;
    }
    return false;
  };

  // Helper function to wrap text
  const addWrappedText = (
    text: string,
    x: number,
    y: number,
    maxWidth: number,
    lineHeight: number = 7
  ): number => {
    const lines = doc.splitTextToSize(text, maxWidth);
    lines.forEach((line: string, index: number) => {
      checkPageBreak(lineHeight);
      doc.text(line, x, y + index * lineHeight);
    });
    return y + lines.length * lineHeight;
  };

  // Header with gradient effect (simulated with rectangles)
  doc.setFillColor(139, 92, 246); // Purple
  doc.rect(0, 0, pageWidth, 40, "F");
  
  // Add pink overlay for gradient effect
  doc.setFillColor(236, 72, 153); // Pink
  doc.rect(pageWidth / 2, 0, pageWidth / 2, 40, "F");

  // Title
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont("helvetica", "bold");
  doc.text("Strategy Report", margin, 25);

  // Reset text color
  doc.setTextColor(0, 0, 0);
  yPosition = 50;

  // Client Information Section
  doc.setFillColor(249, 250, 251);
  doc.rect(margin, yPosition, contentWidth, 35, "F");
  
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(107, 114, 128);
  doc.text("DELIVERABLE TYPE", margin + 5, yPosition + 8);
  
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(139, 92, 246);
  doc.text(output.deliverableType, margin + 5, yPosition + 15);

  doc.setFontSize(16);
  doc.setTextColor(0, 0, 0);
  doc.text(output.clientName, margin + 5, yPosition + 25);

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(107, 114, 128);
  yPosition = addWrappedText(
    output.deliverablesRequested,
    margin + 5,
    yPosition + 30,
    contentWidth - 10
  );

  yPosition += 15;

  // Final Output Section
  checkPageBreak(20);
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(0, 0, 0);
  doc.text("📦 Final Output", margin, yPosition);
  yPosition += 10;

  output.finalOutput.forEach((item, index) => {
    checkPageBreak(30);
    
    // Deliverable box
    doc.setFillColor(239, 246, 255);
    doc.setDrawColor(191, 219, 254);
    const boxHeight = 15;
    doc.rect(margin, yPosition, contentWidth, boxHeight, "FD");
    
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(59, 130, 246);
    doc.text(`Deliverable ${index + 1}`, margin + 5, yPosition + 10);
    
    yPosition += boxHeight + 5;

    // Render deliverable content
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(55, 65, 81);
    
    const content = formatDeliverableContent(item);
    yPosition = addWrappedText(content, margin + 5, yPosition, contentWidth - 10, 6);
    yPosition += 8;
  });

  // Strategic Reasoning Section
  if (output.reasoning && output.reasoning.length > 0) {
    checkPageBreak(20);
    yPosition += 5;
    
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(0, 0, 0);
    doc.text("🎯 Strategic Reasoning", margin, yPosition);
    yPosition += 10;

    output.reasoning.forEach((reason, index) => {
      checkPageBreak(25);
      
      // Number badge
      doc.setFillColor(16, 185, 129);
      doc.circle(margin + 5, yPosition + 3, 4, "F");
      
      doc.setFontSize(9);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(255, 255, 255);
      doc.text(`${index + 1}`, margin + 5, yPosition + 4.5, { align: "center" });
      
      // Reason text
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(55, 65, 81);
      yPosition = addWrappedText(reason, margin + 15, yPosition + 5, contentWidth - 20, 6);
      yPosition += 8;
    });
  }

  // Task Breakdown Section
  if (output.task_breakdown && output.task_breakdown.length > 0) {
    checkPageBreak(20);
    yPosition += 5;
    
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(0, 0, 0);
    doc.text("✅ Task Breakdown", margin, yPosition);
    yPosition += 10;

    output.task_breakdown.forEach((task) => {
      checkPageBreak(25);
      
      // Task number box
      doc.setFillColor(139, 92, 246);
      doc.roundedRect(margin + 2, yPosition, 8, 8, 2, 2, "F");
      
      doc.setFontSize(9);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(255, 255, 255);
      doc.text(`${task.task}`, margin + 6, yPosition + 6, { align: "center" });
      
      // Task details
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(55, 65, 81);
      yPosition = addWrappedText(task.details, margin + 15, yPosition + 6, contentWidth - 20, 6);
      yPosition += 8;
    });
  }

  // Footer
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(156, 163, 175);
    doc.text(
      `Generated on ${new Date().toLocaleDateString()} | Page ${i} of ${totalPages}`,
      pageWidth / 2,
      pageHeight - 10,
      { align: "center" }
    );
  }

  // Download the PDF
  const fileName = `${output.clientName.replace(/\s+/g, "_")}_Strategy_${new Date().toISOString().split("T")[0]}.pdf`;
  doc.save(fileName);
}

function formatDeliverableContent(item: unknown): string {
  if (typeof item === "string") {
    try {
      const parsed = JSON.parse(item);
      return formatDeliverableContent(parsed);
    } catch {
      return item;
    }
  }

  if (Array.isArray(item)) {
    return item.map((sub, i) => `${i + 1}. ${formatDeliverableContent(sub)}`).join("\n");
  }

  if (typeof item === "object" && item !== null) {
    return Object.entries(item)
      .map(([key, value]) => {
        const formattedKey = key.replace(/_/g, " ").toUpperCase();
        const formattedValue = typeof value === "object" 
          ? JSON.stringify(value, null, 2) 
          : String(value);
        return `${formattedKey}: ${formattedValue}`;
      })
      .join("\n");
  }

  return String(item);
}
