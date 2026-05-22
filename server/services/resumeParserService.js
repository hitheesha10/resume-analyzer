import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf.mjs";

export const parseResumePDF = async (fileBuffer) => {
  try {
    if (!fileBuffer || fileBuffer.length === 0) {
      throw new Error("Empty file buffer");
    }
    
    const uint8Array = new Uint8Array(fileBuffer);
    const loadingTask = pdfjsLib.getDocument({ data: uint8Array });
    const pdf = await loadingTask.promise;
    
    let fullText = "";
    
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items
        .map(item => item.str)
        .join(" ");
      fullText += pageText + "\n";
    }
    
    // Clean up text
    const cleanedText = fullText
      .replace(/\s+/g, " ")
      .replace(/[^\w\s.,!?-]/g, "")
      .trim();
    
    if (cleanedText.length < 50) {
      throw new Error("Could not extract meaningful text from PDF");
    }
    
    return {
      success: true,
      text: cleanedText,
      pageCount: pdf.numPages,
      wordCount: cleanedText.split(/\s+/).length
    };
  } catch (error) {
    console.error("PDF Parse Error:", error);
    return {
      success: false,
      error: error.message
    };
  }
};