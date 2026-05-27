import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { html, filename } = body ?? {};
    if (!html) return NextResponse.json({ error: "HTML requerido" }, { status: 400 });

    // Step 1: Create PDF generation request
    const createResponse = await fetch("https://apps.abacus.ai/api/createConvertHtmlToPdfRequest", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        deployment_token: process.env.ABACUSAI_API_KEY,
        html_content: html,
        pdf_options: {
          format: "A4",
          print_background: true,
          margin: { top: "10mm", right: "10mm", bottom: "10mm", left: "10mm" },
        },
        base_url: process.env.NEXTAUTH_URL || "",
      }),
    });

    if (!createResponse.ok) {
      const error = await createResponse.json().catch(() => ({ error: "Failed to create PDF request" }));
      return NextResponse.json({ error: error?.error }, { status: 500 });
    }

    const { request_id } = await createResponse.json();
    if (!request_id) {
      return NextResponse.json({ error: "No request ID returned" }, { status: 500 });
    }

    // Step 2: Poll for status until completion
    const maxAttempts = 300;
    let attempts = 0;

    while (attempts < maxAttempts) {
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const statusResponse = await fetch("https://apps.abacus.ai/api/getConvertHtmlToPdfStatus", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ request_id, deployment_token: process.env.ABACUSAI_API_KEY }),
      });

      const statusResult = await statusResponse.json();
      const status = statusResult?.status || "FAILED";
      const result = statusResult?.result || null;

      if (status === "SUCCESS") {
        if (result && result.result) {
          const pdfBuffer = Buffer.from(result.result, "base64");
          return new NextResponse(pdfBuffer, {
            headers: {
              "Content-Type": "application/pdf",
              "Content-Disposition": `attachment; filename="${filename || "report"}.pdf"`,
            },
          });
        } else {
          return NextResponse.json({ error: "PDF generation completed but no result data" }, { status: 500 });
        }
      } else if (status === "FAILED") {
        const errorMsg = result?.error || "PDF generation failed";
        return NextResponse.json({ error: errorMsg }, { status: 500 });
      }

      attempts++;
    }

    return NextResponse.json({ error: "PDF generation timed out" }, { status: 500 });
  } catch (e: any) {
    console.error(e);
    return NextResponse.json({ error: e?.message ?? "Error" }, { status: 500 });
  }
}
