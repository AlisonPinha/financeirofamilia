import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/supabase/auth-helper";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface ExtractedTransaction {
  descricao: string;
  valor: number;
  data: string;
  tipo: "SAIDA" | "ENTRADA";
  categoria?: string;
}

interface ExtractionResult {
  type: "boleto" | "fatura";
  transactions: ExtractedTransaction[];
}

// POST /api/ocr - Process image/PDF and extract transaction data
export async function POST(request: NextRequest) {
  try {
    // Autenticação obrigatória
    const auth = await getAuthenticatedUser();
    if (auth.error) return auth.error;

    // Verificar se API key está configurada
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: "Serviço de OCR não configurado" },
        { status: 503 }
      );
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const documentType = formData.get("type") as string | null; // "boleto" ou "fatura"

    if (!file) {
      return NextResponse.json(
        { error: "Arquivo não enviado" },
        { status: 400 }
      );
    }

    // Validar tipo de arquivo
    const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp", "application/pdf"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Tipo de arquivo não suportado. Use JPG, PNG, GIF, WebP ou PDF." },
        { status: 400 }
      );
    }

    // Validar tamanho (máx 10MB)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: "Arquivo muito grande. Tamanho máximo: 10MB" },
        { status: 400 }
      );
    }

    // Convert file to base64
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64 = buffer.toString("base64");

    // Determine media type
    const mimeType = file.type || "image/jpeg";
    const dataUrl = `data:${mimeType};base64,${base64}`;

    // Different prompts for boleto vs fatura
    const prompt = documentType === "fatura"
      ? `Analise esta fatura de cartão de crédito do Bradesco ou outro banco brasileiro.

         Extraia TODAS as transações listadas na fatura. Para cada transação, extraia:
         - descricao: nome do estabelecimento ou descrição da compra
         - valor: valor em reais (apenas número, sem R$)
         - data: data da transação no formato YYYY-MM-DD
         - tipo: sempre "SAIDA" para despesas de cartão
         - categoria: tente identificar a categoria (Alimentação, Transporte, Compras, Assinaturas, Lazer, Saúde, Educação, Outros)

         Retorne APENAS um JSON válido no formato:
         {
           "type": "fatura",
           "transactions": [
             { "descricao": "...", "valor": 99.90, "data": "2024-01-15", "tipo": "SAIDA", "categoria": "..." },
             ...
           ]
         }

         Se não conseguir identificar a data exata, use a data de vencimento da fatura.
         NÃO inclua o valor total da fatura, apenas as transações individuais.`
      : `Analise este boleto bancário brasileiro.

         Extraia as seguintes informações:
         - descricao: nome do beneficiário/cedente (empresa que vai receber o pagamento)
         - valor: valor do boleto em reais (apenas número, sem R$)
         - data: data de vencimento no formato YYYY-MM-DD
         - tipo: sempre "SAIDA"
         - categoria: tente identificar a categoria baseado no beneficiário (Moradia, Saúde, Educação, Assinaturas, Outros)

         Retorne APENAS um JSON válido no formato:
         {
           "type": "boleto",
           "transactions": [
             { "descricao": "...", "valor": 99.90, "data": "2024-01-15", "tipo": "SAIDA", "categoria": "..." }
           ]
         }`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: prompt,
            },
            {
              type: "image_url",
              image_url: {
                url: dataUrl,
                detail: "high",
              },
            },
          ],
        },
      ],
      max_tokens: 4096,
    });

    const content = response.choices[0]?.message?.content;

    if (!content) {
      return NextResponse.json(
        { error: "Não foi possível processar o documento" },
        { status: 500 }
      );
    }

    // Parse JSON from response (handle markdown code blocks)
    let jsonContent = content;
    if (content.includes("```json")) {
      jsonContent = content.replace(/```json\n?/g, "").replace(/```\n?/g, "");
    } else if (content.includes("```")) {
      jsonContent = content.replace(/```\n?/g, "");
    }

    try {
      const result: ExtractionResult = JSON.parse(jsonContent.trim());

      // Validate and clean the data
      const cleanedTransactions = result.transactions.map((t) => ({
        descricao: t.descricao || "Transação importada",
        valor: typeof t.valor === "number" ? t.valor : parseFloat(String(t.valor).replace(",", ".")),
        data: t.data || new Date().toISOString().split("T")[0],
        tipo: t.tipo || "SAIDA",
        categoria: t.categoria || "Outros",
      }));

      return NextResponse.json({
        success: true,
        type: result.type,
        transactions: cleanedTransactions,
        count: cleanedTransactions.length,
      });
    } catch {
      console.error("Erro ao interpretar resposta OCR:", content);
      return NextResponse.json(
        { error: "Erro ao interpretar os dados do documento" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Erro no OCR:", error);
    return NextResponse.json(
      { error: "Erro ao processar documento" },
      { status: 500 }
    );
  }
}
